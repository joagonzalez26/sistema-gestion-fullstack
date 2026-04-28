from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel
from sqlmodel import col, select

from app.api.deps import CurrentUser, SessionDep
from app.models import Client, DetalleVenta, Item, Venta

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


class RecentProduct(BaseModel):
    id: str
    title: str
    price: float
    stock: int


class RecentClient(BaseModel):
    id: str
    name: str
    email: str | None
    is_active: bool


class RecentVenta(BaseModel):
    id: str
    client_name: str
    total: float
    items_count: int
    created_at: datetime | None


class DashboardSummary(BaseModel):
    # Inventario
    total_products: int
    total_clients: int
    active_clients: int
    out_of_stock: int
    low_stock: int
    inventory_value: float
    # Ventas
    ventas_hoy: int
    ventas_mes: int
    ingresos_hoy: float
    ingresos_mes: float
    ingresos_totales: float
    # Listas recientes
    recent_products: list[RecentProduct]
    recent_clients: list[RecentClient]
    recent_ventas: list[RecentVenta]


@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(
    session: SessionDep,
    current_user: CurrentUser,
) -> Any:
    """
    Resumen completo del sistema para el dashboard.
    Una sola llamada — aparece en /docs.
    """
    now = datetime.now(timezone.utc)
    inicio_hoy = now.replace(hour=0, minute=0, second=0, microsecond=0)
    inicio_mes = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    if current_user.is_superuser:
        items_stmt = select(Item).order_by(col(Item.created_at).desc())
        clients_stmt = select(Client).order_by(col(Client.created_at).desc())
        ventas_stmt = select(Venta).order_by(col(Venta.created_at).desc())
        ventas_hoy_stmt = select(Venta).where(col(Venta.created_at) >= inicio_hoy)
        ventas_mes_stmt = select(Venta).where(col(Venta.created_at) >= inicio_mes)
    else:
        items_stmt = (
            select(Item)
            .where(Item.owner_id == current_user.id)
            .order_by(col(Item.created_at).desc())
        )
        clients_stmt = (
            select(Client)
            .where(Client.owner_id == current_user.id)
            .order_by(col(Client.created_at).desc())
        )
        ventas_stmt = (
            select(Venta)
            .where(Venta.owner_id == current_user.id)
            .order_by(col(Venta.created_at).desc())
        )
        ventas_hoy_stmt = (
            select(Venta)
            .where(Venta.owner_id == current_user.id)
            .where(col(Venta.created_at) >= inicio_hoy)
        )
        ventas_mes_stmt = (
            select(Venta)
            .where(Venta.owner_id == current_user.id)
            .where(col(Venta.created_at) >= inicio_mes)
        )

    items = session.exec(items_stmt).all()
    clients = session.exec(clients_stmt).all()
    ventas_todas = session.exec(ventas_stmt).all()
    ventas_hoy = session.exec(ventas_hoy_stmt).all()
    ventas_mes = session.exec(ventas_mes_stmt).all()

    return DashboardSummary(
        # Inventario
        total_products=len(items),
        total_clients=len(clients),
        active_clients=sum(1 for c in clients if c.is_active),
        out_of_stock=sum(1 for i in items if int(i.stock or 0) == 0),
        low_stock=sum(1 for i in items if 0 < int(i.stock or 0) <= 5),
        inventory_value=sum(float(i.price or 0) * int(i.stock or 0) for i in items),
        # Ventas
        ventas_hoy=len(ventas_hoy),
        ventas_mes=len(ventas_mes),
        ingresos_hoy=sum(v.total for v in ventas_hoy),
        ingresos_mes=sum(v.total for v in ventas_mes),
        ingresos_totales=sum(v.total for v in ventas_todas),
        # Listas
        recent_products=[
            RecentProduct(id=str(i.id), title=i.title, price=float(i.price or 0), stock=int(i.stock or 0))
            for i in items[:5]
        ],
        recent_clients=[
            RecentClient(id=str(c.id), name=c.name, email=c.email, is_active=c.is_active)
            for c in clients[:5]
        ],
        recent_ventas=[
            RecentVenta(
                id=str(v.id),
                client_name=v.client.name if v.client else "Desconocido",
                total=v.total,
                items_count=len(v.detalles),
                created_at=v.created_at,
            )
            for v in ventas_todas[:5]
        ],
    )

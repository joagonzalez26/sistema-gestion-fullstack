import csv
import io
from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlmodel import col, select

from app.api.deps import CurrentUser, SessionDep
from app.models import Client, DetalleVenta, Item, Venta

router = APIRouter(prefix="/reportes", tags=["reportes"])


# ── Schemas ───────────────────────────────────────────────────────────────────

class ProductoVendido(BaseModel):
    item_id: str
    item_title: str
    total_quantity: int
    total_revenue: float


class ClienteTop(BaseModel):
    client_id: str
    client_name: str
    total_ventas: int
    total_gastado: float


class VentaResumen(BaseModel):
    id: str
    client_name: str
    total: float
    items_count: int
    created_at: datetime | None


class StockAlerta(BaseModel):
    item_id: str
    title: str
    stock: int
    status: str   # "sin_stock" | "bajo"


class ReportesResumen(BaseModel):
    periodo_dias: int
    total_ventas: int
    ingresos_periodo: float
    ingresos_totales: float
    productos_mas_vendidos: list[ProductoVendido]
    clientes_top: list[ClienteTop]
    ultimas_ventas: list[VentaResumen]
    alertas_stock: list[StockAlerta]


# ── Helpers ───────────────────────────────────────────────────────────────────

def _since(days: int) -> datetime:
    return datetime.now(timezone.utc) - timedelta(days=days)


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/resumen", response_model=ReportesResumen)
def get_resumen(
    session: SessionDep,
    current_user: CurrentUser,
    dias: int = 30,
) -> Any:
    """
    Devuelve el resumen de reportes para el período solicitado.
    `dias` puede ser 1 (hoy), 7, 30 u otro valor.
    """
    since = _since(dias)

    # ── Ventas del período ────────────────────────────────────────────────────
    if current_user.is_superuser:
        ventas_stmt = select(Venta).where(col(Venta.created_at) >= since)
        ventas_todas_stmt = select(Venta)
        items_stmt = select(Item)
    else:
        ventas_stmt = (
            select(Venta)
            .where(Venta.owner_id == current_user.id)
            .where(col(Venta.created_at) >= since)
        )
        ventas_todas_stmt = select(Venta).where(Venta.owner_id == current_user.id)
        items_stmt = select(Item).where(Item.owner_id == current_user.id)

    ventas_periodo = session.exec(ventas_stmt.order_by(col(Venta.created_at).desc())).all()
    ventas_todas = session.exec(ventas_todas_stmt).all()
    items = session.exec(items_stmt).all()

    total_ventas = len(ventas_periodo)
    ingresos_periodo = sum(v.total for v in ventas_periodo)
    ingresos_totales = sum(v.total for v in ventas_todas)

    # ── Productos más vendidos (en el período) ────────────────────────────────
    prod_counts: dict[str, dict] = {}
    for v in ventas_periodo:
        for d in v.detalles:
            key = str(d.item_id)
            if key not in prod_counts:
                prod_counts[key] = {
                    "item_id": key,
                    "item_title": d.item_title,
                    "total_quantity": 0,
                    "total_revenue": 0.0,
                }
            prod_counts[key]["total_quantity"] += d.quantity
            prod_counts[key]["total_revenue"] += d.subtotal

    productos_mas_vendidos = sorted(
        [ProductoVendido(**v) for v in prod_counts.values()],
        key=lambda p: p.total_quantity,
        reverse=True,
    )[:10]

    # ── Clientes top (en el período) ──────────────────────────────────────────
    client_counts: dict[str, dict] = {}
    for v in ventas_periodo:
        key = str(v.client_id)
        client_name = v.client.name if v.client else "Desconocido"
        if key not in client_counts:
            client_counts[key] = {
                "client_id": key,
                "client_name": client_name,
                "total_ventas": 0,
                "total_gastado": 0.0,
            }
        client_counts[key]["total_ventas"] += 1
        client_counts[key]["total_gastado"] += v.total

    clientes_top = sorted(
        [ClienteTop(**v) for v in client_counts.values()],
        key=lambda c: c.total_gastado,
        reverse=True,
    )[:10]

    # ── Últimas ventas ────────────────────────────────────────────────────────
    ultimas_ventas = [
        VentaResumen(
            id=str(v.id),
            client_name=v.client.name if v.client else "Desconocido",
            total=v.total,
            items_count=len(v.detalles),
            created_at=v.created_at,
        )
        for v in ventas_periodo[:10]
    ]

    # ── Alertas de stock ──────────────────────────────────────────────────────
    alertas_stock = []
    for item in items:
        stock = int(item.stock or 0)
        if stock == 0:
            alertas_stock.append(StockAlerta(item_id=str(item.id), title=item.title, stock=stock, status="sin_stock"))
        elif stock <= 5:
            alertas_stock.append(StockAlerta(item_id=str(item.id), title=item.title, stock=stock, status="bajo"))

    alertas_stock.sort(key=lambda a: a.stock)

    return ReportesResumen(
        periodo_dias=dias,
        total_ventas=total_ventas,
        ingresos_periodo=ingresos_periodo,
        ingresos_totales=ingresos_totales,
        productos_mas_vendidos=productos_mas_vendidos,
        clientes_top=clientes_top,
        ultimas_ventas=ultimas_ventas,
        alertas_stock=alertas_stock,
    )


@router.get("/exportar-csv")
def exportar_csv(
    session: SessionDep,
    current_user: CurrentUser,
    dias: int = 30,
) -> StreamingResponse:
    """
    Exporta las ventas del período como archivo CSV.
    """
    since = _since(dias)

    if current_user.is_superuser:
        stmt = select(Venta).where(col(Venta.created_at) >= since)
    else:
        stmt = (
            select(Venta)
            .where(Venta.owner_id == current_user.id)
            .where(col(Venta.created_at) >= since)
        )

    ventas = session.exec(stmt.order_by(col(Venta.created_at).desc())).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Fecha", "Cliente", "Producto", "Cantidad", "Precio unitario", "Subtotal", "Total venta"])

    for venta in ventas:
        client_name = venta.client.name if venta.client else "Desconocido"
        fecha = venta.created_at.strftime("%Y-%m-%d %H:%M") if venta.created_at else ""
        for detalle in venta.detalles:
            writer.writerow([
                fecha,
                client_name,
                detalle.item_title,
                detalle.quantity,
                f"{detalle.unit_price:.2f}",
                f"{detalle.subtotal:.2f}",
                f"{venta.total:.2f}",
            ])

    output.seek(0)
    filename = f"ventas_{dias}dias.csv"
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )

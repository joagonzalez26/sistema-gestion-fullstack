import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import col, func, select

from app.api.deps import CurrentUser, SessionDep
from app.models import (
    Client,
    DetalleVenta,
    DetalleVentaPublic,
    Item,
    Message,
    Venta,
    VentaCreate,
    VentaPublic,
    VentasPublic,
)

router = APIRouter(prefix="/ventas", tags=["ventas"])


def _build_venta_public(venta: Venta) -> VentaPublic:
    """Construye VentaPublic desde una Venta ORM con client y detalles cargados."""
    client_name = venta.client.name if venta.client else "Cliente eliminado"
    detalles = [
        DetalleVentaPublic(
            id=d.id,
            item_id=d.item_id,
            item_title=d.item_title,
            quantity=d.quantity,
            unit_price=d.unit_price,
            subtotal=d.subtotal,
        )
        for d in venta.detalles
    ]
    return VentaPublic(
        id=venta.id,
        client_id=venta.client_id,
        client_name=client_name,
        owner_id=venta.owner_id,
        total=venta.total,
        created_at=venta.created_at,
        items_count=len(detalles),
        detalles=detalles,
    )


@router.get("/", response_model=VentasPublic)
def read_ventas(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 50,
) -> Any:
    """Lista todas las ventas del usuario, ordenadas por fecha descendente."""
    if current_user.is_superuser:
        count_stmt = select(func.count()).select_from(Venta)
        stmt = (
            select(Venta).order_by(col(Venta.created_at).desc()).offset(skip).limit(limit)
        )
    else:
        count_stmt = (
            select(func.count())
            .select_from(Venta)
            .where(Venta.owner_id == current_user.id)
        )
        stmt = (
            select(Venta)
            .where(Venta.owner_id == current_user.id)
            .order_by(col(Venta.created_at).desc())
            .offset(skip)
            .limit(limit)
        )
    count = session.exec(count_stmt).one()
    ventas = session.exec(stmt).all()
    data = [_build_venta_public(v) for v in ventas]
    return VentasPublic(data=data, count=count)


@router.get("/{id}", response_model=VentaPublic)
def read_venta(
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
) -> Any:
    """Devuelve una venta por ID con sus detalles completos."""
    venta = session.get(Venta, id)
    if not venta:
        raise HTTPException(status_code=404, detail="Venta no encontrada")
    if not current_user.is_superuser and venta.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Sin permisos")
    return _build_venta_public(venta)


@router.post("/", response_model=VentaPublic)
def create_venta(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    venta_in: VentaCreate,
) -> Any:
    """
    Crea una venta nueva.
    - Valida que el cliente exista y pertenezca al usuario.
    - Valida que cada producto exista y tenga stock suficiente.
    - Descuenta stock de cada producto.
    - Si cualquier validación falla, no se modifica nada (transaccional).
    """
    # 1. Validar cliente
    client = session.get(Client, venta_in.client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    if not current_user.is_superuser and client.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Cliente no pertenece a este usuario")

    # 2. Validar todos los items ANTES de tocar stock
    items_resueltos: list[tuple[Item, int]] = []
    for linea in venta_in.items:
        item = session.get(Item, linea.item_id)
        if not item:
            raise HTTPException(
                status_code=404,
                detail=f"Producto con id {linea.item_id} no encontrado",
            )
        if not current_user.is_superuser and item.owner_id != current_user.id:
            raise HTTPException(
                status_code=403,
                detail=f"Producto '{item.title}' no pertenece a este usuario",
            )
        if int(item.stock) < linea.quantity:
            raise HTTPException(
                status_code=422,
                detail=f"Stock insuficiente para '{item.title}': disponible {item.stock}, solicitado {linea.quantity}",
            )
        items_resueltos.append((item, linea.quantity))

    # 3. Calcular total
    total = sum(
        float(item.price) * quantity for item, quantity in items_resueltos
    )

    # 4. Crear venta
    venta = Venta(
        client_id=venta_in.client_id,
        owner_id=current_user.id,
        total=total,
    )
    session.add(venta)
    session.flush()  # obtener venta.id sin commit todavía

    # 5. Crear detalles y descontar stock
    for item, quantity in items_resueltos:
        subtotal = float(item.price) * quantity
        detalle = DetalleVenta(
            venta_id=venta.id,
            item_id=item.id,
            item_title=item.title,
            quantity=quantity,
            unit_price=float(item.price),
            subtotal=subtotal,
        )
        session.add(detalle)
        item.stock = int(item.stock) - quantity
        session.add(item)

    # 6. Commit atómico
    session.commit()
    session.refresh(venta)
    return _build_venta_public(venta)


@router.delete("/{id}", response_model=Message)
def delete_venta(
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
) -> Any:
    """
    Anula (elimina) una venta y devuelve el stock a los productos.
    """
    venta = session.get(Venta, id)
    if not venta:
        raise HTTPException(status_code=404, detail="Venta no encontrada")
    if not current_user.is_superuser and venta.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Sin permisos")

    # Devolver stock
    for detalle in venta.detalles:
        item = session.get(Item, detalle.item_id)
        if item:
            item.stock = int(item.stock) + detalle.quantity
            session.add(item)

    session.delete(venta)
    session.commit()
    return Message(message="Venta anulada correctamente y stock restaurado")

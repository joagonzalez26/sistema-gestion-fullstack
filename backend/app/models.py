import uuid
from datetime import datetime, timezone

from pydantic import EmailStr
from sqlalchemy import DateTime
from sqlmodel import Field, Relationship, SQLModel


def get_datetime_utc() -> datetime:
    return datetime.now(timezone.utc)


# =========================
# USER
# =========================
class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    is_active: bool = True
    is_superuser: bool = False
    full_name: str | None = Field(default=None, max_length=255)


class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=128)


class UserRegister(SQLModel):
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=128)
    full_name: str | None = Field(default=None, max_length=255)


class UserUpdate(UserBase):
    email: EmailStr | None = Field(default=None, max_length=255)  # type: ignore[assignment]
    password: str | None = Field(default=None, min_length=8, max_length=128)


class UserUpdateMe(SQLModel):
    full_name: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = Field(default=None, max_length=255)


class UpdatePassword(SQLModel):
    current_password: str = Field(min_length=8, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)


class User(UserBase, table=True):
    __tablename__ = "user"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: str
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),
    )
    items: list["Item"] = Relationship(back_populates="owner", cascade_delete=True)
    clients: list["Client"] = Relationship(back_populates="owner", cascade_delete=True)
    ventas: list["Venta"] = Relationship(back_populates="owner", cascade_delete=True)


class UserPublic(UserBase):
    id: uuid.UUID
    created_at: datetime | None = None


class UsersPublic(SQLModel):
    data: list[UserPublic]
    count: int


# =========================
# ITEM / PRODUCTO
# =========================
class ItemBase(SQLModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=255)
    price: float = Field(default=0, ge=0)
    stock: int = Field(default=0, ge=0)


class ItemCreate(ItemBase):
    pass


class ItemUpdate(SQLModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)  # type: ignore[assignment]
    description: str | None = Field(default=None, max_length=255)
    price: float | None = Field(default=None, ge=0)
    stock: int | None = Field(default=None, ge=0)


class Item(ItemBase, table=True):
    __tablename__ = "item"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),
    )
    owner_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE"
    )
    owner: User | None = Relationship(back_populates="items")


class ItemPublic(ItemBase):
    id: uuid.UUID
    owner_id: uuid.UUID
    created_at: datetime | None = None


class ItemsPublic(SQLModel):
    data: list[ItemPublic]
    count: int


# =========================
# CLIENTE
# =========================
class ClientBase(SQLModel):
    name: str = Field(min_length=1, max_length=255)
    email: EmailStr | None = Field(default=None, max_length=255)
    phone: str | None = Field(default=None, max_length=50)
    address: str | None = Field(default=None, max_length=255)
    notes: str | None = Field(default=None, max_length=500)
    is_active: bool = True


class ClientCreate(ClientBase):
    pass


class ClientUpdate(SQLModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)  # type: ignore[assignment]
    email: EmailStr | None = Field(default=None, max_length=255)
    phone: str | None = Field(default=None, max_length=50)
    address: str | None = Field(default=None, max_length=255)
    notes: str | None = Field(default=None, max_length=500)
    is_active: bool | None = None


class Client(ClientBase, table=True):
    __tablename__ = "client"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),
    )
    owner_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE"
    )
    owner: User | None = Relationship(back_populates="clients")


class ClientPublic(ClientBase):
    id: uuid.UUID
    owner_id: uuid.UUID
    created_at: datetime | None = None


class ClientsPublic(SQLModel):
    data: list[ClientPublic]
    count: int


# =========================
# VENTA
# =========================
class DetalleVenta(SQLModel, table=True):
    __tablename__ = "detalle_venta"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    venta_id: uuid.UUID = Field(foreign_key="venta.id", ondelete="CASCADE")
    item_id: uuid.UUID = Field(foreign_key="item.id", ondelete="RESTRICT")
    item_title: str = Field(max_length=255)   # snapshot del nombre al momento de vender
    quantity: int = Field(ge=1)
    unit_price: float = Field(ge=0)           # snapshot del precio al momento de vender
    subtotal: float = Field(ge=0)

    venta: "Venta" = Relationship(back_populates="detalles")


class Venta(SQLModel, table=True):
    __tablename__ = "venta"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    client_id: uuid.UUID = Field(foreign_key="client.id", ondelete="RESTRICT")
    owner_id: uuid.UUID = Field(foreign_key="user.id", ondelete="CASCADE")
    total: float = Field(default=0, ge=0)
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),
    )

    client: Client | None = Relationship()
    detalles: list[DetalleVenta] = Relationship(back_populates="venta", cascade_delete=True)
    owner: User | None = Relationship(back_populates="ventas")


# ── Schemas for Ventas ──────────────────────────────────────────────────────

class VentaItemCreate(SQLModel):
    item_id: uuid.UUID
    quantity: int = Field(ge=1)


class VentaCreate(SQLModel):
    client_id: uuid.UUID
    items: list[VentaItemCreate] = Field(min_length=1)


class DetalleVentaPublic(SQLModel):
    id: uuid.UUID
    item_id: uuid.UUID
    item_title: str
    quantity: int
    unit_price: float
    subtotal: float


class VentaPublic(SQLModel):
    id: uuid.UUID
    client_id: uuid.UUID
    client_name: str
    owner_id: uuid.UUID
    total: float
    created_at: datetime | None = None
    items_count: int
    detalles: list[DetalleVentaPublic] = []


class VentasPublic(SQLModel):
    data: list[VentaPublic]
    count: int


# =========================
# GENERIC / AUTH
# =========================
class Message(SQLModel):
    message: str


class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"


class TokenPayload(SQLModel):
    sub: str | None = None


class NewPassword(SQLModel):
    token: str
    new_password: str = Field(min_length=8, max_length=128)

"""Add venta and detalle_venta tables

Revision ID: b5c8d1e9f2a0
Revises: a3f9c2b17e04
Create Date: 2026-04-22 10:00:00.000000

"""
import sqlalchemy as sa
import sqlmodel.sql.sqltypes
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "b5c8d1e9f2a0"
down_revision = "a3f9c2b17e04"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "venta",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("client_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("owner_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("total", sa.Float(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["client_id"], ["client.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["owner_id"], ["user.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_venta_created_at", "venta", ["created_at"])
    op.create_index("ix_venta_owner_id", "venta", ["owner_id"])

    op.create_table(
        "detalle_venta",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("venta_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("item_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            "item_title", sqlmodel.sql.sqltypes.AutoString(length=255), nullable=False
        ),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("unit_price", sa.Float(), nullable=False),
        sa.Column("subtotal", sa.Float(), nullable=False),
        sa.ForeignKeyConstraint(["venta_id"], ["venta.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["item_id"], ["item.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade():
    op.drop_table("detalle_venta")
    op.drop_index("ix_venta_owner_id", table_name="venta")
    op.drop_index("ix_venta_created_at", table_name="venta")
    op.drop_table("venta")

from fastapi import APIRouter

from app.api.routes import (
    asistente,
    clientes,
    dashboard,
    items,
    login,
    private,
    reportes,
    users,
    utils,
    ventas,
)

api_router = APIRouter()
api_router.include_router(login.router)
api_router.include_router(users.router)
api_router.include_router(utils.router)
api_router.include_router(items.router)
api_router.include_router(clientes.router)
api_router.include_router(ventas.router)
api_router.include_router(reportes.router)
api_router.include_router(dashboard.router)
api_router.include_router(asistente.router)
api_router.include_router(private.router)

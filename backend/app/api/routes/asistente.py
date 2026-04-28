import os
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.api.deps import CurrentUser

router = APIRouter(prefix="/asistente", tags=["asistente"])


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]


class ChatResponse(BaseModel):
    reply: str
    is_demo: bool = False


# ── Respuestas locales para modo demo ────────────────────────────────────────

_DEMO_KB: list[tuple[list[str], str]] = [
    # ── Reglas específicas primero ────────────────────────────────────────────
    (
        ["analizar stock", "stock bajo", "reposición", "reabastecer", "productos agotados"],
        "Para analizar el stock de tu negocio:\n\n"
        "- El **Dashboard** muestra productos con stock bajo (≤ 5 unidades) y agotados.\n"
        "- La sección **Stock** tiene vista dedicada con filtros por estado.\n"
        "- **Stock = 0**: requieren reposición urgente.\n"
        "- **Stock ≤ 5**: son los próximos en agotarse.\n\n"
        "Recomendación: revisá el stock de tus productos estrella semanalmente.",
    ),
    (
        ["resumen de ventas", "resumen ventas", "reporte ventas", "analizar ventas", "ventas totales"],
        "Para ver el resumen de tus ventas tenés varias opciones:\n\n"
        "- **Dashboard**: ventas de hoy, del mes e ingresos totales en tiempo real.\n"
        "- **Ventas**: listado completo con cliente, productos, total y fecha.\n"
        "- **Reportes**: métricas consolidadas, comparativas y exportables.\n\n"
        "¿Querés analizar un período específico o el historial completo?",
    ),
    (
        ["clientes destacados", "clientes frecuentes", "mejores clientes", "clientes importantes", "clientes vip"],
        "Para identificar tus **clientes destacados** te recomiendo:\n\n"
        "- Revisá **Ventas** y filtrá por cliente para ver quién compra más.\n"
        "- En **Clientes** podés ver el listado completo y su estado (activo/inactivo).\n"
        "- Los **Reportes** muestran métricas agrupadas que ayudan a identificar patrones.\n\n"
        "Los clientes con más compras son tus activos más valiosos — priorizalos.",
    ),
    (
        ["productos más importantes", "productos destacados", "mejores productos", "más vendidos", "rotación"],
        "Para identificar tus **productos más importantes**:\n\n"
        "- Revisá **Ventas** para ver qué productos aparecen más en los detalles.\n"
        "- En **Stock** podés ver qué productos se agotan con más frecuencia (alta rotación).\n"
        "- Los productos con **stock bajo frecuente** suelen ser los más demandados.\n"
        "- El **valor del inventario** en el dashboard muestra el peso económico de cada ítem.\n\n"
        "Priorizá reponer primero los que más se venden para no perder ventas.",
    ),
    (
        ["ideas", "mejorar", "negocio", "sugerencias", "consejos", "gestión", "optimizar"],
        "Algunas ideas para mejorar tu negocio con este sistema:\n\n"
        "**1. Revisá el stock regularmente** — mantené siempre productos con stock positivo.\n"
        "**2. Analizá tus ventas** — identificá qué productos se venden más y en qué períodos.\n"
        "**3. Segmentá clientes** — marcá como inactivos a los que no compraron en mucho tiempo.\n"
        "**4. Controlá el valor del inventario** — evitá acumular stock de baja rotación.\n"
        "**5. Usá los reportes** — la sección Reportes te da métricas clave exportables.\n\n"
        "¿Sobre cuál de estos puntos querés profundizar?",
    ),
    (
        ["poco stock", "pocas unidades", "agotado", "sin stock"],
        "El sistema define **stock bajo** como productos con entre 1 y 5 unidades. "
        "Los productos **sin stock** tienen 0 unidades. "
        "Ambos se muestran en el dashboard y en la sección Stock con colores de alerta.",
    ),
    # ── Reglas generales después ──────────────────────────────────────────────
    (
        ["producto", "productos", "artículo", "item", "catálogo"],
        "Para agregar un producto andá a **Productos** en el menú lateral y hacé clic en "
        "**Nuevo producto**. Completá el nombre, precio y stock inicial. "
        "Una vez guardado aparece en la tabla y se refleja en el dashboard.",
    ),
    (
        ["cliente", "clientes", "contacto"],
        "Para registrar un cliente andá a **Clientes** y hacé clic en **Nuevo cliente**. "
        "Podés cargar nombre, email, teléfono, dirección y notas. "
        "El campo 'Activo' te permite desactivarlo sin borrarlo.",
    ),
    (
        ["stock", "inventario", "unidades", "disponible"],
        "El **stock** se gestiona desde el módulo **Productos**. "
        "Cada producto tiene un campo de stock que podés editar. "
        "El dashboard muestra automáticamente cuántos productos tienen stock bajo (≤ 5 unidades) "
        "y cuántos están sin stock (= 0). La página de **Stock** te da un resumen completo con filtros.",
    ),
    (
        ["venta", "ventas", "vender", "factura", "cobro"],
        "El módulo de **Ventas** permite registrar ventas reales: seleccionás un cliente, "
        "agregás productos con cantidad, el sistema calcula el total y descuenta stock automáticamente. "
        "También podés ver el historial y anular una venta para restaurar el stock.",
    ),
    (
        ["precio", "precios", "costo", "valor"],
        "Los precios se cargan al crear o editar un producto en la sección **Productos**. "
        "El dashboard calcula automáticamente el **valor del inventario** "
        "sumando precio × stock de todos los productos.",
    ),
    (
        ["asistente", "ia", "inteligencia", "api key", "anthropic"],
        "El asistente de IA usa la API de Anthropic (Claude). "
        "Para habilitarlo completamente, configurá `ANTHROPIC_API_KEY` en el archivo `.env` "
        "y rebuild el backend. Mientras tanto, estoy respondiendo en modo local con información del sistema.",
    ),
    (
        ["dashboard", "panel", "resumen", "inicio"],
        "El **Dashboard** muestra en tiempo real: total de productos y clientes, "
        "productos con stock bajo, productos sin stock, valor del inventario, "
        "últimos productos cargados y últimos clientes registrados. "
        "Todos los datos vienen directamente de la base de datos, sin información inventada.",
    ),
    (
        ["login", "contraseña", "usuario", "cuenta", "acceso"],
        "El acceso al sistema se maneja con email y contraseña. "
        "El superusuario se configura en el `.env` con `FIRST_SUPERUSER` y `FIRST_SUPERUSER_PASSWORD`. "
        "Podés cambiar tu contraseña desde **Configuración** en el menú lateral.",
    ),
    (
        ["eliminar", "borrar", "editar", "modificar"],
        "En **Productos** y **Clientes** podés editar o eliminar registros con los botones "
        "de lápiz y papelera en cada fila de la tabla. "
        "Los cambios se guardan inmediatamente en la base de datos.",
    ),
]


def _demo_response(user_text: str) -> str:
    text_lower = user_text.lower()
    for keywords, response in _DEMO_KB:
        if any(kw in text_lower for kw in keywords):
            return response
    return (
        "Soy el asistente en **modo local** (sin API key configurada). "
        "Puedo ayudarte con: productos, clientes, stock, dashboard y configuración del sistema. "
        "¿Sobre qué querés saber más?"
    )


# ── Endpoint ─────────────────────────────────────────────────────────────────

@router.post("/chat", response_model=ChatResponse)
async def chat_with_assistant(
    *,
    current_user: CurrentUser,
    request: ChatRequest,
) -> Any:
    api_key = os.getenv("ANTHROPIC_API_KEY", "").strip()

    # ── Modo demo: sin API key ────────────────────────────────────────────────
    if not api_key:
        last_user_msg = next(
            (m.content for m in reversed(request.messages) if m.role == "user"),
            "",
        )
        return ChatResponse(reply=_demo_response(last_user_msg), is_demo=True)

    # ── Modo real: con API key ────────────────────────────────────────────────
    try:
        import httpx

        system_prompt = (
            "Sos un asistente de gestión empresarial integrado en un sistema de administración. "
            "Ayudás con consultas sobre productos, clientes, ventas y stock. "
            "Respondés siempre en español, de forma clara y concisa. "
            "Si te preguntan algo ajeno al sistema de gestión, redirigís hacia temas de negocio."
        )

        messages_payload = [
            {"role": m.role, "content": m.content} for m in request.messages
        ]

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": api_key,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                },
                json={
                    "model": "claude-haiku-4-5-20251001",
                    "max_tokens": 1024,
                    "system": system_prompt,
                    "messages": messages_payload,
                },
            )

        if response.status_code != 200:
            raise HTTPException(
                status_code=502,
                detail="No se pudo contactar al asistente. Verificá la API key.",
            )

        data = response.json()
        return ChatResponse(reply=data["content"][0]["text"], is_demo=False)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error interno del asistente: {str(e)}",
        )

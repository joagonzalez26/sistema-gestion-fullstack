# Sistema de Gestión Full Stack v1.0.9

Sistema web de gestión comercial desarrollado con **React**, **FastAPI**, **PostgreSQL** y **Docker**.

El proyecto permite administrar productos, clientes, ventas, stock e informes comerciales desde una interfaz moderna tipo dashboard. También incluye un asistente IA en modo local, preparado para responder consultas básicas sobre el uso del sistema sin depender obligatoriamente de servicios externos.

---

## Funcionalidades principales

- Autenticación de usuarios.
- Dashboard con métricas reales.
- Gestión de productos.
- Gestión de clientes.
- Registro de ventas.
- Descuento automático de stock al vender.
- Control de inventario.
- Detección de productos con stock bajo.
- Historial de ventas.
- Reportes comerciales.
- Exportación CSV.
- Asistente IA en modo local.
- Preparado para integración opcional con Claude mediante Anthropic API.

---

## Módulos del sistema

### Dashboard

Panel principal con indicadores comerciales:

- Total de productos.
- Total de clientes.
- Ventas del día.
- Ventas del mes.
- Ingresos totales.
- Valor del inventario.
- Productos con stock bajo.
- Productos sin stock.
- Últimos registros cargados.

### Productos

Permite crear, editar, listar y eliminar productos.  
Cada producto posee nombre, descripción, precio y stock.

### Clientes

Permite administrar clientes, registrar datos de contacto y marcar clientes como activos o inactivos.

### Ventas

Permite registrar ventas seleccionando cliente, producto y cantidad.  
Al confirmar una venta, el sistema descuenta automáticamente el stock correspondiente.

### Stock

Módulo orientado al control de inventario.  
Permite visualizar productos disponibles, productos con stock bajo y productos agotados.

### Reportes

Sección con métricas comerciales generadas a partir de los datos reales del sistema.

Incluye:

- Ventas del período.
- Ingresos totales.
- Producto más vendido.
- Cliente con más compras.
- Exportación de datos.

### Asistente IA

El asistente funciona en modo local si no se configura ninguna API externa.

Puede responder consultas como:

- Analizar stock bajo.
- Resumen de ventas.
- Clientes destacados.
- Productos más importantes.
- Ideas para mejorar el negocio.
- Consejos de gestión.

También está preparado para utilizar Claude mediante Anthropic API si se configura una clave en el archivo `.env`.

---

## Tecnologías utilizadas

### Frontend

- React
- TypeScript
- Vite
- TanStack Router
- Tailwind CSS
- shadcn/ui
- Lucide Icons

### Backend

- FastAPI
- SQLModel
- PostgreSQL
- Alembic
- Pydantic
- JWT Auth

### Infraestructura

- Docker
- Docker Compose
- Adminer
- Mailcatcher
- Traefik

---

## Estructura del proyecto

```txt
sistema-gestion/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── alembic/
│   │   └── models.py
│   ├── tests/
│   ├── scripts/
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── routes/
│   │   ├── components/
│   │   ├── client/
│   │   ├── hooks/
│   │   └── lib/
│   ├── public/
│   └── Dockerfile
│
├── scripts/
├── compose.yml
├── compose.override.yml
├── .env.example
├── README.md
├── LICENSE
└── NOTICE.md

# Requisitos

### Para ejecutar el proyecto necesitás tener instalado:

- Docker Desktop.
- Git.
- Visual Studio Code, opcional pero recomendado.

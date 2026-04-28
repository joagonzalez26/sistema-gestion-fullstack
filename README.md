# Sistema de Gestión Full Stack v1.0.9


<img width="1920" height="1080" alt="1" src="https://github.com/user-attachments/assets/8d9dc8c2-926c-46c4-8789-803a73191266" />

<img width="1920" height="1080" alt="2" src="https://github.com/user-attachments/assets/fe838924-aacf-4923-a752-52c2adbc0032" />

---

<img width="224" height="397" alt="3- opciones" src="https://github.com/user-attachments/assets/cee41d96-e55d-46f4-bf6f-3fb796e95573" />

<img width="1234" height="728" alt="4- ia" src="https://github.com/user-attachments/assets/c071b787-0d51-4667-8259-6932dc4612a4" />

--- 

> Nota personal: este proyecto fue desarrollado como práctica integral full stack. La idea fue trabajar una aplicación completa desde el frontend hasta el backend, integrando interfaz web, API, base de datos, autenticación, Docker, reportes y un asistente IA local.

Sistema web de gestión comercial desarrollado con **React**, **FastAPI**, **PostgreSQL** y **Docker**.

Permite administrar productos, clientes, ventas, stock y reportes comerciales desde una interfaz moderna tipo dashboard.

---

## Objetivo del proyecto

El objetivo fue construir un sistema full stack funcional, entendiendo cómo se conectan las distintas capas de una aplicación real:

- Frontend con React y TypeScript.
- Backend con FastAPI.
- Base de datos PostgreSQL.
- Autenticación de usuarios.
- API REST.
- Docker y Docker Compose.
- Lógica de negocio para ventas y stock.
- Reportes comerciales.
- Asistente IA en modo local.

---

## Funcionalidades principales

- Login de usuario.
- Dashboard con métricas reales.
- Gestión de productos.
- Gestión de clientes.
- Registro de ventas.
- Descuento automático de stock.
- Control de inventario.
- Reportes comerciales.
- Exportación CSV.
- Asistente IA local.
- Preparado para integración opcional con Claude mediante Anthropic API.

---

## Módulos del sistema

### Dashboard

Panel principal con indicadores del negocio:

- Productos cargados.
- Clientes activos.
- Ventas del día.
- Ventas del mes.
- Ingresos totales.
- Valor del inventario.
- Stock bajo.
- Productos sin stock.

### Productos

Permite crear, editar, eliminar y listar productos.  
Cada producto tiene nombre, descripción, precio y stock.

### Clientes

Permite registrar clientes, editar sus datos y marcarlos como activos o inactivos.

### Ventas

Permite registrar ventas seleccionando cliente, producto y cantidad.  
Al confirmar una venta, el sistema descuenta automáticamente el stock.

### Stock

Permite controlar el inventario y detectar productos con stock bajo o sin stock.

### Reportes

Muestra métricas comerciales como ventas, ingresos, productos más vendidos y clientes con más compras.

### Asistente IA

El sistema incluye un asistente IA en modo local.  
Puede responder consultas sobre productos, clientes, ventas, stock, reportes y consejos de gestión.

Si se configura `ANTHROPIC_API_KEY`, queda preparado para usar Claude mediante Anthropic API.

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
│   ├── scripts/
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── Dockerfile
│
├── scripts/
├── compose.yml
├── compose.override.yml
├── compose.traefik.yml
├── .env.example
├── README.md
├── LICENSE
└── NOTICE.md
```

---

## Requisitos

Para ejecutar el proyecto se necesita:

- Docker Desktop.
- Git.
- Visual Studio Code, opcional pero recomendado.

---

## Instalación y ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/joagonzalez26/sistema-gestion-fullstack.git
cd sistema-gestion-fullstack
```

### 2. Crear el archivo `.env`

```bash
cp .env.example .env
```

### 3. Levantar el proyecto

```bash
docker-compose up -d --build
```

O con Docker Compose nuevo:

```bash
docker compose up -d --build
```

### 4. Verificar contenedores

```bash
docker-compose ps
```

### 5. Verificar backend

```bash
curl -i http://localhost:8000/api/v1/utils/health-check/
```

Respuesta esperada:

```txt
HTTP/1.1 200 OK

true
```

### 6. Abrir la aplicación

```txt
http://localhost:5173
```

---

## Usuario inicial

Credenciales de desarrollo:

```txt
Email: admin@example.com
Password: changethis
```

Estos valores pueden modificarse desde el archivo `.env`.

---

## Variables de entorno

El proyecto incluye un archivo `.env.example`.

El archivo `.env` real no debe subirse al repositorio.

Variables principales:

```env
PROJECT_NAME="Sistema de Gestión"
STACK_NAME=sistema-gestion
FIRST_SUPERUSER=admin@example.com
FIRST_SUPERUSER_PASSWORD=changethis
POSTGRES_DB=sistema_gestion
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
VITE_API_URL=http://localhost:8000
ANTHROPIC_API_KEY=
```

---

## Comandos útiles

### Levantar el sistema

```bash
docker-compose up -d
```

### Levantar y reconstruir

```bash
docker-compose up -d --build
```

### Apagar sin borrar datos

```bash
docker-compose down
```

### Apagar y borrar base de datos local

```bash
docker-compose down -v
```

### Ver logs del backend

```bash
docker-compose logs backend --tail=200
```

### Ver logs de migraciones

```bash
docker-compose logs prestart --tail=200
```

---

## Estado actual

Versión estable: **v1.0.9**

Módulos funcionando:

- Login.
- Dashboard.
- Productos.
- Clientes.
- Ventas.
- Stock.
- Reportes.
- Asistente IA local.

---

## Posibles mejoras futuras

- Roles de usuario.
- Comprobantes de venta en PDF.
- Gráficos avanzados.
- Historial individual por cliente.
- Tests automatizados.
- Despliegue en producción.
- Integración real del asistente IA con datos del sistema.

---

## Autor

Desarrollado y personalizado por **Joaquín González**.

Proyecto realizado como práctica full stack, integrando frontend, backend, base de datos, Docker y módulos comerciales reales.

---

## Licencia

Este proyecto conserva la licencia MIT original de la base open-source utilizada.

Las modificaciones, personalización visual y módulos funcionales agregados fueron desarrollados por Joaquín González.

Ver el archivo [LICENSE](./LICENSE) para más información.

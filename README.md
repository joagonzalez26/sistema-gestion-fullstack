# Sistema de Gestión Full Stack v1.0.9

> Nota personal: este proyecto fue desarrollado como práctica integral full stack, con el objetivo de trabajar una aplicación completa desde el frontend hasta el backend. La idea principal fue construir un sistema real de gestión comercial, integrando interfaz web, API, base de datos, autenticación, lógica de negocio, reportes, Docker y un asistente IA en modo local.

Sistema web de gestión comercial desarrollado con **React**, **FastAPI**, **PostgreSQL** y **Docker**.

El proyecto permite administrar productos, clientes, ventas, stock e informes comerciales desde una interfaz moderna tipo dashboard. También incluye un asistente IA en modo local, preparado para responder consultas básicas sobre el uso del sistema sin depender obligatoriamente de servicios externos.

---

## Objetivo del proyecto

El objetivo de este sistema fue construir una aplicación full stack funcional, entendiendo cómo se conectan las distintas capas de un software real:

- Frontend moderno con React y TypeScript.
- Backend con FastAPI.
- Base de datos relacional con PostgreSQL.
- Migraciones con Alembic.
- Autenticación de usuarios.
- Comunicación frontend-backend mediante API REST.
- Contenedores con Docker.
- Lógica de negocio aplicada a ventas y stock.
- Reportes comerciales.
- Asistente IA integrado en modo local.

Este proyecto está pensado como parte de un portfolio de desarrollo, mostrando no solo la interfaz visual, sino también la estructura interna de una aplicación web completa.

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

Panel principal con indicadores comerciales del sistema.

Incluye:

- Total de productos.
- Total de clientes.
- Ventas del día.
- Ventas del mes.
- Ingresos totales.
- Valor del inventario.
- Productos con stock bajo.
- Productos sin stock.
- Últimos productos cargados.
- Últimos clientes registrados.
- Últimas ventas realizadas.

---

### Productos

Módulo para administrar los productos del negocio.

Permite:

- Crear productos.
- Editar productos existentes.
- Eliminar productos.
- Consultar listado de productos.
- Registrar precio.
- Registrar descripción.
- Controlar stock inicial y stock actualizado.

Cada producto puede ser utilizado luego en el módulo de ventas.

---

### Clientes

Módulo para administrar clientes.

Permite:

- Crear clientes.
- Editar datos de clientes.
- Eliminar clientes.
- Registrar email.
- Registrar teléfono.
- Registrar dirección o notas.
- Marcar clientes como activos o inactivos.

Los clientes registrados pueden seleccionarse al momento de crear una venta.

---

### Ventas

Módulo para registrar operaciones comerciales.

Permite:

- Seleccionar un cliente.
- Seleccionar productos.
- Indicar cantidad vendida.
- Calcular el total de la venta.
- Confirmar la operación.
- Consultar historial de ventas.
- Anular una venta, si corresponde.

Al confirmar una venta, el sistema descuenta automáticamente el stock del producto vendido.

---

### Stock

Módulo orientado al control de inventario.

Permite visualizar:

- Total de productos cargados.
- Productos con stock disponible.
- Productos con stock bajo.
- Productos sin stock.
- Precio de los productos.
- Cantidad disponible de cada producto.

El sistema considera stock bajo cuando un producto tiene entre 1 y 5 unidades disponibles.

---

### Reportes

Sección con métricas comerciales generadas a partir de los datos reales del sistema.

Incluye:

- Ventas por período.
- Ingresos del período.
- Ingresos totales.
- Producto más vendido.
- Cliente con más compras.
- Últimas ventas.
- Alertas de stock.
- Exportación CSV.

---

### Asistente IA

El sistema incluye un asistente IA integrado.

Actualmente puede funcionar en dos modos:

#### Modo local

Funciona sin necesidad de API externa.

El asistente responde consultas frecuentes usando una base de conocimiento interna del sistema.

Puede responder sobre:

- Cómo agregar productos.
- Cómo registrar clientes.
- Cómo analizar stock bajo.
- Cómo revisar ventas.
- Cómo identificar clientes destacados.
- Cómo identificar productos importantes.
- Ideas para mejorar la gestión del negocio.
- Consejos generales de uso del sistema.

#### Modo con Claude

El backend está preparado para conectarse con Claude mediante Anthropic API.

Para activar este modo, se debe configurar una API key en el archivo `.env`:

```env
ANTHROPIC_API_KEY=tu_api_key

Si no se configura ninguna API key, el asistente continúa funcionando en modo local.

Tecnologías utilizadas
Frontend
React
TypeScript
Vite
TanStack Router
Tailwind CSS
shadcn/ui
Lucide Icons
Backend
FastAPI
SQLModel
PostgreSQL
Alembic
Pydantic
JWT Auth
Infraestructura
Docker
Docker Compose
Adminer
Mailcatcher
Traefik
Estructura del proyecto
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
├── compose.traefik.yml
├── .env.example
├── README.md
├── LICENSE
└── NOTICE.md
Requisitos

Para ejecutar el proyecto se necesita tener instalado:

Docker Desktop.
Git.
Visual Studio Code, opcional pero recomendado.
Instalación y ejecución
1. Clonar el repositorio
git clone https://github.com/joagonzalez26/sistema-gestion-fullstack.git
cd sistema-gestion-fullstack
2. Crear el archivo de variables de entorno
cp .env.example .env
3. Levantar el proyecto con Docker
docker-compose up -d --build

En versiones nuevas de Docker también se puede usar:

docker compose up -d --build
4. Verificar el estado de los contenedores
docker-compose ps

El resultado esperado es que los servicios principales estén activos:

backend    Up
frontend   Up
db         healthy
proxy      Up

El servicio prestart puede aparecer como finalizado. Eso es normal, porque se utiliza para ejecutar migraciones y datos iniciales.

5. Verificar el backend
curl -i http://localhost:8000/api/v1/utils/health-check/

Respuesta esperada:

HTTP/1.1 200 OK

true
6. Abrir la aplicación
http://localhost:5173
Usuario inicial

Por defecto, el sistema crea un usuario administrador inicial configurado desde el archivo .env.

Credenciales de desarrollo:

Email: admin@example.com
Password: changethis

Se recomienda modificar estos valores antes de usar el sistema en un entorno real.

Variables de entorno

El proyecto incluye un archivo .env.example con la configuración base.

El archivo .env real no debe subirse al repositorio, ya que puede contener claves privadas o configuraciones sensibles.

Variables importantes:

PROJECT_NAME="Sistema de Gestión"
STACK_NAME=sistema-gestion
FIRST_SUPERUSER=admin@example.com
FIRST_SUPERUSER_PASSWORD=changethis
POSTGRES_DB=sistema_gestion
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
VITE_API_URL=http://localhost:8000
ANTHROPIC_API_KEY=
Comandos útiles

Levantar el sistema:

docker-compose up -d

Levantar y reconstruir:

docker-compose up -d --build

Apagar sin borrar datos:

docker-compose down

Apagar y borrar la base de datos local:

docker-compose down -v

Ver contenedores:

docker-compose ps

Ver logs del backend:

docker-compose logs backend --tail=200

Ver logs del servicio de migraciones:

docker-compose logs prestart --tail=200

Probar health-check:

curl -i http://localhost:8000/api/v1/utils/health-check/
Estado actual

Versión estable: v1.0.9

Módulos funcionando:

Login.
Dashboard.
Productos.
Clientes.
Ventas.
Stock.
Reportes.
Asistente IA local.
Posibles mejoras futuras

Algunas ideas para próximas versiones:

Agregar roles de usuario.
Mejorar permisos para administradores y empleados.
Agregar carga de imágenes para productos.
Generar comprobantes de venta en PDF.
Agregar gráficos avanzados en reportes.
Mejorar el módulo de clientes con historial individual.
Implementar tests automatizados para módulos críticos.
Conectar el asistente IA con datos reales del sistema.
Preparar despliegue en producción.
Autor

Desarrollado y personalizado por Joaquín González.

Este proyecto fue adaptado, ampliado y transformado en un sistema de gestión comercial full stack, incorporando módulos de productos, clientes, ventas, stock, reportes y asistente IA local.

Licencia

Este proyecto conserva la licencia original MIT de la base open-source utilizada.

Las modificaciones, personalización visual y módulos funcionales agregados fueron desarrollados por Joaquín González.

Ver el archivo LICENSE
 para más información.

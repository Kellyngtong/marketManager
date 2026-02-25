# MarketManager

Sistema de gestión y venta online para supermercado, con backend API en TypeScript y frontend web/móvil con Ionic + Angular.

## 1) ¿Para qué sirve este sistema?

MarketManager permite operar una tienda/supermercado con flujo completo de catálogo y compra:

- Autenticación de usuarios con roles.
- Gestión de artículos (catálogo, stock, filtros, búsqueda).
- Carrito de compra por usuario.
- Checkout y registro de ventas.
- Integración de pagos con Stripe.
- Funciones administrativas (métricas, pedidos, usuarios, productos).
- Soporte multitenant (aislamiento por tenant/store).

## 2) Arquitectura del proyecto

```text
marketManager/
├── backend/                 # API REST + lógica de negocio
│   ├── src/
│   │   ├── config/          # Config DB/Swagger
│   │   ├── controllers/     # Casos de uso
│   │   ├── db/              # Inicialización DB, migraciones, seeder
│   │   ├── middlewares/     # JWT, roles, tenant
│   │   ├── models/          # Modelos Sequelize
│   │   ├── routes/          # Endpoints
│   │   └── index.ts         # Entrada principal del servidor
│   ├── migrations/          # Migraciones SQL
│   ├── public/images/       # Imágenes subidas
│   └── package.json
├── frontend/                # App cliente Angular + Ionic
│   ├── src/
│   └── package.json
└── README.md                # Documentación única del proyecto
```

## 3) Tecnologías empleadas

### Backend

- Node.js
- TypeScript
- Express 5
- Sequelize + MySQL (`mysql2`)
- JWT (`jsonwebtoken`) + bcrypt
- Swagger (`swagger-jsdoc`, `swagger-ui-express`)
- Stripe
- Multer (subida de imágenes)

### Frontend

- Angular 20
- Ionic 8
- Capacitor 7
- RxJS
- TypeScript

## 4) Requisitos previos

- Node.js 18 o superior
- npm 9 o superior
- MySQL 8 o compatible

## 5) Variables de entorno (backend)

Crea `backend/.env` (puedes copiar de `backend/.env.example`).

Ejemplo recomendado para local:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=db_ionic
DB_DIALECT=mysql

DB_POOL_MAX=5
DB_POOL_MIN=0
DB_POOL_ACQUIRE=30000
DB_POOL_IDLE=10000

PORT=4800
NODE_ENV=development
JWT_SECRET=pon_una_clave_larga_y_segura

# Opcional
DB_LOGGING=false
# CORS_ORIGINS=http://localhost:4200,http://localhost:8100

# Stripe (necesario para pagos)
STRIPE_SECRET_KEY=
STRIPE_PUBLIC_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_SUCCESS_URL=http://localhost:8100/payment-success
STRIPE_CANCEL_URL=http://localhost:8100/payment-cancel
```

## 6) Instalación

Instala dependencias por separado:

```bash
cd backend
npm install

cd ../frontend
npm install
```

## 7) Migraciones y seeder

### Ejecutar migraciones

```bash
cd backend
npm run migrate
```

Esto ejecuta en orden los SQL de `backend/migrations`:
- `01_schema_mvp.sql`
- `02_add_multitenant.sql`
- `03_add_customer_snapshot_to_venta.sql`

### Ejecutar seeder

```bash
cd backend
npm run seed
```

El seeder (`backend/src/db/seeder.ts`) inserta datos iniciales multitenant (tenants, stores, roles, categorías, artículos, usuarios, etc.).

### Alternativa: migrar al iniciar backend

```bash
cd backend
npm run dev -- --revert-db
```

## 8) Cómo levantar el sistema (paso a paso)

### 1. Levantar backend

```bash
cd backend
npm run dev
```

Backend disponible en: `http://localhost:4800`

### 2. Levantar frontend

```bash
cd frontend
npm start
```

Frontend (Angular dev server) en: `http://localhost:4200`

## 9) URLs útiles

- API: `http://localhost:4800`
- Swagger: `http://localhost:4800/api-docs`
- Healthcheck: `http://localhost:4800/api/health`
- Archivos públicos (imágenes): `http://localhost:4800/public/...`

## 10) ¿Qué hace cada parte del sistema?

### Módulos funcionales del backend (API)

- **Auth (`/api/auth`)**
  - Alta y autenticación de usuarios con JWT.
  - Entrega el perfil del usuario autenticado y permite actualizar datos personales.
  - Expone listado de usuarios para administración (según permisos).

- **Artículos (`/api/articulos`)**
  - Catálogo público de productos con filtros (`idcategoria`), búsqueda (`search`), paginación y ordenamiento.
  - Gestión interna del inventario: crear, editar, desactivar y actualizar stock.
  - Aplica validaciones de negocio (campos requeridos, duplicados, stock, etc.).

- **Carrito (`/api/carrito`)**
  - Mantiene el carrito por usuario autenticado en base de datos.
  - Permite agregar artículos, modificar cantidades, eliminar líneas y vaciar carrito.
  - Es la base del flujo de checkout.

- **Ventas (`/api/ventas`, `/api/mis-compras`)**
  - Cierra la compra (checkout) creando venta y detalle de venta.
  - Permite consultar una venta concreta y el historial de compras del cliente.
  - Centraliza el estado de la operación comercial.

- **Pagos (`/api/pagos`)**
  - Integra Stripe Checkout para pago online.
  - Crea sesiones de pago, consulta sesiones y confirma operaciones.
  - Procesa webhooks para sincronizar el estado real del pago.

- **Admin (`/api/admin`)**
  - Entrega métricas para dashboard (usuarios, ventas, ingresos, productos).
  - Gestiona pedidos y consultas administrativas de usuarios/productos.
  - Facilita operación interna para staff (empleado/admin).

- **Upload (`/api/upload`)**
  - Sube imágenes de producto al servidor.
  - Valida tipo y tamaño de archivo.
  - Devuelve URL pública para persistirla en catálogo.

### Capas técnicas del backend (cómo se organiza)

- **`routes/`**
  - Define endpoints HTTP y conecta cada ruta con su middleware y controller.

- **`controllers/`**
  - Implementa la lógica de negocio de cada caso de uso (auth, catálogo, carrito, pagos, ventas, admin).

- **`models/`**
  - Define entidades Sequelize y sus relaciones (usuarios, roles, artículos, ventas, etc.).

- **`middlewares/`**
  - Seguridad y contexto de ejecución: validación JWT, control por rol y aislamiento tenant/store.

- **`db/`**
  - Inicialización de conexión Sequelize, ejecución de migraciones SQL y carga de datos seed.

- **`config/`**
  - Configuración central de base de datos y documentación Swagger/OpenAPI.

### Frontend (Angular + Ionic)

- Consume la API del backend y presenta la experiencia de usuario.
- Gestiona navegación, pantallas, formularios y estado de sesión.
- Soporta el flujo completo: explorar catálogo → carrito → checkout → seguimiento de compras.
- Está preparado para ejecución web y base para despliegue móvil mediante Capacitor.

## 11) Roles y permisos

El sistema trabaja con jerarquía de roles:

- `1`: cliente
- `2`: premium
- `3`: empleado
- `4`: admin

Middleware de seguridad:
- Verificación JWT
- Validación por rol
- Extracción de contexto tenant/store

## 12) Scripts disponibles

### Backend (`backend/package.json`)

```bash
npm run build       # Compila TypeScript y resuelve aliases
npm run start       # Ejecuta versión compilada (dist)
npm run dev         # Ejecuta backend en TS (ts-node)
npm run dev:watch   # Modo watch
npm run migrate     # Ejecuta migraciones SQL
npm run seed        # Ejecuta seeder de datos
```

### Frontend (`frontend/package.json`)

```bash
npm start           # ng serve
npm run build       # build
npm run watch       # build en watch
npm test            # tests unitarios
npm run lint        # lint
```

## 13) Flujo recomendado para desarrollo

1. Configurar `backend/.env`.
2. Ejecutar `npm install` en backend y frontend.
3. Ejecutar `npm run migrate` en backend.
4. Ejecutar `npm run seed` en backend.
5. Levantar backend con `npm run dev`.
6. Levantar frontend con `npm start`.
7. Probar endpoints en Swagger (`/api-docs`).

## 14) Troubleshooting rápido

- **No conecta a MySQL**
  - Revisa `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.

- **Error CORS**
  - Configura `CORS_ORIGINS` en backend `.env`.

- **Token inválido o expirado**
  - Inicia sesión de nuevo y envía `Authorization: Bearer <token>`.

- **Stripe no funciona**
  - Verifica `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_SUCCESS_URL`, `STRIPE_CANCEL_URL`.

## 15) Notas importantes

- El backend está en TypeScript y usa rutas versionadas bajo `/api`.
- Existe soporte multitenant en middleware y modelos.
- La documentación de API se genera con Swagger leyendo rutas/controladores del backend.

## 16) Equipo

- Aitor Peña Sánchez
- Eduardo Romero Afonso
- Verónica Londoño Pereira

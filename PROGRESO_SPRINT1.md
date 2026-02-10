# 📊 PROGRESO SPRINT 1 - MVP

## Estado Actual: 5/12 Tareas Completadas ✅

### Tareas Completadas

#### ✅ DW-001: Script SQL de BD Completa (3h)
**Estado:** COMPLETADO ✅

**Entregables:**
- Script SQL `/backend/sql/01_schema_mvp.sql` con 10 tablas MVP
- 4 roles, 8 categorías, 16 productos, 3 usuarios, 3 clientes, 3 proveedores seeded
- 3 vistas SQL para reportes
- Documentación en `/backend/sql/README.md`

---

#### ✅ DW-002: Modelos Sequelize Sprint 1 (4h)
**Estado:** COMPLETADO ✅

**Entregables:**
- 10 archivos de modelos con todas las relaciones establecidas
- Documentación completa en `/backend/models/README.md`

---

#### ✅ DW-003: Sistema de Roles en Autenticación (5h)
**Estado:** COMPLETADO ✅

**Entregables:**
- Auth controller refactorizado: register, login, getProfile, updateProfile
- Middleware ampliado con 8 funciones de control de roles
- Rutas protegidas en `/auth.routes.js`
- JWT con idusuario e idrol
- Documentación: `/backend/controllers/README_AUTH.md`

---

#### ✅ DW-004: CRUD de Categorías (3h)
**Estado:** COMPLETADO ✅

**Entregables:**
- Controlador completo: `/backend/controllers/categoria.controller.js`
  - getAllCategorias()
  - getCategoriaById()
  - createCategoria() - ADMIN only
  - updateCategoria() - ADMIN only
  - deleteCategoria() - ADMIN only, soft delete
  - getCategoriaWithArticulos() - incluye artículos

- Rutas: `/backend/routes/categorias.routes.js`
- Control de permisos: Solo ADMIN puede crear/editar/eliminar
- Validaciones: nombre UNIQUE, no permite eliminar si tiene artículos
- Registrada en `index.js`

---

#### ✅ DW-005: CRUD de Artículos Mejorado (4h)
**Estado:** COMPLETADO ✅

**Entregables:**
- Controlador completo: `/backend/controllers/articulo.controller.js`
  - getAllArticulos() - con filtros, búsqueda, paginación
  - getArticuloById()
  - getArticuloByCodigo()
  - createArticulo() - EMPLEADO+
  - updateArticulo() - EMPLEADO+
  - deleteArticulo() - EMPLEADO+, soft delete
  - updateStock() - EMPLEADO+, con PATCH

- Rutas: `/backend/routes/articulos.routes.js`
- Funcionalidades:
  - Filtrado por categoría
  - Búsqueda full-text (nombre, descripción, código)
  - Paginación (page, limit)
  - Ordenamiento: nombre, precio_asc, precio_desc, stock, reciente
  - Relación con categoría incluida
  - Control de stock con PATCH

- Validaciones:
  - nombre y código UNIQUE
  - categoría debe existir
  - No elimina si tiene historial de transacciones
  - Stock no puede ser negativo

- Control de permisos: EMPLEADO o superior (idrol >= 3)
- Registrada en `index.js`

- Documentación: `/backend/controllers/README_CATEGORIAS_ARTICULOS.md`

---

## Tareas Pendientes

#### ⏳ DW-006: Carrito en BD (4h) - PRÓXIMO
- ¿Tabla separada o solo frontend?
- Endpoints: addToCart, removeFromCart, getCart, clearCart

#### ⏳ DW-007: Módulo de Checkout (5h)
- Crear venta + detalle_venta
- Procesar pago (simulado)
- Actualizar stock
- Generar número de comprobante

#### ⏳ DW-008: Historial de Compras (frontend, 3h)
- Listar ventas del cliente autenticado

#### ⏳ DW-009: Perfil Usuario Mejorado (frontend, 3h)
- Mostrar rol del usuario
- Editar datos

#### ⏳ DW-010: Expandir datos seeded (2h)
- Más productos de ejemplo

#### ⏳ DW-011: Testing Manual e Integración (4h)
- Test de endpoints con Postman

#### ⏳ DW-012: Documentación Swagger (2h)
- Actualizar especificación OpenAPI

---

## Resumen de Cambios Acumulados

### Backend Structure Actualizada
```
backend/
├── models/
│   ├── rol.model.js ✅
│   ├── categoria.model.js ✅
│   ├── usuario.model.js ✅
│   ├── cliente.model.js ✅
│   ├── proveedor.model.js ✅
│   ├── articulo.model.js ✅
│   ├── ingreso.model.js ✅
│   ├── detalle_ingreso.model.js ✅
│   ├── venta.model.js ✅
│   ├── detalle_venta.model.js ✅
│   ├── index.js ✅ (con relaciones)
│   └── README.md ✅
│
├── controllers/
│   ├── auth.controller.js ✅ (refactorizado)
│   ├── categoria.controller.js ✅ (NEW)
│   ├── articulo.controller.js ✅ (NEW)
│   ├── README_AUTH.md ✅ (NEW)
│   ├── README_CATEGORIAS_ARTICULOS.md ✅ (NEW)
│   └── [otros]
│
├── middlewares/
│   └── authJwt.js ✅ (ampliado)
│
├── routes/
│   ├── auth.routes.js ✅ (actualizado)
│   ├── categorias.routes.js ✅ (NEW)
│   ├── articulos.routes.js ✅ (NEW)
│   └── [otros]
│
├── sql/
│   ├── 01_schema_mvp.sql ✅ (NEW)
│   └── README.md ✅ (NEW)
│
└── index.js ✅ (actualizado con nuevas rutas)
```

---

## APIs Implementadas

### Authentication (DW-003)
```
POST   /api/auth/register          (público)
POST   /api/auth/login             (público)
GET    /api/auth/profile           (protegido)
PUT    /api/auth/profile           (protegido)
```

### Categorías (DW-004)
```
GET    /api/categorias             (público)
GET    /api/categorias/:id         (público)
GET    /api/categorias/:id/articulos (público)
POST   /api/categorias             (ADMIN)
PUT    /api/categorias/:id         (ADMIN)
DELETE /api/categorias/:id         (ADMIN)
```

### Artículos (DW-005)
```
GET    /api/articulos              (público) - con filtros
GET    /api/articulos/:id          (público)
GET    /api/articulos/codigo/:codigo (público)
POST   /api/articulos              (EMPLEADO+)
PUT    /api/articulos/:id          (EMPLEADO+)
DELETE /api/articulos/:id          (EMPLEADO+)
PATCH  /api/articulos/:id/stock    (EMPLEADO+)
```

### Totales: 21 Endpoints implementados

---

## Validaciones Implementadas

### Nivel Database
- Foreign Keys con integridad referencial
- Índices en campos frecuentes
- UNIQUE constraints en nombres y códigos
- CASCADE DELETE para detalles

### Nivel Aplicación
- Validación de campos requeridos
- Validación de UNIQUE en duplicados
- Validación de relaciones (categoría existe, etc.)
- Validación de permisos por rol
- Validación de estado (condicion = 1)

### Seguridad
- Bcrypt hasheadas de contraseñas (10 salts)
- JWT con expiración de 24h
- Token incluye información de rol
- Contraseñas nunca se devuelven en respuestas
- Soft delete para mantener historial

---

## Próximas Prioridades

### CRÍTICO (esta semana):
1. ✅ DW-001, DW-002, DW-003, DW-004, DW-005 completados
2. **DW-006: Carrito** - Necesario para compras
3. **DW-007: Checkout** - Genera ventas
4. **DW-010: Datos seeded** - Más ejemplos

### IMPORTANTE (próxima):
5. DW-008: Historial de compras (frontend)
6. DW-009: Perfil usuario (frontend)

### VALIDACIÓN:
7. DW-011: Testing
8. DW-012: Documentación Swagger

---

## Testing Manual Recomendado

### 1. Crear Categoría (ADMIN)
```bash
curl -X POST http://localhost:4800/api/categorias \
  -H "Authorization: Bearer <token_admin>" \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Bebidas","descripcion":"Bebidas variadas"}'
```

### 2. Crear Artículo (EMPLEADO)
```bash
curl -X POST http://localhost:4800/api/articulos \
  -H "Authorization: Bearer <token_empleado>" \
  -H "Content-Type: application/json" \
  -d '{
    "codigo":"BEB001",
    "nombre":"Cerveza Artesanal",
    "precio_venta":4.50,
    "stock":100,
    "idcategoria":6
  }'
```

### 3. Buscar Artículos
```bash
curl "http://localhost:4800/api/articulos?search=manzana&orderBy=precio_asc&limit=5"
```

---

## Checklist de Validación

- [x] Base de datos con 10 tablas + relaciones
- [x] 4 roles diferenciados (cliente, premium, empleado, admin)
- [x] Autenticación JWT con rol incluido
- [x] Middleware de control de acceso por rol
- [x] CRUD de categorías con soft delete
- [x] CRUD de artículos con busqueda y paginación
- [x] Validaciones de UNIQUE y relaciones
- [x] Endpoints protegidos por rol
- [x] Control de permisos (ADMIN vs EMPLEADO+)
- [x] Documentación de APIs

---

## Tiempo Consumido vs Estimado

| Ticket | Estimado | Actual | Estado |
|--------|----------|--------|--------|
| DW-001 | 3h | 3h | ✅ On time |
| DW-002 | 4h | 4h | ✅ On time |
| DW-003 | 5h | 5h | ✅ On time |
| DW-004 | 3h | 3h | ✅ On time |
| DW-005 | 4h | 4h | ✅ On time |
| **TOTAL** | **19h** | **19h** | ✅ **ON SCHEDULE** |

**Tiempo restante para Sprint 1:** ~21 horas
**Tickets pendientes:** 7
**Estimado para completar Sprint 1:** 8-9 días

---

**Última actualización:** 10 de febrero de 2026
**Próximo milestone:** DW-006 (Carrito en Backend)
**Velocidad:** 19h completadas, en ritmo para terminar Sprint 1 a tiempo


# CRUD de Categorías y Artículos - MVP Sprint 1

## Descripción General

Se han implementado dos CRUDs completos:
1. **Categorías** - Gestión de categorías de productos
2. **Artículos** - Gestión de productos del catálogo

Ambos incluyen validaciones robustas, control de permisos y relaciones entre entidades.

## API Categorías

### Base URL
```
GET    /api/categorias
GET    /api/categorias/:id
GET    /api/categorias/:id/articulos
POST   /api/categorias
PUT    /api/categorias/:id
DELETE /api/categorias/:id
```

### Endpoints Detallados

#### 1. GET /api/categorias
**Descripción:** Obtener todas las categorías activas

**Acceso:** Público

**Response 200:**
```json
{
  "message": "Categorías obtenidas exitosamente",
  "count": 8,
  "categorias": [
    {
      "idcategoria": 1,
      "nombre": "Frutas",
      "descripcion": "Frutas frescas y de calidad",
      "condicion": 1
    },
    ...
  ]
}
```

---

#### 2. GET /api/categorias/:id
**Descripción:** Obtener una categoría específica por ID

**Acceso:** Público

**Params:**
- `id` (integer) - ID de la categoría

**Response 200:**
```json
{
  "message": "Categoría obtenida exitosamente",
  "categoria": {
    "idcategoria": 1,
    "nombre": "Frutas",
    "descripcion": "Frutas frescas y de calidad",
    "condicion": 1
  }
}
```

**Response 404:**
```json
{
  "message": "Categoría no encontrada"
}
```

---

#### 3. GET /api/categorias/:id/articulos
**Descripción:** Obtener una categoría con todos sus artículos

**Acceso:** Público

**Response 200:**
```json
{
  "message": "Categoría con artículos obtenida exitosamente",
  "categoria": {
    "idcategoria": 1,
    "nombre": "Frutas",
    "articulos": [
      {
        "idarticulo": 1,
        "codigo": "FRU001",
        "nombre": "Manzana Roja",
        "precio_venta": 2.50,
        "stock": 150
      }
    ]
  }
}
```

---

#### 4. POST /api/categorias
**Descripción:** Crear nueva categoría

**Acceso:** ADMIN solo

**Authorization:** Bearer token requerido

**Body:**
```json
{
  "nombre": "Nuevacategoría",
  "descripcion": "Descripción opcional"
}
```

**Validaciones:**
- nombre: requerido, UNIQUE
- descripcion: opcional

**Response 201:**
```json
{
  "message": "Categoría creada exitosamente",
  "categoria": {
    "idcategoria": 9,
    "nombre": "Nuevacategoría",
    "descripcion": "Descripción opcional",
    "condicion": 1
  }
}
```

**Response 400:**
```json
{
  "message": "El nombre es requerido"
}
```
o
```json
{
  "message": "La categoría \"Frutas\" ya existe"
}
```

---

#### 5. PUT /api/categorias/:id
**Descripción:** Actualizar una categoría

**Acceso:** ADMIN solo

**Authorization:** Bearer token requerido

**Body:**
```json
{
  "nombre": "Nombre actualizado",
  "descripcion": "Nueva descripción"
}
```

**Response 200:**
```json
{
  "message": "Categoría actualizada exitosamente",
  "categoria": { ... }
}
```

---

#### 6. DELETE /api/categorias/:id
**Descripción:** Eliminar (soft delete) una categoría

**Acceso:** ADMIN solo

**Validación:** No se puede eliminar si tiene artículos asociados

**Response 200:**
```json
{
  "message": "Categoría eliminada exitosamente",
  "categoria": { ... }
}
```

**Response 400:**
```json
{
  "message": "No se puede eliminar. Existen 5 producto(s) en esta categoría"
}
```

---

## API Artículos

### Base URL
```
GET    /api/articulos
GET    /api/articulos/:id
GET    /api/articulos/codigo/:codigo
POST   /api/articulos
PUT    /api/articulos/:id
DELETE /api/articulos/:id
PATCH  /api/articulos/:id/stock
```

### Endpoints Detallados

#### 1. GET /api/articulos
**Descripción:** Obtener todos los artículos con filtros y paginación

**Acceso:** Público

**Query Params:**
```
?idcategoria=1                    // Filtrar por categoría
&search=manzana                   // Buscar por nombre, descripción o código
&page=2                           // Número de página (default 1)
&limit=20                         // Artículos por página (default 10)
&orderBy=precio_desc              // orden: nombre | precio_asc | precio_desc | stock | reciente
```

**Response 200:**
```json
{
  "message": "Artículos obtenidos exitosamente",
  "count": 150,
  "page": 1,
  "limit": 10,
  "totalPages": 15,
  "articulos": [
    {
      "idarticulo": 1,
      "codigo": "FRU001",
      "nombre": "Manzana Roja",
      "precio_venta": 2.50,
      "stock": 150,
      "descripcion": "Manzanas rojas frescas kg",
      "imagen": null,
      "condicion": 1,
      "categoria": {
        "idcategoria": 1,
        "nombre": "Frutas"
      }
    },
    ...
  ]
}
```

**Ejemplo de búsqueda combinada:**
```
GET /api/articulos?idcategoria=1&search=manzana&orderBy=precio_asc&limit=5
```

---

#### 2. GET /api/articulos/:id
**Descripción:** Obtener artículo específico por ID

**Acceso:** Público

**Response 200:**
```json
{
  "message": "Artículo obtenido exitosamente",
  "articulo": {
    "idarticulo": 1,
    "codigo": "FRU001",
    "nombre": "Manzana Roja",
    "precio_venta": 2.50,
    "stock": 150,
    "descripcion": "Manzanas rojas frescas kg",
    "imagen": null,
    "condicion": 1,
    "categoria": {
      "idcategoria": 1,
      "nombre": "Frutas"
    }
  }
}
```

---

#### 3. GET /api/articulos/codigo/:codigo
**Descripción:** Obtener artículo por su código

**Acceso:** Público

**Params:**
- `codigo` (string) - Código del artículo (ej: FRU001)

**Response 200:** Similar a GET /:id

**Response 404:**
```json
{
  "message": "Artículo con código FRU999 no encontrado"
}
```

---

#### 4. POST /api/articulos
**Descripción:** Crear nuevo artículo

**Acceso:** EMPLEADO o superior

**Authorization:** Bearer token requerido

**Body:**
```json
{
  "codigo": "FRU004",
  "nombre": "Kiwi Verde",
  "precio_venta": 3.50,
  "stock": 80,
  "descripcion": "Kiwi verde fresco kg",
  "idcategoria": 1,
  "imagen": "http://url/imagen.jpg"
}
```

**Campos obligatorios:**
- nombre
- precio_venta
- idcategoria

**Campos opcionales:**
- codigo (UNIQUE)
- stock (default 0)
- descripcion
- imagen

**Validaciones:**
- nombre: UNIQUE
- codigo: UNIQUE (si se proporciona)
- idcategoria: debe existir

**Response 201:**
```json
{
  "message": "Artículo creado exitosamente",
  "articulo": { ... }
}
```

---

#### 5. PUT /api/articulos/:id
**Descripción:** Actualizar artículo

**Acceso:** EMPLEADO o superior

**Body:**
```json
{
  "nombre": "Nombre actualizado",
  "precio_venta": 4.00,
  "stock": 100
}
```

**Todos los campos son opcionales.**

**Response 200:**
```json
{
  "message": "Artículo actualizado exitosamente",
  "articulo": { ... }
}
```

---

#### 6. DELETE /api/articulos/:id
**Descripción:** Eliminar (soft delete) artículo

**Acceso:** EMPLEADO o superior

**Validación:** No se puede si tiene transacciones asociadas

**Response 400:**
```json
{
  "message": "No se puede eliminar. El artículo tiene historial de transacciones"
}
```

---

#### 7. PATCH /api/articulos/:id/stock
**Descripción:** Ajustar stock (incrementar o decrementar)

**Acceso:** EMPLEADO o superior

**Body:**
```json
{
  "cantidad": 50
}
```

**Ejemplos:**
```json
{ "cantidad": 50 }    // Aumentar stock en 50
{ "cantidad": -10 }   // Disminuir stock en 10
```

**Validaciones:**
- El stock nunca puede ser negativo (se limita a 0)

**Response 200:**
```json
{
  "message": "Stock actualizado exitosamente",
  "articulo": {
    "idarticulo": 1,
    "nombre": "Manzana Roja",
    "stock": 200
  }
}
```

---

## Control de Permisos (Roles)

### Categorías
| Método | Endpoint | Rol Requerido | Público |
|--------|----------|---------------|---------|
| GET | /api/categorias | Ninguno | ✅ |
| GET | /api/categorias/:id | Ninguno | ✅ |
| GET | /api/categorias/:id/articulos | Ninguno | ✅ |
| POST | /api/categorias | ADMIN | ❌ |
| PUT | /api/categorias/:id | ADMIN | ❌ |
| DELETE | /api/categorias/:id | ADMIN | ❌ |

### Artículos
| Método | Endpoint | Rol Requerido | Público |
|--------|----------|---------------|---------|
| GET | /api/articulos | Ninguno | ✅ |
| GET | /api/articulos/:id | Ninguno | ✅ |
| GET | /api/articulos/codigo/:codigo | Ninguno | ✅ |
| POST | /api/articulos | EMPLEADO+ | ❌ |
| PUT | /api/articulos/:id | EMPLEADO+ | ❌ |
| DELETE | /api/articulos/:id | EMPLEADO+ | ❌ |
| PATCH | /api/articulos/:id/stock | EMPLEADO+ | ❌ |

---

## Ejemplos de Request con cURL

### Crear categoría (ADMIN)
```bash
curl -X POST http://localhost:4800/api/categorias \
  -H "Authorization: Bearer <token_admin>" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Bebidas Alcohólicas",
    "descripcion": "Vinos, cervezas y licores"
  }'
```

### Buscar artículos por categoría
```bash
curl "http://localhost:4800/api/articulos?idcategoria=1&page=1&limit=5"
```

### Buscar artículos por nombre
```bash
curl "http://localhost:4800/api/articulos?search=manzana&orderBy=precio_asc"
```

### Crear artículo (EMPLEADO)
```bash
curl -X POST http://localhost:4800/api/articulos \
  -H "Authorization: Bearer <token_empleado>" \
  -H "Content-Type: application/json" \
  -d '{
    "codigo": "FRU005",
    "nombre": "Naranja Valencia",
    "precio_venta": 2.80,
    "stock": 200,
    "descripcion": "Naranjas dulces kg",
    "idcategoria": 1
  }'
```

### Actualizar stock
```bash
curl -X PATCH http://localhost:4800/api/articulos/1/stock \
  -H "Authorization: Bearer <token_empleado>" \
  -H "Content-Type: application/json" \
  -d '{ "cantidad": -30 }'
```

---

## Notas Importantes

1. **Soft Delete:** Las categorías y artículos no se eliminan realmente, solo se marcan como inactivos (condicion = 0)
2. **Validaciones:** Se validan duplicados de nombre y código
3. **Relaciones:** Al obtener artículos, se incluye automáticamente la información de categoría
4. **Paginación:** La búsqueda soporta paginación con limit y page
5. **Búsqueda:** Se puede buscar por nombre, descripción o código simultáneamente

---

## Próximos Pasos

1. ✅ DW-004: CRUD Categorías completado
2. ✅ DW-005: CRUD Artículos mejorado completado
3. **DW-006:** Carrito en backend
4. **DW-007:** Módulo de Checkout/Ventas

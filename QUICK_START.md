# 🚀 QUICK START - Cómo Usar lo Implementado

## 1. Ejecutar el Script SQL

```bash
# Opción A: Desde terminal MySQL
mysql -u root -p < backend/sql/01_schema_mvp.sql

# Opción B: Desde MySQL Workbench
1. File → Open SQL Script
2. Seleccionar backend/sql/01_schema_mvp.sql
3. Ctrl+Enter para ejecutar
```

**Resultado:**
- BD `db_ionic` creada
- 10 tablas con datos seeded
- 3 vistas SQL para reportes

---

## 2. Verificar la Instalación del Backend

```bash
cd backend

# Ver que dependencias estén instaladas
npm list

# Si falta algo, instalar
npm install

# Iniciar servidor
npm start
# o
node index.js
```

**Esperado:**
```
Server is running on port 4800.
Drop and re-sync db.
```

---

## 3. Testing Rápido de APIs

### Crear cuenta de prueba (CLIENTE)
```bash
curl -X POST http://localhost:4800/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Test",
    "email": "juan@test.com",
    "clave": "Test123456"
  }'
```

**Respuesta esperada:**
```json
{
  "message": "Usuario creado exitosamente",
  "usuario": {
    "idusuario": 4,
    "nombre": "Juan Test",
    "email": "juan@test.com",
    "rol": {
      "idrol": 1,
      "nombre": "cliente"
    }
  }
}
```

### Hacer login
```bash
curl -X POST http://localhost:4800/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@test.com",
    "clave": "Test123456"
  }'
```

**Guardar el token devuelto:**
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Obtener perfil
```bash
curl http://localhost:4800/api/auth/profile \
  -H "Authorization: Bearer $TOKEN"
```

### Listar categorías (PÚBLICO)
```bash
curl http://localhost:4800/api/categorias
```

### Listar artículos (PÚBLICO)
```bash
# Todos
curl http://localhost:4800/api/articulos

# Con filtros
curl "http://localhost:4800/api/articulos?idcategoria=1&page=1&limit=5"

# Con búsqueda
curl "http://localhost:4800/api/articulos?search=manzana&orderBy=precio_asc"
```

---

## 4. Usuarios de Prueba (Pre-seeded)

### Admin
```
Email: admin@marketmanager.com
Clave: password123
Rol: admin (idrol = 4)
```

### Empleado
```
Email: empleado@marketmanager.com
Clave: password123
Rol: empleado (idrol = 3)
```

### Cliente (Demo)
```
Email: cliente@example.com
Clave: password123
Rol: cliente (idrol = 1)
```

---

## 5. Operaciones Comunes por Rol

### Como ADMIN
```bash
# Login
TOKEN_ADMIN=$(curl -s -X POST http://localhost:4800/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@marketmanager.com","clave":"password123"}' \
  | jq -r '.accessToken')

# Crear categoría
curl -X POST http://localhost:4800/api/categorias \
  -H "Authorization: Bearer $TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Bebidas Alcohólicas",
    "descripcion": "Vinos, cervezas y licores"
  }'
```

### Como EMPLEADO
```bash
# Login
TOKEN_EMP=$(curl -s -X POST http://localhost:4800/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"empleado@marketmanager.com","clave":"password123"}' \
  | jq -r '.accessToken')

# Crear artículo
curl -X POST http://localhost:4800/api/articulos \
  -H "Authorization: Bearer $TOKEN_EMP" \
  -H "Content-Type: application/json" \
  -d '{
    "codigo": "BEB100",
    "nombre": "Vino Tinto Reserva",
    "precio_venta": 15.99,
    "stock": 50,
    "descripcion": "Vino tinto de Rioja",
    "idcategoria": 6
  }'

# Actualizar stock
curl -X PATCH http://localhost:4800/api/articulos/1/stock \
  -H "Authorization: Bearer $TOKEN_EMP" \
  -H "Content-Type: application/json" \
  -d '{ "cantidad": 25 }'
```

### Como CLIENTE
```bash
# Login
TOKEN_CLI=$(curl -s -X POST http://localhost:4800/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"cliente@example.com","clave":"password123"}' \
  | jq -r '.accessToken')

# Ver perfil
curl http://localhost:4800/api/auth/profile \
  -H "Authorization: Bearer $TOKEN_CLI"

# Ver artículos (sin necesidad de token)
curl http://localhost:4800/api/articulos

# Actualizar perfil
curl -X PUT http://localhost:4800/api/auth/profile \
  -H "Authorization: Bearer $TOKEN_CLI" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Cliente Actualizado",
    "telefono": "600123456"
  }'
```

---

## 6. Uso en Postman (Recomendado)

1. **Importar colección:**
   - File → Import
   - Seleccionar `/backend/postman_collection.json` (si existe)
   - Sino, crear manualmente

2. **Crear variables de entorno:**
   - Settings → Environments → New
   - Variables:
     - `base_url`: http://localhost:4800
     - `token`: (se actualiza con cada login)
     - `token_admin`: (token del admin)

3. **Crear requests:**
   - **Auth Register:** POST /api/auth/register
   - **Auth Login:** POST /api/auth/login
   - **Get Categories:** GET /api/categorias
   - **Get Articulos:** GET /api/articulos
   - **Create Articulo:** POST /api/articulos (requiere token_admin)

---

## 7. Estructura de Directorios Clave

```
backend/
├── sql/
│   ├── 01_schema_mvp.sql         ← Ejecutar primero
│   └── README.md
│
├── models/
│   ├── usuario.model.js          ← Modelo de usuarios con roles
│   ├── articulo.model.js         ← Modelo de productos
│   ├── categoria.model.js        ← Modelo de categorías
│   ├── venta.model.js            ← Modelo de compras (próximo)
│   ├── index.js                  ← Relaciones
│   └── README.md
│
├── controllers/
│   ├── auth.controller.js        ← Login, registro, perfil
│   ├── articulo.controller.js    ← CRUD productos
│   ├── categoria.controller.js   ← CRUD categorías
│   ├── README_AUTH.md
│   └── README_CATEGORIAS_ARTICULOS.md
│
├── routes/
│   ├── auth.routes.js            ← /api/auth/*
│   ├── articulos.routes.js       ← /api/articulos/*
│   ├── categorias.routes.js      ← /api/categorias/*
│   └── [otros]
│
├── middlewares/
│   └── authJwt.js                ← Validación de roles
│
└── index.js                       ← Punto de entrada
```

---

## 8. Errores Comunes y Soluciones

### Error: "No token provided"
```
Causa: Falta token en el header
Solución: Incluir header: Authorization: Bearer <token>
```

### Error: "Acceso denegado. Se requiere rol Admin"
```
Causa: Usuario no tiene rol suficiente
Solución: Usar token de admin o empleado según operación
```

### Error: "Categoría no encontrada" al crear artículo
```
Causa: idcategoria no existe
Solución: Obtener IDs válidos con: GET /api/categorias
```

### Error: "No se puede eliminar. El artículo tiene historial"
```
Causa: Artículo tiene transacciones
Solución: Solo crear artículos nuevos, no eliminar usados
```

---

## 9. Próximas Tareas (DW-006+)

Después de validar que esto funciona:

1. **DW-006:** Carrito en backend
   - POST /api/carrito
   - GET /api/carrito
   - DELETE /api/carrito/:id

2. **DW-007:** Checkout y Ventas
   - POST /api/ventas
   - GET /api/ventas
   - GET /api/historial-compras

3. **Frontend:** Actualizar componentes para consumir nuevas APIs

---

## 10. Documentación Completa

Para información detallada, ver:

- **Base de datos:** `backend/sql/README.md`
- **Modelos:** `backend/models/README.md`
- **Autenticación:** `backend/controllers/README_AUTH.md`
- **APIs:** `backend/controllers/README_CATEGORIAS_ARTICULOS.md`
- **Progreso:** `PROGRESO_SPRINT1.md`
- **Resumen:** `RESUMEN_IMPLEMENTACION.md`

---

## 📝 Nota Final

Este es el MVP funcional con:
- ✅ 10 tablas BD
- ✅ Autenticación con roles
- ✅ CRUD de categorías y artículos
- ✅ 21 endpoints
- ✅ Validaciones robustas

**Falta:** Carrito, Checkout, Historial (DW-006 a DW-012)

**Tiempo restante Sprint 1:** ~21 horas
**Estado:** On schedule ✅

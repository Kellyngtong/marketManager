# Sistema de Roles y Autenticación - MVP Sprint 1

## Descripción General

El sistema de autenticación ha sido completamente refactorizado para soportar un modelo de roles basado en la tabla `rol` de la BD:

1. **Cliente** (idrol = 1) - Usuario cliente estándar
2. **Premium** (idrol = 2) - Cliente con beneficios premium
3. **Empleado** (idrol = 3) - Empleado del negocio
4. **Admin** (idrol = 4) - Administrador del sistema

## Cambios Realizados

### Controlador: `auth.controller.js`

#### Métodos Disponibles:

1. **register(req, res)** - Registrar nuevo usuario
   - Campos requeridos: `nombre`, `email`, `clave`
   - Campos opcionales: `idrol` (default=1, cliente), `telefono`, `direccion`, `num_documento`
   - Devuelve: Usuario creado con rol incluido
   - Endpoint: `POST /api/auth/register`

2. **login(req, res)** - Autenticar usuario y generar JWT
   - Campos requeridos: `email`, `clave`
   - Devuelve: Token JWT + información del usuario con rol
   - Endpoint: `POST /api/auth/login`
   - Token incluye: `idusuario`, `email`, `idrol`, `rolNombre`
   - Duración: 24 horas

3. **getProfile(req, res)** - Obtener perfil del usuario autenticado
   - Requiere: Token válido
   - Devuelve: Información del usuario sin contraseña
   - Endpoint: `GET /api/auth/profile`

4. **updateProfile(req, res)** - Actualizar perfil del usuario
   - Requiere: Token válido
   - Campos actualizables: `nombre`, `telefono`, `direccion`
   - Endpoint: `PUT /api/auth/profile`

### Middleware: `authJwt.js`

#### Middlewares Disponibles:

1. **verifyToken** - Verifica que el JWT sea válido
   - Se ejecuta en todas las rutas protegidas
   - Extrae información del token en `req.idusuario`, `req.idrol`, `req.rolNombre`
   - Soporta headers: `x-access-token` o `Authorization: Bearer <token>`

2. **isCliente** - Verifica que el usuario sea Cliente (idrol = 1)
   - Uso: `router.get('/ruta', authJwt.verifyToken, authJwt.isCliente, controller.metodo)`

3. **isPremium** - Verifica que el usuario sea Premium (idrol = 2)

4. **isEmpleado** - Verifica que el usuario sea Empleado (idrol = 3)

5. **isAdmin** - Verifica que el usuario sea Admin (idrol = 4)

6. **isEmpleadoOrAdmin** - Verifica que el usuario sea Empleado o Admin (idrol >= 3)
   - Uso para operaciones que solo empleados pueden hacer

7. **isPremiumOrHigher** - Verifica Premium, Empleado o Admin (idrol >= 2)
   - Uso para beneficios premium

8. **hasRole(rolesArray)** - Verifica si el usuario tiene uno de varios roles
   - Uso: `router.post('/ruta', authJwt.verifyToken, authJwt.hasRole([3, 4]), ...)`
   - Verifica si idrol está en el array proporcionado

## Ejemplo de Uso en Rutas

```javascript
// Rutas de autenticación (públicas)
router.post("/register", authController.register);
router.post("/login", authController.login);

// Ruta protegida - solo autenticados
router.get(
  "/profile",
  authJwt.verifyToken,
  authController.getProfile
);

// Ruta protegida - solo empleados y admin
router.post(
  "/api/ingresos",
  authJwt.verifyToken,
  authJwt.isEmpleadoOrAdmin,
  ingresoController.create
);

// Ruta protegida - solo admin
router.get(
  "/api/admin/usuarios",
  authJwt.verifyToken,
  authJwt.isAdmin,
  usuarioController.getAll
);

// Ruta con múltiples roles
router.post(
  "/api/ventas",
  authJwt.verifyToken,
  authJwt.hasRole([1, 2, 3]), // Cliente, Premium, Empleado (no Admin)
  ventaController.create
);
```

## Estructura del JWT

```json
{
  "idusuario": 1,
  "email": "usuario@example.com",
  "idrol": 3,
  "rolNombre": "empleado",
  "iat": 1697894400,
  "exp": 1697980800
}
```

## Flujo de Autenticación

```
1. Usuario completa formulario de LOGIN
2. Frontend envía POST /api/auth/login { email, clave }
3. Backend verifica credenciales en tabla usuario
4. Si es válido, genera JWT con información del rol
5. Frontend almacena token en localStorage
6. Frontend envía token en header: Authorization: Bearer <token>
7. Middleware verifyToken extrae idusuario e idrol de la BD implícitamente
8. Endpoint verifica acceso según rol
```

## Seguridad

### Implementado:
- ✅ Contraseñas hasheadas con bcrypt (10 salts)
- ✅ JWT con expiración de 24h
- ✅ Validación de rol en cada endpoint
- ✅ No se devuelven contraseñas en respuestas
- ✅ Verificación de usuario activo (condicion = 1)

### Recomendaciones para Producción:
- Usar HTTPS obligatorio
- Implementar refresh tokens
- Añadir rate limiting en login
- Implementar 2FA para admin
- Usar variables de entorno para JWT_SECRET
- Implementar CORS restrictivo

## Ejemplo de Request/Response

### Register
```bash
POST /api/auth/register
Content-Type: application/json

{
  "nombre": "Juan García",
  "email": "juan@example.com",
  "clave": "password123",
  "telefono": "600123456"
}

Response 201:
{
  "message": "Usuario creado exitosamente",
  "usuario": {
    "idusuario": 5,
    "nombre": "Juan García",
    "email": "juan@example.com",
    "rol": {
      "idrol": 1,
      "nombre": "cliente"
    }
  }
}
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "juan@example.com",
  "clave": "password123"
}

Response 200:
{
  "message": "Login exitoso",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "idusuario": 5,
    "nombre": "Juan García",
    "email": "juan@example.com",
    "rol": {
      "idrol": 1,
      "nombre": "cliente"
    }
  }
}
```

### Get Profile
```bash
GET /api/auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Response 200:
{
  "usuario": {
    "idusuario": 5,
    "nombre": "Juan García",
    "email": "juan@example.com",
    "telefono": "600123456",
    "rol": { ... }
  }
}
```

## Próximos Pasos

1. ✅ **DW-003:** Sistema de roles completado
2. **DW-004:** Crear CRUD de categorías con control de roles
3. **DW-005:** Expandir CRUD de artículos
4. **DW-006:** Implementar carrito en backend

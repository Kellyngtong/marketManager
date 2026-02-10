# Modelos Sequelize - MVP Sprint 1

## Descripción General

Todos los modelos están definidos siguiendo el esquema relacional del documento de alcance. Cada archivo es un modelo independiente que se integra en `index.js` donde se establecen las relaciones.

## Modelos del MVP

### 1. **Rol** (`rol.model.js`)
- **Tabla:** `rol`
- **Atributos clave:** idrol, nombre, descripcion, condicion
- **Relaciones:** 1:N con Usuario
- **Valores iniciales:** cliente, premium, empleado, admin

### 2. **Categoría** (`categoria.model.js`)
- **Tabla:** `categoria`
- **Atributos clave:** idcategoria, nombre, descripcion, condicion
- **Relaciones:** 1:N con Artículo
- **Valores iniciales:** 8 categorías (Frutas, Verduras, Carnes, etc.)

### 3. **Usuario** (`usuario.model.js`)
- **Tabla:** `usuario`
- **Atributos clave:** idusuario, idrol, nombre, email, clave, avatar, condicion
- **Relaciones:** 
  - N:1 con Rol (cada usuario tiene un rol)
  - 1:N con Ingreso
  - 1:N con Venta
- **Validaciones:** email UNIQUE, clave NOT NULL
- **Notas:** Contraseña (clave) debe almacenarse hasheada con bcrypt

### 4. **Cliente** (`cliente.model.js`)
- **Tabla:** `cliente`
- **Atributos clave:** idcliente, nombre, email, telefono, direccion, num_documento
- **Relaciones:** 1:N con Venta
- **Notas:** Entidad independiente de Usuario (clientes ≠ empleados)

### 5. **Proveedor** (`proveedor.model.js`)
- **Tabla:** `proveedor`
- **Atributos clave:** idproveedor, nombre, email, telefono, direccion, num_documento
- **Relaciones:** 1:N con Ingreso

### 6. **Artículo** (`articulo.model.js`)
- **Tabla:** `articulo`
- **Atributos clave:** idarticulo, idcategoria, codigo, nombre, precio_venta, stock, imagen
- **Relaciones:**
  - N:1 con Categoría
  - 1:N con DetalleIngreso
  - 1:N con DetalleVenta
- **Validaciones:** nombre UNIQUE, codigo UNIQUE
- **Mapeo:** Antiguo modelo "product" → nuevo modelo "articulo"

### 7. **Ingreso** (`ingreso.model.js`) - Compras a Proveedores
- **Tabla:** `ingreso`
- **Atributos clave:** idingreso, idproveedor, idusuario, num_comprobante, total, estado
- **Relaciones:**
  - N:1 con Proveedor
  - N:1 con Usuario
  - 1:N con DetalleIngreso
- **Estados posibles:** pendiente, recibido, cancelado
- **Sprint:** MVP (Sprint 1)

### 8. **DetalleIngreso** (`detalle_ingreso.model.js`)
- **Tabla:** `detalle_ingreso`
- **Atributos clave:** iddetalle_ingreso, idingreso, idarticulo, cantidad, precio_compra, precio_venta
- **Relaciones:**
  - N:1 con Ingreso (ON DELETE CASCADE)
  - N:1 con Artículo
- **Notas:** Líneas de cada compra a proveedor

### 9. **Venta** (`venta.model.js`) - Ventas a Clientes
- **Tabla:** `venta`
- **Atributos clave:** idventa, idcliente, idusuario, num_comprobante, total, estado
- **Relaciones:**
  - N:1 con Cliente
  - N:1 con Usuario (empleado que registra la venta)
  - 1:N con DetalleVenta
- **Estados posibles:** pendiente, confirmada, cancelada, devuelta
- **Sprint:** MVP (Sprint 1) - CRÍTICO

### 10. **DetalleVenta** (`detalle_venta.model.js`)
- **Tabla:** `detalle_venta`
- **Atributos clave:** iddetalle_venta, idventa, idarticulo, cantidad, precio, descuento
- **Relaciones:**
  - N:1 con Venta (ON DELETE CASCADE)
  - N:1 con Artículo
- **Notas:** Líneas de cada venta a cliente

## Relaciones Diagram

```
ROL (1) ──────────(N) USUARIO ──────┬───────(1) INGRESO ────(N) DETALLE_INGRESO
                                     │                             │
                                     └───────(1) VENTA ────(N) DETALLE_VENTA
                                     
CATEGORIA (1) ────────(N) ARTICULO ──┬───────(N) DETALLE_INGRESO
                                      └───────(N) DETALLE_VENTA
                                      
PROVEEDOR (1) ────────(N) INGRESO
CLIENTE (1) ────────(N) VENTA
```

## Sincronización con BD

Sequelize sincronizará automáticamente la BD en el arranque si está configurado (`db.sequelize.sync()`):

```javascript
db.sequelize.sync({ alter: true });  // Actualiza tablas existentes
// o
db.sequelize.sync({ force: true });  // Elimina y recrea todo (CUIDADO!)
```

**Para producción:** Usar migraciones en lugar de `sync()`.

## Compatibilidad Legacy

Mantiene compatibilidad con modelos antiguos:
- `db.products` → Modelo antiguo (usar `db.articulo` en código nuevo)
- `db.users` → Modelo antiguo (usar `db.usuario` en código nuevo)

Estos se eliminarán en Sprint 2 una vez migrado completamente el frontend.

## Próximos Pasos

1. ✅ **DW-002:** Modelos Sequelize completados
2. **DW-003:** Implementar middleware de autenticación con roles
3. **DW-004:** Crear CRUD de categorías
4. **DW-005:** Expandir CRUD de artículos

## Nota Importante

El carrito NO tiene tabla en BD según el modelo relacional formal. Persiste únicamente en el frontend (localStorage). La implementación de carrito persistente será opcional en Sprint 2.

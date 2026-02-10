# Script SQL - MVP Sprint 1

## Descripción

Este script SQL (`01_schema_mvp.sql`) crea la estructura completa de la base de datos para el MVP del e-commerce **MarketManager**, alineado exactamente con el modelo relacional del documento de alcance.

## Modelo Relacional - Tablas Creadas

### Tablas Base:
1. **rol** - Tipos de usuarios (cliente, premium, empleado, admin)
2. **categoria** - Categorías de productos (frutas, verduras, carnes, etc.)

### Tablas de Entidades Principales:
3. **usuario** - Usuarios del sistema (empleados y admin)
4. **cliente** - Clientes que realizan compras (independiente de usuario)
5. **proveedor** - Proveedores/distribuidores

### Tablas de Catálogo:
6. **articulo** - Productos del catálogo (con referencia a categoría)

### Tablas de Operaciones - Compras a Proveedores:
7. **ingreso** - Compras realizadas a proveedores
8. **detalle_ingreso** - Líneas de cada compra a proveedor

### Tablas de Operaciones - Ventas a Clientes:
9. **venta** - Ventas realizadas a clientes
10. **detalle_venta** - Líneas de cada venta a cliente

## Relaciones Clave:

```
usuario -> rol
articulo -> categoria
ingreso -> proveedor, usuario
detalle_ingreso -> ingreso, articulo
venta -> cliente, usuario
detalle_venta -> venta, articulo
```

## Datos Iniciales (Seeding):

El script carga automáticamente:
- **Roles:** cliente, premium, empleado, admin
- **Categorías:** 8 categorías (Frutas, Verduras, Carnes, Pescados, Lácteos, Bebidas, Congelados, Panadería)
- **Usuarios:** admin + empleado (con contraseña hasheada)
- **Clientes:** 3 clientes demo
- **Proveedores:** 3 proveedores demo
- **Artículos:** 16 productos con stock

**Nota:** Las contraseñas en usuarios demo usan bcrypt hash para "password123"

## Vistas SQL Creadas:

- `v_articulos_con_categoria` - Listado de artículos con nombre de categoría y precio
- `v_reporte_stock` - Reporte de stock con niveles (Crítico, Bajo, Normal, Suficiente)
- `v_resumen_ventas` - Resumen de ventas con cliente, usuario y cantidad de items

## Cómo Ejecutar:

### Opción 1: MySQL CLI
```bash
mysql -u root -p < backend/sql/01_schema_mvp.sql
```

### Opción 2: MySQL Workbench
1. File → Open SQL Script
2. Seleccionar `01_schema_mvp.sql`
3. Execute (Ctrl+Enter)

### Opción 3: Desde Node.js (a crear en próximos pasos)
Ver archivo `backend/scripts/init-db.js`

## Características del Schema:

- ✅ Integridad referencial con FOREIGN KEYS
- ✅ Índices en campos frecuentemente consultados
- ✅ CASCADE DELETE para mantener consistencia
- ✅ UTF-8 para soporte de caracteres especiales
- ✅ Timestamps automáticos (en próximas versiones)
- ✅ Campo `condicion` BOOLEAN para soft delete lógico

## Diferencias con MVP Inicial:

| Aspecto | Anterior | Actual |
|---------|----------|--------|
| Tablas | 2 (users, products) | 10 (estructura completa) |
| Roles | No existe | Implementado con 4 tipos |
| Categorías | Sin tabla | Tabla `categoria` |
| Carrito | En BD | No persistente (frontend solo) |
| Clientes | Combinado con usuario | Tabla separada |
| Ventas | No existe | Tabla `venta` + `detalle_venta` |
| Compras a proveedor | No existe | Tabla `ingreso` + `detalle_ingreso` |

## Próximos Pasos:

1. ✅ **DW-001:** Script SQL completado
2. **DW-002:** Crear modelos Sequelize para todas las tablas
3. **DW-003:** Implementar sistema de roles en autenticación
4. **DW-004:** Crear CRUD de categorías
5. **DW-005:** Expandir CRUD de artículos/productos

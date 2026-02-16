-- =====================================================
-- SCRIPT SQL - MVP SPRINT 1
-- Base de datos: db_ionic
-- Fecha: 10-02-2026
-- Descripción: Tablas según modelo relacional del documento de alcance
-- =====================================================

DROP DATABASE IF EXISTS market_manager;
CREATE DATABASE market_manager;
USE market_manager;

-- =====================================================
-- 1. TABLA: categoria
-- Descripción: Categorías de productos
-- =====================================================
CREATE TABLE categoria (
  idcategoria INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  descripcion VARCHAR(256) NULL,
  condicion BOOLEAN DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 2. TABLA: rol
-- Descripción: Tipos de usuarios (cliente, premium, empleado, admin)
-- =====================================================
CREATE TABLE rol (
  idrol INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(30) NOT NULL UNIQUE,
  descripcion VARCHAR(256) NULL,
  condicion BOOLEAN DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 3. TABLA: proveedor
-- Descripción: Proveedores/Distribuidores
-- =====================================================
CREATE TABLE proveedor (
  idproveedor INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  tipo_documento VARCHAR(20),
  num_documento VARCHAR(20),
  direccion VARCHAR(70),
  telefono VARCHAR(20),
  email VARCHAR(50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 4. TABLA: cliente
-- Descripción: Clientes que realizan compras
-- =====================================================
CREATE TABLE cliente (
  idcliente INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  tipo_documento VARCHAR(20),
  num_documento VARCHAR(20),
  direccion VARCHAR(70),
  telefono VARCHAR(20),
  email VARCHAR(50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 5. TABLA: usuario
-- Descripción: Usuarios del sistema (empleados, admin)
-- =====================================================
CREATE TABLE usuario (
  idusuario INT AUTO_INCREMENT PRIMARY KEY,
  idrol INT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  tipo_documento VARCHAR(20),
  num_documento VARCHAR(20),
  direccion VARCHAR(70),
  telefono VARCHAR(20),
  email VARCHAR(50) NOT NULL UNIQUE,
  clave VARCHAR(255) NOT NULL,
  avatar VARCHAR(255),
  condicion BOOLEAN DEFAULT 1,
  CONSTRAINT fk_usuario_rol FOREIGN KEY (idrol) REFERENCES rol(idrol) ON DELETE CASCADE,
  INDEX idx_email (email),
  INDEX idx_idrol (idrol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 6. TABLA: articulo
-- Descripción: Productos/Artículos del catálogo
-- =====================================================
CREATE TABLE articulo (
  idarticulo INT AUTO_INCREMENT PRIMARY KEY,
  idcategoria INT NOT NULL,
  codigo VARCHAR(50) UNIQUE,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  tipo VARCHAR(50),
  precio_venta DECIMAL(11, 2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  oferta BOOLEAN DEFAULT 0,
  descripcion VARCHAR(256),
  imagen VARCHAR(255),
  condicion BOOLEAN DEFAULT 1,
  CONSTRAINT fk_articulo_categoria FOREIGN KEY (idcategoria) REFERENCES categoria(idcategoria) ON DELETE CASCADE,
  INDEX idx_idcategoria (idcategoria),
  INDEX idx_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 7. TABLA: ingreso
-- Descripción: Compras a proveedores
-- =====================================================
CREATE TABLE ingreso (
  idingreso INT AUTO_INCREMENT PRIMARY KEY,
  idproveedor INT NOT NULL,
  idusuario INT NOT NULL,
  tipo_comprobante VARCHAR(20) NOT NULL,
  serie_comprobante VARCHAR(7),
  num_comprobante VARCHAR(10) NOT NULL,
  fecha_hora DATETIME NOT NULL,
  impuesto DECIMAL(4, 2) NOT NULL DEFAULT 0,
  total DECIMAL(11, 2) NOT NULL,
  estado VARCHAR(20) NOT NULL,
  CONSTRAINT fk_ingreso_proveedor FOREIGN KEY (idproveedor) REFERENCES proveedor(idproveedor) ON DELETE CASCADE,
  CONSTRAINT fk_ingreso_usuario FOREIGN KEY (idusuario) REFERENCES usuario(idusuario) ON DELETE CASCADE,
  INDEX idx_idproveedor (idproveedor),
  INDEX idx_idusuario (idusuario),
  INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 8. TABLA: detalle_ingreso
-- Descripción: Líneas de compra a proveedores
-- =====================================================
CREATE TABLE detalle_ingreso (
  iddetalle_ingreso INT AUTO_INCREMENT PRIMARY KEY,
  idingreso INT NOT NULL,
  idarticulo INT NOT NULL,
  cantidad INT NOT NULL,
  precio_compra DECIMAL(11, 2) NOT NULL,
  precio_venta DECIMAL(11, 2) NOT NULL,
  CONSTRAINT fk_detalle_ingreso FOREIGN KEY (idingreso) REFERENCES ingreso(idingreso) ON DELETE CASCADE,
  CONSTRAINT fk_detalle_ingreso_articulo FOREIGN KEY (idarticulo) REFERENCES articulo(idarticulo) ON DELETE CASCADE,
  INDEX idx_idingreso (idingreso)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 9. TABLA: venta
-- Descripción: Ventas a clientes
-- =====================================================
CREATE TABLE venta (
  idventa INT AUTO_INCREMENT PRIMARY KEY,
  idcliente INT NOT NULL,
  idusuario INT NOT NULL,
  tipo_comprobante VARCHAR(20) NOT NULL,
  serie_comprobante VARCHAR(7),
  num_comprobante VARCHAR(10) NOT NULL,
  fecha_hora DATETIME NOT NULL,
  impuesto DECIMAL(4, 2) NOT NULL DEFAULT 0,
  total DECIMAL(11, 2) NOT NULL,
  estado VARCHAR(20) NOT NULL,
  CONSTRAINT fk_venta_cliente FOREIGN KEY (idcliente) REFERENCES cliente(idcliente) ON DELETE CASCADE,
  CONSTRAINT fk_venta_usuario FOREIGN KEY (idusuario) REFERENCES usuario(idusuario) ON DELETE CASCADE,
  INDEX idx_idcliente (idcliente),
  INDEX idx_idusuario (idusuario),
  INDEX idx_estado (estado),
  INDEX idx_fecha_hora (fecha_hora)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 10. TABLA: detalle_venta
-- Descripción: Líneas de venta a clientes
-- =====================================================
CREATE TABLE detalle_venta (
  iddetalle_venta INT AUTO_INCREMENT PRIMARY KEY,
  idventa INT NOT NULL,
  idarticulo INT NOT NULL,
  cantidad INT NOT NULL,
  precio DECIMAL(11, 2) NOT NULL,
  descuento DECIMAL(11, 2) NOT NULL DEFAULT 0,
  CONSTRAINT fk_detalle_venta FOREIGN KEY (idventa) REFERENCES venta(idventa) ON DELETE CASCADE,
  CONSTRAINT fk_detalle_venta_articulo FOREIGN KEY (idarticulo) REFERENCES articulo(idarticulo) ON DELETE CASCADE,
  INDEX idx_idventa (idventa)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- INSERTS INICIALES - DATOS SEEDED
-- =====================================================

-- 1. Insertar roles
INSERT INTO rol (nombre, descripcion, condicion) VALUES
('cliente', 'Usuario cliente estándar', 1),
('premium', 'Cliente premium con beneficios', 1),
('empleado', 'Empleado del negocio', 1),
('admin', 'Administrador del sistema', 1);

-- 2. Insertar categorías
INSERT INTO categoria (nombre, descripcion, condicion) VALUES
('Frutas', 'Frutas frescas y de calidad', 1),
('Verduras', 'Verduras y hortalizas frescas', 1),
('Carnes', 'Carnes de calidad premium', 1),
('Pescados', 'Pescados y mariscos frescos', 1),
('Lácteos', 'Productos lácteos variados', 1),
('Bebidas', 'Bebidas variadas', 1),
('Congelados', 'Productos congelados', 1),
('Panadería', 'Pan y productos de panadería', 1);

-- 3. Insertar usuarios del sistema (contraseñas: password123 hasheadas)
-- Hash: $2b$10$YIjlrHdWJ6R0NvhiG7pPR.5e7pR5qPqJ2T3qQ2n.yXV3k4mPl.0Rm
INSERT INTO usuario (idrol, nombre, email, clave, condicion) VALUES
(4, 'Admin System', 'admin@marketmanager.com', '$2b$10$YIjlrHdWJ6R0NvhiG7pPR.5e7pR5qPqJ2T3qQ2n.yXV3k4mPl.0Rm', 1),
(3, 'Juan García', 'empleado@marketmanager.com', '$2b$10$YIjlrHdWJ6R0NvhiG7pPR.5e7pR5qPqJ2T3qQ2n.yXV3k4mPl.0Rm', 1);

-- 4. Insertar clientes
INSERT INTO cliente (nombre, email, telefono) VALUES
('Cliente Demo', 'cliente@example.com', '600000000'),
('Juan Pérez García', 'juan@example.com', '600111111'),
('María López Rodríguez', 'maria@example.com', '600222222');

-- 5. Insertar proveedores
INSERT INTO proveedor (nombre, email, telefono) VALUES
('Proveedor Frutas García', 'garcia@proveedorfrutas.com', '600123456'),
('Distribuidora Carnes España', 'lopez@carnesespana.com', '600234567'),
('Pescadería Marina', 'ruiz@marinafresh.com', '600345678');

-- 6. Insertar artículos/productos
INSERT INTO articulo (idcategoria, codigo, nombre, precio_venta, stock, descripcion) VALUES
(1, 'FRU001', 'Manzana Roja', 2.50, 150, 'Manzanas rojas frescas kg'),
(1, 'FRU002', 'Plátano', 1.80, 200, 'Plátanos maduros kg'),
(1, 'FRU003', 'Naranja', 2.20, 120, 'Naranjas jugosas kg'),
(2, 'VER001', 'Tomate', 3.50, 100, 'Tomates rojos frescos kg'),
(2, 'VER002', 'Lechuga', 1.50, 80, 'Lechuga iceberg fresca'),
(2, 'VER003', 'Zanahoria', 1.20, 150, 'Zanahorias frescas kg'),
(3, 'CAR001', 'Pechuga de Pollo', 8.50, 60, 'Pechuga de pollo fresca kg'),
(3, 'CAR002', 'Filete de Ternera', 15.99, 40, 'Filete de ternera premium kg'),
(4, 'PES001', 'Merluza Fresca', 12.50, 50, 'Merluza fresca kg'),
(4, 'PES002', 'Salmón Fresco', 18.99, 30, 'Salmón fresco kg'),
(5, 'LAC001', 'Leche Desnatada', 1.20, 200, 'Leche desnatada 1L'),
(5, 'LAC002', 'Queso Manchego', 16.50, 45, 'Queso manchego curado kg'),
(6, 'BEB001', 'Agua Mineral', 0.80, 300, 'Agua mineral 1.5L'),
(6, 'BEB002', 'Zumo Natural', 2.50, 100, 'Zumo natural naranja 1L'),
(7, 'CON001', 'Croquetas Congeladas', 6.99, 70, 'Croquetas de jamón congeladas 500g'),
(8, 'PAN001', 'Pan Integral', 1.85, 50, 'Pan integral 400g');

-- =====================================================
-- VIEWS ÚTILES
-- =====================================================

-- Vista: Artículos con categoría
CREATE OR REPLACE VIEW v_articulos_con_categoria AS
SELECT 
  a.idarticulo,
  a.codigo,
  a.nombre,
  a.descripcion,
  a.precio_venta,
  a.stock,
  a.imagen,
  a.condicion,
  c.nombre AS categoria_nombre
FROM articulo a
LEFT JOIN categoria c ON a.idcategoria = c.idcategoria
WHERE a.condicion = 1 AND c.condicion = 1;

-- Vista: Reporte de stock
CREATE OR REPLACE VIEW v_reporte_stock AS
SELECT 
  a.idarticulo,
  a.nombre,
  c.nombre AS categoria,
  a.stock,
  a.precio_venta,
  CASE 
    WHEN a.stock < 20 THEN 'Crítico'
    WHEN a.stock < 50 THEN 'Bajo'
    WHEN a.stock < 100 THEN 'Normal'
    ELSE 'Suficiente'
  END AS nivel_stock
FROM articulo a
LEFT JOIN categoria c ON a.idcategoria = c.idcategoria
WHERE a.condicion = 1
ORDER BY a.stock ASC;

-- Vista: Resumen de ventas
CREATE OR REPLACE VIEW v_resumen_ventas AS
SELECT 
  v.idventa,
  c.nombre AS cliente,
  u.nombre AS usuario,
  v.total,
  v.estado,
  COUNT(dv.iddetalle_venta) AS items_count,
  v.fecha_hora
FROM venta v
LEFT JOIN cliente c ON v.idcliente = c.idcliente
LEFT JOIN usuario u ON v.idusuario = u.idusuario
LEFT JOIN detalle_venta dv ON v.idventa = dv.idventa
GROUP BY v.idventa;

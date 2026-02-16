-- =====================================================
-- SCRIPT SQL - MULTITENANT IMPLEMENTATION
-- Fecha: 14-02-2026
-- Descripción: Agregar soporte multitenant al sistema
-- =====================================================

-- =====================================================
-- 1. TABLA: tenant
-- Descripción: Clientes/Empresas (SaaS)
-- =====================================================
CREATE TABLE IF NOT EXISTS tenant (
  id_tenant INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  plan VARCHAR(20) DEFAULT 'free',
  estado BOOLEAN DEFAULT 1,
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_plan (plan),
  INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 2. TABLA: store
-- Descripción: Tiendas dentro de cada tenant
-- =====================================================
CREATE TABLE IF NOT EXISTS store (
  id_store INT AUTO_INCREMENT PRIMARY KEY,
  id_tenant INT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  direccion VARCHAR(200),
  telefono VARCHAR(20),
  email VARCHAR(100),
  estado BOOLEAN DEFAULT 1,
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_store_tenant FOREIGN KEY (id_tenant) REFERENCES tenant(id_tenant) ON DELETE CASCADE,
  INDEX idx_id_tenant (id_tenant),
  INDEX idx_estado (estado),
  UNIQUE KEY uk_store_nombre (id_tenant, nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 3. ALTER EXISTING TABLES - ADD TENANT COLUMNS
-- =====================================================

-- Usuario
ALTER TABLE usuario ADD COLUMN id_tenant INT AFTER idusuario;
ALTER TABLE usuario ADD COLUMN id_store INT AFTER id_tenant;
ALTER TABLE usuario ADD CONSTRAINT fk_usuario_tenant FOREIGN KEY (id_tenant) REFERENCES tenant(id_tenant) ON DELETE CASCADE;
ALTER TABLE usuario ADD CONSTRAINT fk_usuario_store FOREIGN KEY (id_store) REFERENCES store(id_store) ON DELETE SET NULL;
ALTER TABLE usuario ADD INDEX idx_usuario_id_tenant (id_tenant);
ALTER TABLE usuario ADD INDEX idx_usuario_id_store (id_store);

-- Categoria
ALTER TABLE categoria ADD COLUMN id_tenant INT AFTER idcategoria;
ALTER TABLE categoria ADD CONSTRAINT fk_categoria_tenant FOREIGN KEY (id_tenant) REFERENCES tenant(id_tenant) ON DELETE CASCADE;
ALTER TABLE categoria ADD INDEX idx_categoria_id_tenant (id_tenant);
ALTER TABLE categoria ADD UNIQUE KEY uk_categoria_nombre (id_tenant, nombre);

-- Articulo
ALTER TABLE articulo ADD COLUMN id_tenant INT AFTER idarticulo;
ALTER TABLE articulo ADD COLUMN id_store INT AFTER id_tenant;
ALTER TABLE articulo ADD CONSTRAINT fk_articulo_tenant FOREIGN KEY (id_tenant) REFERENCES tenant(id_tenant) ON DELETE CASCADE;
ALTER TABLE articulo ADD CONSTRAINT fk_articulo_store FOREIGN KEY (id_store) REFERENCES store(id_store) ON DELETE CASCADE;
ALTER TABLE articulo ADD INDEX idx_articulo_id_tenant (id_tenant);
ALTER TABLE articulo ADD INDEX idx_articulo_id_store (id_store);
ALTER TABLE articulo ADD UNIQUE KEY uk_articulo_nombre (id_tenant, id_store, nombre);

-- Cliente
ALTER TABLE cliente ADD COLUMN id_tenant INT AFTER idcliente;
ALTER TABLE cliente ADD COLUMN id_store INT AFTER id_tenant;
ALTER TABLE cliente ADD CONSTRAINT fk_cliente_tenant FOREIGN KEY (id_tenant) REFERENCES tenant(id_tenant) ON DELETE CASCADE;
ALTER TABLE cliente ADD CONSTRAINT fk_cliente_store FOREIGN KEY (id_store) REFERENCES store(id_store) ON DELETE CASCADE;
ALTER TABLE cliente ADD INDEX idx_cliente_id_tenant (id_tenant);
ALTER TABLE cliente ADD INDEX idx_cliente_id_store (id_store);

-- Proveedor
ALTER TABLE proveedor ADD COLUMN id_tenant INT AFTER idproveedor;
ALTER TABLE proveedor ADD CONSTRAINT fk_proveedor_tenant FOREIGN KEY (id_tenant) REFERENCES tenant(id_tenant) ON DELETE CASCADE;
ALTER TABLE proveedor ADD INDEX idx_proveedor_id_tenant (id_tenant);

-- Ingreso
ALTER TABLE ingreso ADD COLUMN id_tenant INT AFTER idingreso;
ALTER TABLE ingreso ADD COLUMN id_store INT AFTER id_tenant;
ALTER TABLE ingreso ADD CONSTRAINT fk_ingreso_tenant FOREIGN KEY (id_tenant) REFERENCES tenant(id_tenant) ON DELETE CASCADE;
ALTER TABLE ingreso ADD CONSTRAINT fk_ingreso_store FOREIGN KEY (id_store) REFERENCES store(id_store) ON DELETE CASCADE;
ALTER TABLE ingreso ADD INDEX idx_ingreso_id_tenant (id_tenant);
ALTER TABLE ingreso ADD INDEX idx_ingreso_id_store (id_store);

-- Venta
ALTER TABLE venta ADD COLUMN id_tenant INT AFTER idventa;
ALTER TABLE venta ADD COLUMN id_store INT AFTER id_tenant;
ALTER TABLE venta ADD CONSTRAINT fk_venta_tenant FOREIGN KEY (id_tenant) REFERENCES tenant(id_tenant) ON DELETE CASCADE;
ALTER TABLE venta ADD CONSTRAINT fk_venta_store FOREIGN KEY (id_store) REFERENCES store(id_store) ON DELETE CASCADE;
ALTER TABLE venta ADD INDEX idx_venta_id_tenant (id_tenant);
ALTER TABLE venta ADD INDEX idx_venta_id_store (id_store);

-- =====================================================
-- 4. INSERT DATA - DEFAULT TENANT
-- =====================================================
INSERT IGNORE INTO tenant (nombre, email, plan) VALUES 
('MarketManager Admin', 'admin@marketmanager.local', 'enterprise');

INSERT IGNORE INTO store (id_tenant, nombre, direccion, telefono) VALUES 
(1, 'Tienda Principal', 'Calle Principal 123', '555-0001');

-- =====================================================
-- FIN DEL SCRIPT MULTITENANT
-- =====================================================

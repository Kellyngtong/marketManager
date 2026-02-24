-- =====================================================
-- MIGRATION 03 - Customer snapshot on venta
-- Guarda nombre/teléfono/dirección del comprador en el pedido
-- =====================================================

ALTER TABLE venta
  ADD COLUMN cliente_nombre VARCHAR(100) NULL AFTER estado,
  ADD COLUMN cliente_telefono VARCHAR(20) NULL AFTER cliente_nombre,
  ADD COLUMN cliente_direccion VARCHAR(180) NULL AFTER cliente_telefono;

-- Backfill para pedidos existentes
UPDATE venta v
LEFT JOIN cliente c ON c.idcliente = v.idcliente
LEFT JOIN usuario u ON u.idusuario = v.idusuario
SET
  v.cliente_nombre = COALESCE(NULLIF(TRIM(v.cliente_nombre), ''), NULLIF(TRIM(c.nombre), ''), NULLIF(TRIM(u.nombre), '')),
  v.cliente_telefono = COALESCE(NULLIF(TRIM(v.cliente_telefono), ''), NULLIF(TRIM(c.telefono), ''), NULLIF(TRIM(u.telefono), '')),
  v.cliente_direccion = COALESCE(NULLIF(TRIM(v.cliente_direccion), ''), NULLIF(TRIM(c.direccion), ''), NULLIF(TRIM(u.direccion), ''));

-- Agregar columna precio_oferta si no existe
ALTER TABLE articulo ADD COLUMN IF NOT EXISTS precio_oferta DECIMAL(11,2) NULL;

-- Crear 5 ofertas (30-40% de descuento)
-- Seleccionamos productos de diferentes categorías

-- 1. Fruta - Manzanas (30% descuento)
UPDATE articulo 
SET oferta = 1, precio_oferta = ROUND(precio_venta * 0.70, 2)
WHERE nombre LIKE '%Manzana%' OR nombre LIKE '%manzana%'
LIMIT 1;

-- 2. Verdura - Lechuga (35% descuento)
UPDATE articulo 
SET oferta = 1, precio_oferta = ROUND(precio_venta * 0.65, 2)
WHERE nombre LIKE '%Lechuga%' OR nombre LIKE '%lechuga%'
LIMIT 1;

-- 3. Carne - Pechuga Pollo (40% descuento)
UPDATE articulo 
SET oferta = 1, precio_oferta = ROUND(precio_venta * 0.60, 2)
WHERE nombre LIKE '%Pechuga%' OR nombre LIKE '%pechuga%'
LIMIT 1;

-- 4. Pescado - Salmón (35% descuento)
UPDATE articulo 
SET oferta = 1, precio_oferta = ROUND(precio_venta * 0.65, 2)
WHERE nombre LIKE '%Salmón%' OR nombre LIKE '%salmón%'
LIMIT 1;

-- 5. Embutido - Jamón Serrano (30% descuento)
UPDATE articulo 
SET oferta = 1, precio_oferta = ROUND(precio_venta * 0.70, 2)
WHERE nombre LIKE '%Jamón%' OR nombre LIKE '%jamón%' OR nombre LIKE '%Serrano%' OR nombre LIKE '%serrano%'
LIMIT 1;

-- Verificar las ofertas creadas
SELECT idarticulo, nombre, precio_venta, precio_oferta, oferta 
FROM articulo 
WHERE oferta = 1
ORDER BY idarticulo;

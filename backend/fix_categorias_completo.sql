-- Reorganizar todas las categorías correctamente
-- 1 = Frutas, 2 = Verduras, 3 = Carnes, 4 = Pescados, 5 = Lácteos, 6 = Bebidas, 7 = Congelados, 8 = Panadería

-- Frutas (1)
UPDATE articulo SET idcategoria = 1 WHERE nombre IN ('Manzana Roja 2', 'Manzanas Golden 1kg', 'Naranja', 'Naranjas Valencia 1kg', 'Plátano', 'Plátano Orgánico 1kg', 'Zanahoria');

-- Verduras (2)
UPDATE articulo SET idcategoria = 2 WHERE nombre IN ('Brócoli 1 unidad', 'Lechuga', 'Lechuga Romana 1 unidad', 'Tomate', 'Tomate Cherry 500g');

-- Carnes (3)
UPDATE articulo SET idcategoria = 3 WHERE nombre IN ('Filete de Res Angus 1kg', 'Filete de Ternera', 'Pechuga de Pollo', 'Pechuga Pollo 1kg');

-- Pescados (4)
UPDATE articulo SET idcategoria = 4 WHERE nombre IN ('Bacalao 600g', 'Merluza Fresca', 'Salmón Fresco', 'Salmón Fresco 500g');

-- Lácteos (5)
UPDATE articulo SET idcategoria = 5 WHERE nombre IN ('Leche Desnatada', 'Queso Manchego');

-- Bebidas (6)
UPDATE articulo SET idcategoria = 6 WHERE nombre IN ('Agua Mineral', 'Agua Mineral 1L', 'Agua Mineral 1.5L', 'Zumo Natural', 'Jugo Naranja Natural 1L', 'Coca Cola 330ml', 'Cerveza Premium Pack 6', 'Vino Tinto Crianza 750ml', 'Vino Tinto Reserva', 'Aceite de Oliva', 'Café Molido 500g');

-- Congelados (7)
UPDATE articulo SET idcategoria = 7 WHERE nombre IN ('Croquetas Congeladas');

-- Panadería (8)
UPDATE articulo SET idcategoria = 8 WHERE nombre IN ('Croissants 4 unidades', 'Pan Blanco', 'Pan Integral Artesanal', 'Pan Integral', 'Arroz Blanco', 'Pasta Integral', 'Jamón Serrano', 'Jamón Serrano 200g', 'Mortadela Premium 300g');

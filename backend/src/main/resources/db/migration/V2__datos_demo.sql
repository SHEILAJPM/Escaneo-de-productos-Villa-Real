-- Productos de demostracion. Usan el prefijo GS1 200-299 (uso interno de tienda),
-- asi no se hacen pasar por codigos reales de ninguna empresa.
INSERT INTO productos (gtin, tipo, marca, nombre, contenido, precio, fuente) VALUES
('2001000000012', 'GTIN_13', 'Granja Demo',    'Leche entera',            '1 L', 5.20, 'DEMO'),
('2001000000029', 'GTIN_13', 'Panadería Demo', 'Pan de caja blanco',      '680 g', 8.90, 'DEMO'),
('2001000000036', 'GTIN_13', 'Granja Demo',    'Huevo blanco',            '12 pzas', 9.50, 'DEMO'),
('2001000000043', 'GTIN_13', 'Burbuja',        'Refresco sabor cola',     '600 ml', 3.50, 'DEMO'),
('2001000000050', 'GTIN_13', 'Crujis',         'Galletas de avena',       '300 g', 4.80, 'DEMO'),
('2001000000067', 'GTIN_13', 'Limpio+',        'Detergente en polvo',     '1 kg', 12.90, 'DEMO'),
('2001000000074', 'GTIN_13', 'Mar Azul', 'Atún en agua (hojalata)', '140 g', 6.40, 'DEMO'),
('2001000000081', 'GTIN_13', 'Jugosa',         'Jugo de naranja (Tetra Pak)', '1 L', 7.20, 'DEMO'),
('2001000000098', 'GTIN_13', 'Cristal Demo',   'Salsa picante (vidrio)',  '150 ml', 4.50, 'DEMO'),
('2001000000104', 'GTIN_13', 'Aluvia',         'Bebida energética (aluminio)', '473 ml', 6.90, 'DEMO');

-- Agrupaciones comerciales (GTIN-14): cajas que contienen unidades de venta
INSERT INTO productos (gtin, tipo, marca, nombre, contenido, precio, gtin_contenido, unidades_por_empaque, fuente) VALUES
('12001000000019', 'GTIN_14', 'Granja Demo', 'Caja de leche entera',       '12 x 1 L', 58.00, '2001000000012', 12, 'DEMO'),
('12001000000040', 'GTIN_14', 'Burbuja',     'Caja de refresco sabor cola','24 x 600 ml', 78.00, '2001000000043', 24, 'DEMO');

-- Unidad logistica (SSCC): un pallet, no se vende en caja
INSERT INTO productos (gtin, tipo, marca, nombre, contenido, gtin_contenido, unidades_por_empaque, fuente) VALUES
('020010000000000012', 'SSCC', 'Granja Demo', 'Pallet de leche entera', '40 cajas (480 L)', '12001000000019', 40, 'DEMO');

-- Agregar columna specifications a la tabla products
ALTER TABLE products ADD COLUMN specifications JSONB DEFAULT '[]'::jsonb;

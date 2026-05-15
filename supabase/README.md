# Supabase Woundu

Este directorio contiene las migraciones SQL iniciales del marketplace Woundu.

## Ejecutar migracion inicial

1. Abre el dashboard de Supabase del proyecto.
2. Ve a `SQL Editor`.
3. Copia el contenido de `supabase/migrations/0001_initial_marketplace_schema.sql`.
4. Ejecuta el SQL completo.
5. Verifica en `Table Editor` que existan las tablas:
   - `profiles`
   - `categories`
   - `products`
   - `product_images`
   - `favorites`
   - `reviews`
   - `orders`
   - `order_items`

## Auth

La migracion crea un trigger `on_auth_user_created` para insertar automaticamente un registro en `profiles` cuando Supabase Auth crea un usuario.

Para Google OAuth:

1. Ve a `Authentication > Providers`.
2. Habilita `Google`.
3. Configura las credenciales OAuth de Google.
4. Agrega la URL de callback del proyecto:

```txt
http://localhost:3000/auth/callback
```

Cuando despliegues produccion, agrega tambien:

```txt
https://tu-dominio.com/auth/callback
```

## Seguridad

Todas las tablas principales habilitan RLS. Las politicas iniciales permiten:

- lectura publica de categorias activas y productos activos.
- gestion de productos por su vendedor.
- favoritos privados por usuario.
- reviews publicas con escritura autenticada.
- ordenes visibles solo para comprador o vendedores involucrados.

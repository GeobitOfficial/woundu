-- Reparar o crear el Super Admin para que pueda iniciar sesión.
-- Ejecutar DESPUÉS de las migraciones 0005, 0006 y 0007.
--
-- Credenciales:
--   Email: superadmin@woundu.com
--   Contraseña: Wuondu2026*

create extension if not exists pgcrypto;

do $$
declare
  target_email text := lower('superadmin@woundu.com');
  target_password text := 'Wuondu2026*';
  target_user_id uuid;
  target_instance_id uuid;
begin
  select id, instance_id
  into target_user_id, target_instance_id
  from auth.users
  where lower(email) = target_email
  limit 1;

  if target_user_id is null then
    target_user_id := gen_random_uuid();
    target_instance_id := coalesce(
      (select instance_id from auth.users limit 1),
      '00000000-0000-0000-0000-000000000000'::uuid
    );

    insert into auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) values (
      target_user_id,
      target_instance_id,
      'authenticated',
      'authenticated',
      target_email,
      crypt(target_password, gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Super Admin Woundu"}'::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      ''
    );

    insert into auth.identities (
      id,
      user_id,
      provider_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) values (
      gen_random_uuid(),
      target_user_id,
      target_user_id::text,
      jsonb_build_object('sub', target_user_id::text, 'email', target_email),
      'email',
      now(),
      now(),
      now()
    );

    raise notice 'Usuario super admin creado: %', target_email;
  else
    update auth.users
    set
      encrypted_password = crypt(target_password, gen_salt('bf')),
      email_confirmed_at = coalesce(email_confirmed_at, now()),
      updated_at = now()
    where id = target_user_id;

    update auth.identities
    set
      provider_id = target_user_id::text,
      identity_data = jsonb_build_object('sub', target_user_id::text, 'email', target_email),
      updated_at = now()
    where user_id = target_user_id
      and provider = 'email';

    if not found then
      insert into auth.identities (
        id,
        user_id,
        provider_id,
        identity_data,
        provider,
        last_sign_in_at,
        created_at,
        updated_at
      ) values (
        gen_random_uuid(),
        target_user_id,
        target_user_id::text,
        jsonb_build_object('sub', target_user_id::text, 'email', target_email),
        'email',
        now(),
        now(),
        now()
      );
    end if;

    raise notice 'Usuario % reparado (contraseña e identidad actualizadas).', target_email;
  end if;

  update public.profiles
  set
    role = 'super_admin'::public.user_role,
    full_name = 'Super Admin Woundu',
    updated_at = now()
  where id = target_user_id;

  if not found then
    insert into public.profiles (id, full_name, role)
    values (
      target_user_id,
      'Super Admin Woundu',
      'super_admin'::public.user_role
    );
  end if;

  raise notice 'Perfil actualizado a super_admin para %.', target_email;
end;
$$;

-- Verificación rápida (debe devolver 1 fila):
select
  u.email,
  u.email_confirmed_at is not null as email_confirmado,
  p.role,
  i.provider,
  i.provider_id
from auth.users u
join public.profiles p on p.id = u.id
left join auth.identities i on i.user_id = u.id and i.provider = 'email'
where lower(u.email) = 'superadmin@woundu.com';

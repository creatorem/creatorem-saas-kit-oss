/*
 * ---------------------------------------------------------------------------------
 * Development Seed - Default Dashboard Auth Account
 * ---------------------------------------------------------------------------------
 *
 * Dev-only seed:
 * - Email: test@test.com
 * - Password: test@test.com
 *
 * This script is idempotent and can be re-run safely.
 */

do $$
declare
  v_email constant text := 'test@test.com';
  v_password constant text := 'test@test.com';
  v_name constant text := 'Test';
  v_now timestamptz := now();
  v_user_id uuid;
begin
  select id
  into v_user_id
  from auth.users
  where email = v_email
  limit 1;

  if v_user_id is null then
    v_user_id := gen_random_uuid();

    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change,
      email_change_token_current,
      reauthentication_token,
      phone_change,
      phone_change_token,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      is_sso_user,
      is_anonymous
    ) values (
      '00000000-0000-0000-0000-000000000000',
      v_user_id,
      'authenticated',
      'authenticated',
      v_email,
      crypt(v_password, gen_salt('bf')),
      v_now,
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('name', v_name),
      v_now,
      v_now,
      false,
      false
    );
  else
    update auth.users
    set
      encrypted_password = crypt(v_password, gen_salt('bf')),
      email_confirmed_at = coalesce(email_confirmed_at, v_now),
      confirmation_token = '',
      recovery_token = '',
      email_change_token_new = '',
      email_change = '',
      email_change_token_current = '',
      reauthentication_token = '',
      phone_change = '',
      phone_change_token = '',
      raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
      raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('name', v_name),
      updated_at = v_now
    where id = v_user_id;
  end if;

  insert into auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  ) values (
    gen_random_uuid(),
    v_user_id,
    jsonb_build_object(
      'sub', v_user_id::text,
      'email', v_email,
      'email_verified', true,
      'phone_verified', false
    ),
    'email',
    v_email,
    v_now,
    v_now,
    v_now
  )
  on conflict (provider_id, provider) do update
    set
      user_id = excluded.user_id,
      identity_data = excluded.identity_data,
      last_sign_in_at = excluded.last_sign_in_at,
      updated_at = excluded.updated_at;

  insert into public.user (id, auth_user_id, name, email, completed_onboarding)
  values (v_user_id, v_user_id, v_name, v_email, true)
  on conflict (id) do update
    set
      name = excluded.name,
      email = excluded.email,
      completed_onboarding = excluded.completed_onboarding;
end
$$;

CREATE OR REPLACE FUNCTION public.can_manage_settings()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT lower(COALESCE(auth.jwt() ->> 'email', '')) = 'marketing@digitaletextil.com.br'
$$;

CREATE OR REPLACE FUNCTION public.list_staff_roles()
RETURNS TABLE (
  user_id uuid,
  display_name text,
  email text,
  role public.app_role
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT p.user_id, p.display_name, p.email, ur.role
  FROM public.user_roles ur
  JOIN public.profiles p ON p.user_id = ur.user_id
  WHERE public.can_manage_settings()
  ORDER BY p.display_name, p.email
$$;

CREATE OR REPLACE FUNCTION public.protect_settings_owner_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.user_id = '84b240dc-49c9-4165-8523-461fdcafde6a'::uuid
     AND OLD.role = 'admin'::public.app_role
     AND (TG_OP = 'DELETE' OR NEW.role <> 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'O administrador principal deve permanecer como administrador';
  END IF;
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$;

REVOKE ALL ON FUNCTION public.protect_settings_owner_role() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.protect_settings_owner_role() TO service_role;

CREATE TRIGGER protect_settings_owner_role_change
BEFORE UPDATE OR DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.protect_settings_owner_role();

CREATE OR REPLACE FUNCTION public.set_staff_role(_target_user_id uuid, _role public.app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF NOT public.can_manage_settings() THEN
    RAISE EXCEPTION 'Acesso negado ao gerenciamento de cargos';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = _target_user_id) THEN
    RAISE EXCEPTION 'Usuário não encontrado';
  END IF;

  IF EXISTS (SELECT 1 FROM public.store_customers sc WHERE sc.user_id = _target_user_id) THEN
    RAISE EXCEPTION 'Contas de clientes da loja não podem receber cargos internos';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (_target_user_id, _role)
  ON CONFLICT (user_id, role) DO NOTHING;

  DELETE FROM public.user_roles
  WHERE user_id = _target_user_id
    AND role <> _role;
END;
$$;
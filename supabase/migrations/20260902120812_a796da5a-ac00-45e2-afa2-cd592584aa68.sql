ALTER TABLE public.store_settings
  ADD COLUMN IF NOT EXISTS design_config jsonb NOT NULL DEFAULT '{"palette":"classic","header_style":"reference","product_columns":4,"show_search":true,"show_contacts":true,"show_announcement":true,"show_featured":true,"show_categories":true}'::jsonb;

CREATE OR REPLACE FUNCTION public.can_manage_settings()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM auth.users u
    WHERE u.id = auth.uid()
      AND lower(u.email) = 'marketing@digitaletextil.com.br'
  )
$$;

REVOKE ALL ON FUNCTION public.can_manage_settings() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_manage_settings() TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_settings() TO service_role;

DROP POLICY IF EXISTS "Admins manage store settings" ON public.store_settings;
CREATE POLICY "Settings owner manages store settings"
ON public.store_settings
FOR ALL
TO authenticated
USING (public.can_manage_settings())
WITH CHECK (public.can_manage_settings());

DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete user_roles" ON public.user_roles;
CREATE POLICY "Settings owner manages roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.can_manage_settings())
WITH CHECK (public.can_manage_settings());

CREATE TABLE public.role_change_audit (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  changed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  target_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  old_role public.app_role,
  new_role public.app_role,
  action text NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.role_change_audit TO authenticated;
GRANT ALL ON public.role_change_audit TO service_role;
ALTER TABLE public.role_change_audit ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Settings owner reads role audit"
ON public.role_change_audit
FOR SELECT
TO authenticated
USING (public.can_manage_settings());

CREATE INDEX role_change_audit_target_idx ON public.role_change_audit (target_user_id, created_at DESC);

CREATE TRIGGER update_role_change_audit_updated_at
BEFORE UPDATE ON public.role_change_audit
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.log_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.role_change_audit (changed_by, target_user_id, old_role, new_role, action)
  VALUES (
    auth.uid(),
    COALESCE(NEW.user_id, OLD.user_id),
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN OLD.role ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN NEW.role ELSE NULL END,
    TG_OP
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

REVOKE ALL ON FUNCTION public.log_role_change() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.log_role_change() TO service_role;

CREATE TRIGGER audit_user_role_changes
AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.log_role_change();

CREATE OR REPLACE FUNCTION public.list_staff_roles()
RETURNS TABLE (
  user_id uuid,
  display_name text,
  email text,
  role public.app_role
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.user_id, p.display_name, u.email::text, ur.role
  FROM public.user_roles ur
  JOIN public.profiles p ON p.user_id = ur.user_id
  JOIN auth.users u ON u.id = ur.user_id
  WHERE public.can_manage_settings()
  ORDER BY p.display_name, u.email
$$;

REVOKE ALL ON FUNCTION public.list_staff_roles() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_staff_roles() TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_staff_roles() TO service_role;

CREATE OR REPLACE FUNCTION public.set_staff_role(_target_user_id uuid, _role public.app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_target_email text;
BEGIN
  IF NOT public.can_manage_settings() THEN
    RAISE EXCEPTION 'Acesso negado ao gerenciamento de cargos';
  END IF;

  SELECT lower(u.email) INTO v_target_email
  FROM auth.users u
  WHERE u.id = _target_user_id;

  IF v_target_email IS NULL THEN
    RAISE EXCEPTION 'Usuário não encontrado';
  END IF;

  IF v_target_email = 'marketing@digitaletextil.com.br' AND _role <> 'admin'::public.app_role THEN
    RAISE EXCEPTION 'O administrador principal deve permanecer como administrador';
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

REVOKE ALL ON FUNCTION public.set_staff_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_staff_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_staff_role(uuid, public.app_role) TO service_role;
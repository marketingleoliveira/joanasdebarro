-- ============ categories extras ============
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_online boolean NOT NULL DEFAULT true;

UPDATE public.categories
SET slug = lower(regexp_replace(translate(name, 'áàãâäéèêëíìîïóòõôöúùûüçÁÀÃÂÄÉÈÊËÍÌÎÏÓÒÕÔÖÚÙÛÜÇ', 'aaaaaeeeeiiiiooooouuuucAAAAAEEEEIIIIOOOOOUUUUC'), '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS categories_slug_key ON public.categories (slug);

GRANT SELECT ON public.categories TO anon;

CREATE POLICY "Public can view online categories"
ON public.categories FOR SELECT TO anon
USING (is_online = true);

-- ============ store_settings ============
CREATE TABLE public.store_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_name text NOT NULL DEFAULT 'Joanas de Barro',
  tagline text NOT NULL DEFAULT 'kit café & arte',
  logo_url text,
  hero_banners jsonb NOT NULL DEFAULT '[]'::jsonb,
  announcement text,
  phone text,
  whatsapp text,
  email text,
  instagram_url text,
  about_text text,
  shipping_flat_rate numeric NOT NULL DEFAULT 0,
  free_shipping_threshold numeric,
  payment_provider text NOT NULL DEFAULT 'manual',
  payment_instructions text,
  payment_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_open boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.store_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.store_settings TO authenticated;
GRANT ALL ON public.store_settings TO service_role;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view store settings" ON public.store_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage store settings" ON public.store_settings FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'))
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

CREATE TRIGGER update_store_settings_updated_at BEFORE UPDATE ON public.store_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.store_settings (store_name, tagline, phone, whatsapp, payment_provider, payment_instructions)
VALUES ('Joanas de Barro', 'kit café & arte', '(11) 99446-2244', '(11) 99446-2244', 'manual', 'Finalize o pedido e entraremos em contato para o pagamento.');

-- ============ product_store_info ============
CREATE TABLE public.product_store_info (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL UNIQUE REFERENCES public.products(id) ON DELETE CASCADE,
  slug text NOT NULL UNIQUE,
  store_title text,
  short_description text,
  store_description text,
  images jsonb NOT NULL DEFAULT '[]'::jsonb,
  promo_price numeric,
  is_online boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.product_store_info TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_store_info TO authenticated;
GRANT ALL ON public.product_store_info TO service_role;
ALTER TABLE public.product_store_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view online product info" ON public.product_store_info FOR SELECT TO anon USING (is_online = true);
CREATE POLICY "Authenticated can view product info" ON public.product_store_info FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage product store info" ON public.product_store_info FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'))
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));

CREATE TRIGGER update_product_store_info_updated_at BEFORE UPDATE ON public.product_store_info
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX product_store_info_online_idx ON public.product_store_info (is_online, sort_order);

-- public read of active products for the storefront
GRANT SELECT ON public.products TO anon;
CREATE POLICY "Public can view active products" ON public.products FOR SELECT TO anon USING (is_active = true);

-- ============ store_customers ============
CREATE TABLE public.store_customers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  full_name text NOT NULL DEFAULT '',
  email text,
  phone text,
  document text,
  address_street text,
  address_number text,
  address_complement text,
  address_district text,
  address_city text,
  address_state text,
  address_zip text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.store_customers TO authenticated;
GRANT ALL ON public.store_customers TO service_role;
ALTER TABLE public.store_customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Store customers manage own record" ON public.store_customers FOR ALL TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Staff can view store customers" ON public.store_customers FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager') OR has_role(auth.uid(), 'seller'));
CREATE POLICY "Admins manage store customers" ON public.store_customers FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_store_customers_updated_at BEFORE UPDATE ON public.store_customers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ store_orders ============
CREATE SEQUENCE IF NOT EXISTS public.store_order_number_seq START 1000;

CREATE TABLE public.store_orders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number bigint NOT NULL DEFAULT nextval('public.store_order_number_seq') UNIQUE,
  store_customer_id uuid REFERENCES public.store_customers(id) ON DELETE SET NULL,
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending',
  payment_status text NOT NULL DEFAULT 'pending',
  payment_method text NOT NULL DEFAULT 'manual',
  payment_reference text,
  subtotal numeric NOT NULL DEFAULT 0,
  shipping_cost numeric NOT NULL DEFAULT 0,
  discount numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  customer_name text NOT NULL DEFAULT '',
  customer_email text,
  customer_phone text,
  shipping_address jsonb NOT NULL DEFAULT '{}'::jsonb,
  notes text,
  sale_id uuid REFERENCES public.sales(id) ON DELETE SET NULL,
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.store_orders TO authenticated;
GRANT ALL ON public.store_orders TO service_role;
GRANT USAGE ON SEQUENCE public.store_order_number_seq TO authenticated, service_role;
ALTER TABLE public.store_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers view own orders" ON public.store_orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Customers create own orders" ON public.store_orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Staff view all orders" ON public.store_orders FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager') OR has_role(auth.uid(), 'seller'));
CREATE POLICY "Staff update orders" ON public.store_orders FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'))
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));
CREATE POLICY "Admins delete orders" ON public.store_orders FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_store_orders_updated_at BEFORE UPDATE ON public.store_orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ store_order_items ============
CREATE TABLE public.store_order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES public.store_orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_name text NOT NULL DEFAULT '',
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.store_order_items TO authenticated;
GRANT ALL ON public.store_order_items TO service_role;
ALTER TABLE public.store_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers view own order items" ON public.store_order_items FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.store_orders o WHERE o.id = order_id AND o.user_id = auth.uid()));
CREATE POLICY "Customers insert own order items" ON public.store_order_items FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.store_orders o WHERE o.id = order_id AND o.user_id = auth.uid()));
CREATE POLICY "Staff view all order items" ON public.store_order_items FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager') OR has_role(auth.uid(), 'seller'));
CREATE POLICY "Admins manage order items" ON public.store_order_items FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE INDEX store_order_items_order_idx ON public.store_order_items (order_id);

-- ============ signup handling: store customers must NOT become staff ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_customer_id uuid;
BEGIN
  INSERT INTO public.profiles (user_id, display_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email), NEW.email);

  IF COALESCE(NEW.raw_user_meta_data->>'account_type', 'staff') = 'customer' THEN
    INSERT INTO public.customers (name, email, phone)
    VALUES (COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email), NEW.email, NEW.raw_user_meta_data->>'phone')
    RETURNING id INTO v_customer_id;

    INSERT INTO public.store_customers (user_id, customer_id, full_name, email, phone)
    VALUES (NEW.id, v_customer_id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email), NEW.email, NEW.raw_user_meta_data->>'phone');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'seller');
  END IF;

  RETURN NEW;
END;
$function$;

-- ============ order -> ERP processing ============
CREATE OR REPLACE FUNCTION public.process_store_order(_order_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_order public.store_orders;
  v_sale_id uuid;
  v_item record;
  v_actor uuid;
BEGIN
  SELECT * INTO v_order FROM public.store_orders WHERE id = _order_id;
  IF v_order.id IS NULL THEN RAISE EXCEPTION 'Pedido nao encontrado'; END IF;
  IF v_order.sale_id IS NOT NULL THEN RETURN v_order.sale_id; END IF;

  v_actor := COALESCE(auth.uid(), v_order.user_id);
  IF v_actor IS NULL THEN RAISE EXCEPTION 'Usuario indefinido para o pedido'; END IF;

  INSERT INTO public.sales (user_id, customer_id, total, discount, payment_method, status, notes)
  VALUES (v_actor, v_order.customer_id, v_order.total, v_order.discount, v_order.payment_method, 'completed',
          'Pedido loja #' || v_order.order_number)
  RETURNING id INTO v_sale_id;

  FOR v_item IN SELECT * FROM public.store_order_items WHERE order_id = _order_id LOOP
    IF v_item.product_id IS NOT NULL THEN
      INSERT INTO public.sale_items (sale_id, product_id, quantity, unit_price, total)
      VALUES (v_sale_id, v_item.product_id, v_item.quantity, v_item.unit_price, v_item.total);

      INSERT INTO public.inventory_movements (product_id, user_id, type, quantity, reason)
      VALUES (v_item.product_id, v_actor, 'out', v_item.quantity, 'Venda loja online #' || v_order.order_number);

      UPDATE public.products SET current_stock = current_stock - v_item.quantity WHERE id = v_item.product_id;
    END IF;
  END LOOP;

  INSERT INTO public.financial_transactions (user_id, type, category, description, amount, date, sale_id, is_paid)
  VALUES (v_actor, 'income', 'Vendas Online', 'Pedido loja #' || v_order.order_number, v_order.total, CURRENT_DATE, v_sale_id, true);

  UPDATE public.store_orders
  SET sale_id = v_sale_id, processed_at = now(), status = CASE WHEN status = 'pending' THEN 'confirmed' ELSE status END
  WHERE id = _order_id;

  RETURN v_sale_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.store_order_payment_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.payment_status = 'paid' AND COALESCE(OLD.payment_status, '') <> 'paid' AND NEW.sale_id IS NULL THEN
    PERFORM public.process_store_order(NEW.id);
  END IF;
  RETURN NEW;
END;
$function$;

CREATE TRIGGER store_orders_paid_after_update
AFTER UPDATE OF payment_status ON public.store_orders
FOR EACH ROW EXECUTE FUNCTION public.store_order_payment_trigger();

CREATE OR REPLACE FUNCTION public.store_order_paid_on_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.payment_status = 'paid' AND NEW.sale_id IS NULL THEN
    PERFORM public.process_store_order(NEW.id);
  END IF;
  RETURN NEW;
END;
$function$;

CREATE TRIGGER store_orders_paid_after_insert
AFTER INSERT ON public.store_orders
FOR EACH ROW EXECUTE FUNCTION public.store_order_paid_on_insert();
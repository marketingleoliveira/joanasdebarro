REVOKE ALL ON FUNCTION public.process_store_order(uuid) FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.store_order_payment_trigger() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.store_order_paid_on_insert() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;
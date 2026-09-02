import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { fetchStoreSettings, formatBRL, shippingFor, StoreSettings } from '@/lib/storeUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { SectionTitle } from './Storefront';

interface Form {
  full_name: string; email: string; phone: string; document: string;
  address_zip: string; address_street: string; address_number: string;
  address_complement: string; address_district: string; address_city: string; address_state: string;
  notes: string;
}

const empty: Form = {
  full_name: '', email: '', phone: '', document: '', address_zip: '', address_street: '',
  address_number: '', address_complement: '', address_district: '', address_city: '', address_state: '', notes: '',
};

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [form, setForm] = useState<Form>(empty);
  const [storeCustomerId, setStoreCustomerId] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.title = 'Finalizar compra | Joanas de Barro';
    fetchStoreSettings().then(setSettings).catch(() => setSettings(null));
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase.from('store_customers').select('*').eq('user_id', user.id).limit(1).maybeSingle()
      .then(({ data }) => {
        const c = data as Record<string, string | null> | null;
        if (!c) return;
        setStoreCustomerId(c.id as string);
        setCustomerId((c.customer_id as string) ?? null);
        setForm((f) => ({
          ...f,
          full_name: c.full_name || user.email || '',
          email: c.email || user.email || '',
          phone: c.phone || '',
          document: c.document || '',
          address_zip: c.address_zip || '',
          address_street: c.address_street || '',
          address_number: c.address_number || '',
          address_complement: c.address_complement || '',
          address_district: c.address_district || '',
          address_city: c.address_city || '',
          address_state: c.address_state || '',
        }));
      });
  }, [user]);

  const shipping = shippingFor(subtotal, settings);
  const total = subtotal + shipping;
  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  if (authLoading) {
    return <div className="container py-20 text-center text-sm text-muted-foreground">Carregando...</div>;
  }

  if (!user) {
    return (
      <div className="container py-20 text-center space-y-4">
        <h1 className="font-display text-2xl">Entre para finalizar sua compra</h1>
        <p className="text-muted-foreground text-sm">O cadastro é obrigatório para comprar. Leva menos de um minuto e seu carrinho continua salvo.</p>
        <Button asChild><Link to="/entrar?next=/checkout">Entrar ou cadastrar</Link></Button>
      </div>
    );
  }


  if (items.length === 0) {
    return (
      <div className="container py-20 text-center space-y-4">
        <h1 className="font-display text-2xl">Seu carrinho está vazio</h1>
        <Button asChild><Link to="/loja">Ver produtos</Link></Button>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.full_name || !form.phone || !form.address_street || !form.address_city) {
      toast({ title: 'Preencha os dados obrigatórios', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      let sCustomerId = storeCustomerId;
      let erpCustomerId = customerId;

      if (!erpCustomerId) {
        const { data: cust, error: cErr } = await supabase
          .from('customers')
          .insert({ name: form.full_name, email: form.email || null, phone: form.phone, address: `${form.address_street}, ${form.address_number} - ${form.address_city}/${form.address_state}` })
          .select('id').single();
        if (cErr) throw cErr;
        erpCustomerId = cust.id;
      }

      const scPayload = {
        user_id: user.id,
        customer_id: erpCustomerId,
        full_name: form.full_name,
        email: form.email || user.email || null,
        phone: form.phone,
        document: form.document || null,
        address_zip: form.address_zip || null,
        address_street: form.address_street,
        address_number: form.address_number || null,
        address_complement: form.address_complement || null,
        address_district: form.address_district || null,
        address_city: form.address_city,
        address_state: form.address_state || null,
      };

      if (sCustomerId) {
        await supabase.from('store_customers').update(scPayload).eq('id', sCustomerId);
      } else {
        const { data: sc, error: sErr } = await supabase.from('store_customers').insert(scPayload).select('id').single();
        if (sErr) throw sErr;
        sCustomerId = sc.id;
      }

      const { data: order, error: oErr } = await supabase
        .from('store_orders')
        .insert({
          store_customer_id: sCustomerId,
          customer_id: erpCustomerId,
          user_id: user.id,
          status: 'pending',
          payment_status: 'pending',
          payment_method: settings?.payment_provider || 'manual',
          subtotal,
          shipping_cost: shipping,
          total,
          customer_name: form.full_name,
          customer_email: form.email || user.email || null,
          customer_phone: form.phone,
          shipping_address: {
            zip: form.address_zip, street: form.address_street, number: form.address_number,
            complement: form.address_complement, district: form.address_district,
            city: form.address_city, state: form.address_state,
          },
          notes: form.notes || null,
        })
        .select('id, order_number').single();
      if (oErr) throw oErr;

      const { error: iErr } = await supabase.from('store_order_items').insert(
        items.map((i) => ({
          order_id: order.id,
          product_id: i.productId,
          product_name: i.name,
          quantity: i.quantity,
          unit_price: i.price,
          total: i.price * i.quantity,
        })),
      );
      if (iErr) throw iErr;

      clear();
      toast({ title: `Pedido #${order.order_number} realizado!`, description: settings?.payment_instructions || 'Entraremos em contato para o pagamento.' });
      navigate('/meus-pedidos');
    } catch (err) {
      toast({ title: 'Erro ao finalizar pedido', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container py-12">
      <SectionTitle title="Finalizar compra" />
      <form onSubmit={submit} className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h2 className="font-display text-lg font-semibold">Seus dados</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nome completo *"><Input value={form.full_name} onChange={set('full_name')} required /></Field>
              <Field label="E-mail"><Input type="email" value={form.email} onChange={set('email')} /></Field>
              <Field label="Telefone / WhatsApp *"><Input value={form.phone} onChange={set('phone')} required /></Field>
              <Field label="CPF/CNPJ"><Input value={form.document} onChange={set('document')} /></Field>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h2 className="font-display text-lg font-semibold">Endereço de entrega</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="CEP"><Input value={form.address_zip} onChange={set('address_zip')} /></Field>
              <Field label="Rua *"><Input value={form.address_street} onChange={set('address_street')} required /></Field>
              <Field label="Número"><Input value={form.address_number} onChange={set('address_number')} /></Field>
              <Field label="Complemento"><Input value={form.address_complement} onChange={set('address_complement')} /></Field>
              <Field label="Bairro"><Input value={form.address_district} onChange={set('address_district')} /></Field>
              <Field label="Cidade *"><Input value={form.address_city} onChange={set('address_city')} required /></Field>
              <Field label="Estado"><Input value={form.address_state} onChange={set('address_state')} maxLength={2} /></Field>
            </div>
            <Field label="Observações do pedido">
              <Textarea value={form.notes} onChange={set('notes')} rows={3} />
            </Field>
          </div>
        </div>

        <aside className="bg-card border border-border rounded-xl p-6 h-fit space-y-3">
          <h2 className="font-display text-lg font-semibold">Resumo</h2>
          {items.map((i) => (
            <div key={i.productId} className="flex justify-between text-sm gap-2">
              <span className="text-muted-foreground line-clamp-1">{i.quantity}x {i.name}</span>
              <span>{formatBRL(i.price * i.quantity)}</span>
            </div>
          ))}
          <div className="border-t border-border pt-3 flex justify-between text-sm"><span>Subtotal</span><span>{formatBRL(subtotal)}</span></div>
          <div className="flex justify-between text-sm"><span>Frete</span><span>{shipping === 0 ? 'Grátis' : formatBRL(shipping)}</span></div>
          <div className="border-t border-border pt-3 flex justify-between font-bold"><span>Total</span><span className="text-primary">{formatBRL(total)}</span></div>
          <p className="text-xs text-muted-foreground">
            {settings?.payment_instructions || 'O pagamento será combinado após a confirmação do pedido.'}
          </p>
          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? 'Enviando...' : 'Confirmar pedido'}
          </Button>
        </aside>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

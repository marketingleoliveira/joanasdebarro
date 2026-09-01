import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { StoreSettings, fetchStoreSettings } from '@/lib/storeUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { Settings as SettingsIcon } from 'lucide-react';

const providers = [
  { value: 'manual', label: 'Combinar depois (manual / WhatsApp)' },
  { value: 'pix', label: 'PIX manual' },
  { value: 'bank_transfer', label: 'Transferência bancária' },
  { value: 'mercadopago', label: 'Mercado Pago (a configurar)' },
  { value: 'pagseguro', label: 'PagSeguro (a configurar)' },
  { value: 'stripe', label: 'Stripe (a configurar)' },
];

export default function SettingsPage() {
  const { userRole } = useAuth();
  const isAdmin = userRole === 'admin' || userRole === 'manager';
  const [s, setS] = useState<StoreSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [pixKey, setPixKey] = useState('');

  useEffect(() => {
    fetchStoreSettings().then((row) => {
      setS(row);
      const cfg = (row?.payment_config ?? {}) as Record<string, string>;
      setPixKey(cfg.pix_key ?? '');
    });
  }, []);

  if (!isAdmin) return <p className="text-muted-foreground">Apenas administradores e gerentes podem alterar as configurações.</p>;
  if (!s) return <p className="text-muted-foreground text-sm">Carregando configurações...</p>;

  const set = <K extends keyof StoreSettings>(k: K, v: StoreSettings[K]) => setS({ ...s, [k]: v });

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from('store_settings').update({
      store_name: s.store_name,
      tagline: s.tagline,
      logo_url: s.logo_url,
      announcement: s.announcement,
      phone: s.phone,
      whatsapp: s.whatsapp,
      email: s.email,
      instagram_url: s.instagram_url,
      about_text: s.about_text,
      shipping_flat_rate: Number(s.shipping_flat_rate) || 0,
      free_shipping_threshold: s.free_shipping_threshold ? Number(s.free_shipping_threshold) : null,
      payment_provider: s.payment_provider,
      payment_instructions: s.payment_instructions,
      payment_config: { pix_key: pixKey },
      is_open: s.is_open,
    }).eq('id', s.id);
    setSaving(false);
    if (error) toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
    else toast({ title: 'Configurações salvas' });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2"><SettingsIcon size={22} /> Configuração</h1>
        <p className="text-sm text-muted-foreground">Dados da loja, frete e método de pagamento.</p>
      </div>

      <Tabs defaultValue="loja">
        <TabsList>
          <TabsTrigger value="loja">Loja</TabsTrigger>
          <TabsTrigger value="frete">Frete</TabsTrigger>
          <TabsTrigger value="pagamento">Pagamento</TabsTrigger>
        </TabsList>

        <TabsContent value="loja" className="bg-card border border-border rounded-xl p-6 grid gap-4 sm:grid-cols-2">
          <F label="Nome da loja"><Input value={s.store_name} onChange={(e) => set('store_name', e.target.value)} /></F>
          <F label="Assinatura (tagline)"><Input value={s.tagline} onChange={(e) => set('tagline', e.target.value)} /></F>
          <F label="URL do logo"><Input value={s.logo_url ?? ''} onChange={(e) => set('logo_url', e.target.value)} /></F>
          <F label="Aviso no topo"><Input value={s.announcement ?? ''} onChange={(e) => set('announcement', e.target.value)} /></F>
          <F label="Telefone"><Input value={s.phone ?? ''} onChange={(e) => set('phone', e.target.value)} /></F>
          <F label="WhatsApp"><Input value={s.whatsapp ?? ''} onChange={(e) => set('whatsapp', e.target.value)} /></F>
          <F label="E-mail"><Input value={s.email ?? ''} onChange={(e) => set('email', e.target.value)} /></F>
          <F label="Instagram"><Input value={s.instagram_url ?? ''} onChange={(e) => set('instagram_url', e.target.value)} /></F>
          <div className="sm:col-span-2"><F label="Sobre a loja"><Textarea rows={3} value={s.about_text ?? ''} onChange={(e) => set('about_text', e.target.value)} /></F></div>
          <div className="sm:col-span-2 flex items-center gap-3">
            <Switch checked={s.is_open} onCheckedChange={(v) => set('is_open', v)} />
            <Label className="text-sm">Loja aberta para pedidos</Label>
          </div>
        </TabsContent>

        <TabsContent value="frete" className="bg-card border border-border rounded-xl p-6 grid gap-4 sm:grid-cols-2">
          <F label="Frete fixo (R$)">
            <Input type="number" step="0.01" value={String(s.shipping_flat_rate ?? 0)} onChange={(e) => set('shipping_flat_rate', Number(e.target.value))} />
          </F>
          <F label="Frete grátis acima de (R$) — vazio = desativado">
            <Input type="number" step="0.01" value={s.free_shipping_threshold == null ? '' : String(s.free_shipping_threshold)}
              onChange={(e) => set('free_shipping_threshold', e.target.value === '' ? null : Number(e.target.value))} />
          </F>
          <p className="sm:col-span-2 text-xs text-muted-foreground">
            Deixe o frete fixo em 0 para oferecer frete grátis em todos os pedidos.
          </p>
        </TabsContent>

        <TabsContent value="pagamento" className="bg-card border border-border rounded-xl p-6 grid gap-4">
          <F label="Método de pagamento">
            <Select value={s.payment_provider} onValueChange={(v) => set('payment_provider', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {providers.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </F>
          {(s.payment_provider === 'pix') && (
            <F label="Chave PIX"><Input value={pixKey} onChange={(e) => setPixKey(e.target.value)} /></F>
          )}
          <F label="Instruções mostradas ao cliente no checkout">
            <Textarea rows={3} value={s.payment_instructions ?? ''} onChange={(e) => set('payment_instructions', e.target.value)} />
          </F>
          <p className="text-xs text-muted-foreground">
            Gateways online (Mercado Pago, PagSeguro, Stripe) precisam das credenciais para ativar o pagamento automático — avise quando quiser conectar.
          </p>
        </TabsContent>
      </Tabs>

      <Button onClick={save} disabled={saving}>{saving ? 'Salvando...' : 'Salvar configurações'}</Button>
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs">{label}</Label>{children}</div>;
}

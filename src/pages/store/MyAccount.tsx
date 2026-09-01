import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { SectionTitle } from './Storefront';

const fields = [
  ['full_name', 'Nome completo'],
  ['phone', 'Telefone / WhatsApp'],
  ['document', 'CPF/CNPJ'],
  ['address_zip', 'CEP'],
  ['address_street', 'Rua'],
  ['address_number', 'Número'],
  ['address_complement', 'Complemento'],
  ['address_district', 'Bairro'],
  ['address_city', 'Cidade'],
  ['address_state', 'Estado'],
] as const;

type Data = Record<string, string>;

export default function MyAccount() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<Data>({});
  const [id, setId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { document.title = 'Meus dados | Joanas de Barro'; }, []);

  useEffect(() => {
    if (!user) return;
    supabase.from('store_customers').select('*').eq('user_id', user.id).limit(1).maybeSingle()
      .then(({ data: row }) => {
        const r = row as Data | null;
        if (!r) { setData({ full_name: '', phone: '' }); return; }
        setId(r.id);
        const next: Data = {};
        fields.forEach(([k]) => { next[k] = r[k] ?? ''; });
        setData(next);
      });
  }, [user]);

  if (!loading && !user) {
    return (
      <div className="container py-20 text-center space-y-4">
        <h1 className="font-display text-2xl">Entre na sua conta</h1>
        <Button asChild><Link to="/entrar?next=/minha-conta">Entrar ou cadastrar</Link></Button>
      </div>
    );
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const payload = { ...data, user_id: user.id, email: user.email ?? null };
    const res = id
      ? await supabase.from('store_customers').update(payload).eq('id', id)
      : await supabase.from('store_customers').insert(payload);
    setSaving(false);
    if (res.error) toast({ title: 'Erro ao salvar', description: res.error.message, variant: 'destructive' });
    else toast({ title: 'Dados salvos com sucesso' });
  };

  return (
    <div className="container max-w-3xl py-12">
      <SectionTitle title="Meus dados" />
      <form onSubmit={save} className="bg-card border border-border rounded-xl p-6 grid gap-4 sm:grid-cols-2">
        {fields.map(([k, label]) => (
          <div key={k} className="space-y-1.5">
            <Label className="text-xs">{label}</Label>
            <Input value={data[k] ?? ''} onChange={(e) => setData({ ...data, [k]: e.target.value })} />
          </div>
        ))}
        <div className="sm:col-span-2 flex flex-wrap gap-3 pt-2">
          <Button type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar dados'}</Button>
          <Button asChild variant="secondary" type="button"><Link to="/meus-pedidos">Meus pedidos</Link></Button>
          <Button variant="ghost" type="button" onClick={async () => { await signOut(); navigate('/loja'); }}>Sair</Button>
        </div>
      </form>
    </div>
  );
}

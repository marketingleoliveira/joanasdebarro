import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  StoreProduct, displaySlug, formatBRL, one, slugify, toImages,
} from '@/lib/storeUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { Store, Pencil, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

/* eslint-disable @typescript-eslint/no-explicit-any */

interface Row extends StoreProduct { }

interface EditState {
  product_id: string;
  name: string;
  sell_price: string;
  slug: string;
  store_title: string;
  short_description: string;
  store_description: string;
  images: string;
  promo_price: string;
  is_online: boolean;
  is_featured: boolean;
  sort_order: string;
}

interface OrderRow {
  id: string; order_number: number; customer_name: string; total: number;
  status: string; payment_status: string; created_at: string; sale_id: string | null;
}

export default function StoreAdmin() {
  const { userRole } = useAuth();
  const isAdmin = userRole === 'admin' || userRole === 'manager';
  const [rows, setRows] = useState<Row[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [edit, setEdit] = useState<EditState | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase
      .from('products')
      .select('id,name,description,sell_price,current_stock,unit,image_url,category_id,categories(name,slug),product_store_info(*)')
      .order('name');
    setRows(
      ((data as any[]) ?? []).map((r) => ({
        id: r.id, name: r.name, description: r.description, sell_price: Number(r.sell_price),
        current_stock: Number(r.current_stock), unit: r.unit, image_url: r.image_url,
        category_id: r.category_id, category: one<any>(r.categories), info: one<any>(r.product_store_info),
      })),
    );
    const { data: o } = await supabase
      .from('store_orders')
      .select('id,order_number,customer_name,total,status,payment_status,created_at,sale_id')
      .order('created_at', { ascending: false })
      .limit(50);
    setOrders((o as OrderRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openEdit = (p: Row) => setEdit({
    product_id: p.id,
    name: p.name,
    sell_price: String(p.sell_price),
    slug: p.info?.slug || slugify(p.name),
    store_title: p.info?.store_title || '',
    short_description: p.info?.short_description || '',
    store_description: p.info?.store_description || '',
    images: toImages(p.info?.images).join('\n') || (p.image_url ?? ''),
    promo_price: p.info?.promo_price ? String(p.info.promo_price) : '',
    is_online: p.info?.is_online ?? true,
    is_featured: p.info?.is_featured ?? false,
    sort_order: String(p.info?.sort_order ?? 0),
  });

  const save = async () => {
    if (!edit) return;
    const images = edit.images.split('\n').map((s) => s.trim()).filter(Boolean);
    const { error: pErr } = await supabase
      .from('products')
      .update({ name: edit.name, sell_price: Number(edit.sell_price) || 0, image_url: images[0] ?? null })
      .eq('id', edit.product_id);
    if (pErr) { toast({ title: 'Erro ao salvar produto', description: pErr.message, variant: 'destructive' }); return; }

    const payload = {
      product_id: edit.product_id,
      slug: slugify(edit.slug || edit.name),
      store_title: edit.store_title || null,
      short_description: edit.short_description || null,
      store_description: edit.store_description || null,
      images,
      promo_price: edit.promo_price ? Number(edit.promo_price) : null,
      is_online: edit.is_online,
      is_featured: edit.is_featured,
      sort_order: Number(edit.sort_order) || 0,
    };
    const { error } = await supabase.from('product_store_info').upsert(payload, { onConflict: 'product_id' });
    if (error) { toast({ title: 'Erro ao salvar loja', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Produto atualizado na loja' });
    setEdit(null);
    load();
  };

  const toggleOnline = async (p: Row, value: boolean) => {
    const { error } = await supabase.from('product_store_info').upsert(
      { product_id: p.id, slug: p.info?.slug || slugify(p.name), is_online: value },
      { onConflict: 'product_id' },
    );
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    else load();
  };

  const updateOrder = async (id: string, patch: Record<string, string>) => {
    const { error } = await supabase.from('store_orders').update(patch).eq('id', id);
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Pedido atualizado' }); load(); }
  };

  if (!isAdmin) {
    return <p className="text-muted-foreground">Apenas administradores e gerentes podem gerenciar a loja.</p>;
  }

  const filtered = rows.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2"><Store size={22} /> Loja Online</h1>
          <p className="text-sm text-muted-foreground">Controle a vitrine, fotos, preços e pedidos da loja.</p>
        </div>
        <Button asChild variant="secondary"><Link to="/loja" target="_blank"><ExternalLink size={16} className="mr-2" /> Ver loja</Link></Button>
      </div>

      <Tabs defaultValue="produtos">
        <TabsList>
          <TabsTrigger value="produtos">Produtos na loja</TabsTrigger>
          <TabsTrigger value="pedidos">Pedidos ({orders.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="produtos" className="space-y-4">
          <Input placeholder="Buscar produto..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
          {loading ? <p className="text-muted-foreground text-sm">Carregando...</p> : (
            <div className="grid gap-3">
              {filtered.map((p) => (
                <div key={p.id} className="bg-card border border-border rounded-xl p-4 flex flex-wrap items-center gap-4">
                  <div className="h-14 w-14 rounded-lg bg-muted overflow-hidden shrink-0">
                    {(toImages(p.info?.images)[0] || p.image_url) && (
                      <img src={toImages(p.info?.images)[0] || p.image_url!} alt={p.name} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-[180px]">
                    <p className="font-medium text-sm">{p.info?.store_title || p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatBRL(p.sell_price)}
                      {p.info?.promo_price ? ` → ${formatBRL(Number(p.info.promo_price))}` : ''} · estoque {p.current_stock}
                    </p>
                    <p className="text-xs text-muted-foreground">/produto/{displaySlug(p)}</p>
                  </div>
                  {p.info?.is_featured && <Badge variant="secondary">Destaque</Badge>}
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">Na loja</Label>
                    <Switch checked={p.info?.is_online ?? true} onCheckedChange={(v) => toggleOnline(p, v)} />
                  </div>
                  <Button size="sm" variant="outline" onClick={() => openEdit(p)}><Pencil size={14} className="mr-1" /> Editar</Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pedidos" className="space-y-3">
          {orders.length === 0 && <p className="text-sm text-muted-foreground">Nenhum pedido ainda.</p>}
          {orders.map((o) => (
            <div key={o.id} className="bg-card border border-border rounded-xl p-4 flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[180px]">
                <p className="font-medium text-sm">#{o.order_number} · {o.customer_name}</p>
                <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString('pt-BR')} · {formatBRL(o.total)}</p>
              </div>
              <Badge variant="outline">{o.status}</Badge>
              <Badge variant={o.payment_status === 'paid' ? 'default' : 'secondary'}>{o.payment_status}</Badge>
              {o.sale_id ? (
                <Badge variant="secondary">Lançado no ERP</Badge>
              ) : (
                <Button size="sm" onClick={() => updateOrder(o.id, { payment_status: 'paid', status: 'confirmed' })}>
                  Marcar como pago
                </Button>
              )}
              {o.status !== 'cancelled' && (
                <Button size="sm" variant="ghost" onClick={() => updateOrder(o.id, { status: 'cancelled' })}>Cancelar</Button>
              )}
            </div>
          ))}
        </TabsContent>
      </Tabs>

      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Editar produto na loja</DialogTitle></DialogHeader>
          {edit && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5"><Label className="text-xs">Nome (ERP)</Label>
                  <Input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></div>
                <div className="space-y-1.5"><Label className="text-xs">Título na loja</Label>
                  <Input value={edit.store_title} onChange={(e) => setEdit({ ...edit, store_title: e.target.value })} /></div>
                <div className="space-y-1.5"><Label className="text-xs">Preço de venda</Label>
                  <Input type="number" step="0.01" value={edit.sell_price} onChange={(e) => setEdit({ ...edit, sell_price: e.target.value })} /></div>
                <div className="space-y-1.5"><Label className="text-xs">Preço promocional</Label>
                  <Input type="number" step="0.01" value={edit.promo_price} onChange={(e) => setEdit({ ...edit, promo_price: e.target.value })} /></div>
                <div className="space-y-1.5"><Label className="text-xs">Endereço (slug)</Label>
                  <Input value={edit.slug} onChange={(e) => setEdit({ ...edit, slug: e.target.value })} /></div>
                <div className="space-y-1.5"><Label className="text-xs">Ordem</Label>
                  <Input type="number" value={edit.sort_order} onChange={(e) => setEdit({ ...edit, sort_order: e.target.value })} /></div>
              </div>
              <div className="space-y-1.5"><Label className="text-xs">Descrição curta</Label>
                <Input value={edit.short_description} onChange={(e) => setEdit({ ...edit, short_description: e.target.value })} /></div>
              <div className="space-y-1.5"><Label className="text-xs">Descrição completa</Label>
                <Textarea rows={4} value={edit.store_description} onChange={(e) => setEdit({ ...edit, store_description: e.target.value })} /></div>
              <div className="space-y-1.5"><Label className="text-xs">Fotos (uma URL por linha)</Label>
                <Textarea rows={3} value={edit.images} onChange={(e) => setEdit({ ...edit, images: e.target.value })} /></div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2"><Switch checked={edit.is_online} onCheckedChange={(v) => setEdit({ ...edit, is_online: v })} /><Label className="text-xs">Visível na loja</Label></div>
                <div className="flex items-center gap-2"><Switch checked={edit.is_featured} onCheckedChange={(v) => setEdit({ ...edit, is_featured: v })} /><Label className="text-xs">Destaque</Label></div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEdit(null)}>Cancelar</Button>
            <Button onClick={save}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

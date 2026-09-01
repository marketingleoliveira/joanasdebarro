import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { formatBRL } from '@/lib/storeUtils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { SectionTitle } from './Storefront';

interface OrderItem { id: string; product_name: string; quantity: number; unit_price: number; total: number }
interface Order {
  id: string; order_number: number; status: string; payment_status: string;
  subtotal: number; shipping_cost: number; total: number; created_at: string;
  store_order_items: OrderItem[];
}

const statusLabel: Record<string, string> = {
  pending: 'Aguardando confirmação', confirmed: 'Confirmado', shipped: 'Enviado',
  delivered: 'Entregue', cancelled: 'Cancelado',
};
const payLabel: Record<string, string> = { pending: 'Pagamento pendente', paid: 'Pago', refunded: 'Reembolsado', failed: 'Falhou' };

export default function MyOrders() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { document.title = 'Meus pedidos | Joanas de Barro'; }, []);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    supabase
      .from('store_orders')
      .select('id,order_number,status,payment_status,subtotal,shipping_cost,total,created_at,store_order_items(id,product_name,quantity,unit_price,total)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setOrders((data as unknown as Order[]) ?? []);
        setLoading(false);
      });
  }, [user]);

  if (!authLoading && !user) {
    return (
      <div className="container py-20 text-center space-y-4">
        <h1 className="font-display text-2xl">Entre para ver seus pedidos</h1>
        <Button asChild><Link to="/entrar?next=/meus-pedidos">Entrar ou cadastrar</Link></Button>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-12">
      <SectionTitle title="Meus pedidos" />
      {loading ? (
        <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-10 space-y-4">
          <p className="text-muted-foreground">Você ainda não fez pedidos.</p>
          <Button asChild><Link to="/loja">Ver produtos</Link></Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="bg-card border border-border rounded-xl p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">Pedido #{o.order_number}</p>
                  <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString('pt-BR')}</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary">{statusLabel[o.status] ?? o.status}</Badge>
                  <Badge variant={o.payment_status === 'paid' ? 'default' : 'outline'}>{payLabel[o.payment_status] ?? o.payment_status}</Badge>
                </div>
              </div>
              <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                {o.store_order_items?.map((i) => (
                  <li key={i.id} className="flex justify-between gap-3">
                    <span>{i.quantity}x {i.product_name}</span>
                    <span>{formatBRL(i.total)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 pt-3 border-t border-border flex justify-between text-sm">
                <span>Frete: {Number(o.shipping_cost) === 0 ? 'Grátis' : formatBRL(o.shipping_cost)}</span>
                <span className="font-bold text-primary">Total: {formatBRL(o.total)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

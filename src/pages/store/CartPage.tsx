import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { fetchStoreSettings, formatBRL, shippingFor, StoreSettings } from '@/lib/storeUtils';
import { Button } from '@/components/ui/button';
import { Trash2, Minus, Plus, LogIn } from 'lucide-react';
import { SectionTitle } from './Storefront';

export default function CartPage() {
  const { items, subtotal, setQty, remove } = useCart();
  const { user } = useAuth();
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  useEffect(() => {
    document.title = 'Carrinho | Joanas de Barro';
    fetchStoreSettings().then(setSettings).catch(() => setSettings(null));
  }, []);

  const shipping = shippingFor(subtotal, settings);


  return (
    <div className="container py-12">
      <SectionTitle title="Seu carrinho" />
      {items.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground mb-6">Seu carrinho está vazio.</p>
          <Button asChild><Link to="/loja">Ver produtos</Link></Button>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {items.map((i) => (
              <div key={i.productId} className="flex gap-4 bg-card border border-border rounded-xl p-4">
                <Link to={`/produto/${i.slug}`} className="h-20 w-20 rounded-lg overflow-hidden bg-muted shrink-0">
                  {i.image ? <img src={i.image} alt={i.name} className="h-full w-full object-cover" /> : null}
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/produto/${i.slug}`} className="text-sm font-semibold hover:text-primary line-clamp-2">{i.name}</Link>
                  <p className="text-primary font-bold mt-1">{formatBRL(i.price)}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center border border-border rounded-lg">
                      <button className="p-2" onClick={() => setQty(i.productId, i.quantity - 1)} aria-label="Diminuir"><Minus size={14} /></button>
                      <span className="w-8 text-center text-sm">{i.quantity}</span>
                      <button className="p-2" onClick={() => setQty(i.productId, i.quantity + 1)} aria-label="Aumentar"><Plus size={14} /></button>
                    </div>
                    <button className="text-muted-foreground hover:text-destructive" onClick={() => remove(i.productId)} aria-label="Remover">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <p className="text-sm font-semibold whitespace-nowrap">{formatBRL(i.price * i.quantity)}</p>
              </div>
            ))}
          </div>

          <aside className="bg-card border border-border rounded-xl p-6 h-fit space-y-3">
            <h2 className="font-display text-lg font-semibold">Resumo</h2>
            <div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatBRL(subtotal)}</span></div>
            <div className="flex justify-between text-sm">
              <span>Frete</span>
              <span>{shipping === 0 ? 'Grátis' : formatBRL(shipping)}</span>
            </div>
            <div className="border-t border-border pt-3 flex justify-between font-bold">
              <span>Total</span><span className="text-primary">{formatBRL(subtotal + shipping)}</span>
            </div>
            {user ? (
              <Button asChild className="w-full mt-2"><Link to="/checkout">Finalizar compra</Link></Button>
            ) : (
              <>
                <p className="text-xs text-muted-foreground bg-muted/60 rounded-lg p-3">
                  É necessário ter uma conta para finalizar a compra. Seu carrinho fica salvo.
                </p>
                <Button asChild className="w-full mt-2">
                  <Link to="/entrar?next=/checkout"><LogIn size={16} className="mr-2" />Entrar ou criar conta</Link>
                </Button>
              </>
            )}
            <Button asChild variant="ghost" className="w-full"><Link to="/loja">Continuar comprando</Link></Button>

          </aside>
        </div>
      )}
    </div>
  );
}

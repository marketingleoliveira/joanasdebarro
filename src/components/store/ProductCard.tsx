import { Link } from 'react-router-dom';
import { StoreProduct, displaySlug, displayTitle, finalPrice, formatBRL, hasOffer, productImages } from '@/lib/storeUtils';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { toast } from '@/hooks/use-toast';
import { ShoppingCart } from 'lucide-react';

export default function ProductCard({ product }: { product: StoreProduct }) {
  const img = productImages(product)[0];
  const price = finalPrice(product);
  const offer = hasOffer(product);
  const out = product.current_stock <= 0;
  const { add } = useCart();

  const addToCart = () => {
    add({
      productId: product.id,
      name: displayTitle(product),
      slug: displaySlug(product),
      price,
      image: img ?? null,
      stock: product.current_stock,
    }, 1);
    toast({ title: 'Adicionado ao carrinho', description: displayTitle(product) });
  };


  return (
    <article className="group relative flex flex-col bg-card rounded-xl border border-border overflow-hidden transition-shadow hover:shadow-lg">
      {offer && (
        <span className="absolute top-3 left-3 z-10 bg-warning text-warning-foreground text-[11px] font-bold uppercase px-2.5 py-1 rounded-full shadow">
          Oferta!
        </span>
      )}
      {out && (
        <span className="absolute top-3 right-3 z-10 bg-muted text-muted-foreground text-[11px] font-semibold uppercase px-2.5 py-1 rounded-full">
          Esgotado
        </span>
      )}
      <Link to={`/produto/${displaySlug(product)}`} className="block aspect-square bg-muted overflow-hidden">
        {img ? (
          <img
            src={img}
            alt={displayTitle(product)}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-muted-foreground text-sm">Sem foto</div>
        )}
      </Link>

      <div className="flex flex-col flex-1 p-4 text-center">
        <h3 className="text-sm font-semibold text-foreground line-clamp-2 min-h-[2.5rem]">
          <Link to={`/produto/${displaySlug(product)}`} className="hover:text-primary">{displayTitle(product)}</Link>
        </h3>
        <div className="mt-2 mb-4">
          {offer && <p className="text-xs text-muted-foreground line-through">{formatBRL(product.sell_price)}</p>}
          <p className="text-lg font-bold text-primary">{formatBRL(price)}</p>
        </div>
        <div className="mt-auto space-y-2">
          <Button size="sm" className="w-full uppercase tracking-wide text-xs" disabled={out} onClick={addToCart}>
            <ShoppingCart size={14} className="mr-2" />{out ? 'Esgotado' : 'Adicionar'}
          </Button>
          <Button asChild size="sm" variant="outline" className="w-full uppercase tracking-wide text-xs">
            <Link to={`/produto/${displaySlug(product)}`}>Ver opções</Link>
          </Button>
        </div>

      </div>
    </article>
  );
}

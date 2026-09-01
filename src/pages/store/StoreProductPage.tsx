import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  StoreProduct, displaySlug, displayTitle, fetchStoreProductBySlug, fetchStoreProducts,
  finalPrice, formatBRL, hasOffer, productImages,
} from '@/lib/storeUtils';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { Grid, SectionTitle } from './Storefront';
import { Minus, Plus, ShoppingCart } from 'lucide-react';

export default function StoreProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { add } = useCart();
  const [product, setProduct] = useState<StoreProduct | null>(null);
  const [related, setRelated] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setQty(1);
    (async () => {
      const p = slug ? await fetchStoreProductBySlug(slug) : null;
      if (!active) return;
      setProduct(p);
      if (p) {
        document.title = `${displayTitle(p)} | Joanas de Barro`;
        const all = await fetchStoreProducts();
        if (active) setRelated(all.filter((x) => x.category_id === p.category_id && x.id !== p.id).slice(0, 4));
      }
      setLoading(false);
    })();
    return () => { active = false; };
  }, [slug]);

  if (loading) return <div className="container py-12"><Skeleton className="h-96 w-full rounded-xl" /></div>;

  if (!product) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-display text-2xl mb-3">Produto não encontrado</h1>
        <Button asChild><Link to="/loja">Voltar para a loja</Link></Button>
      </div>
    );
  }

  const images = productImages(product);
  const price = finalPrice(product);
  const offer = hasOffer(product);
  const out = product.current_stock <= 0;

  const addToCart = (go = false) => {
    add({
      productId: product.id,
      name: displayTitle(product),
      slug: displaySlug(product),
      price,
      image: images[0] ?? null,
      stock: product.current_stock,
    }, qty);
    toast({ title: 'Adicionado ao carrinho', description: displayTitle(product) });
    if (go) navigate('/carrinho');
  };

  return (
    <div className="container py-10">
      <nav className="text-xs text-muted-foreground mb-6">
        <Link to="/loja" className="hover:text-primary">Loja</Link>
        {product.category?.name && <> / <span>{product.category.name}</span></>}
        {' '}/ <span className="text-foreground">{displayTitle(product)}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="aspect-square bg-muted rounded-xl overflow-hidden border border-border">
            {images[activeImg] ? (
              <img src={images[activeImg]} alt={displayTitle(product)} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-muted-foreground">Sem foto</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-3 mt-3 flex-wrap">
              {images.map((img, i) => (
                <button
                  key={img + i}
                  onClick={() => setActiveImg(i)}
                  className={`h-16 w-16 rounded-lg overflow-hidden border-2 ${i === activeImg ? 'border-primary' : 'border-border'}`}
                >
                  <img src={img} alt={`${displayTitle(product)} ${i + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          {offer && (
            <span className="inline-block bg-warning text-warning-foreground text-[11px] font-bold uppercase px-2.5 py-1 rounded-full mb-3">
              Oferta!
            </span>
          )}
          <h1 className="font-display text-3xl font-bold text-foreground">{displayTitle(product)}</h1>
          {product.info?.short_description && (
            <p className="mt-3 text-muted-foreground">{product.info.short_description}</p>
          )}

          <div className="mt-6">
            {offer && <p className="text-sm text-muted-foreground line-through">{formatBRL(product.sell_price)}</p>}
            <p className="text-3xl font-bold text-primary">{formatBRL(price)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {out ? 'Produto esgotado' : `${product.current_stock} ${product.unit} em estoque`}
            </p>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex items-center border border-border rounded-lg">
              <button className="p-2.5" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Diminuir"><Minus size={16} /></button>
              <span className="w-10 text-center text-sm font-medium">{qty}</span>
              <button className="p-2.5" onClick={() => setQty((q) => Math.min(product.current_stock || 1, q + 1))} aria-label="Aumentar"><Plus size={16} /></button>
            </div>
            <Button disabled={out} onClick={() => addToCart(false)} className="flex-1">
              <ShoppingCart size={16} className="mr-2" /> Adicionar
            </Button>
            <Button disabled={out} variant="secondary" onClick={() => addToCart(true)}>Comprar</Button>
          </div>

          {(product.info?.store_description || product.description) && (
            <div className="mt-8 border-t border-border pt-6">
              <h2 className="font-display text-lg font-semibold mb-2">Descrição</h2>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {product.info?.store_description || product.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <SectionTitle title="Você também vai gostar" />
          <Grid products={related} />
        </section>
      )}
    </div>
  );
}

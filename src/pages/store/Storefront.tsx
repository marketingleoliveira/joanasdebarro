import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchStoreProducts, fetchStoreSettings, getStoreDesign, StoreProduct, StoreSettings } from '@/lib/storeUtils';
import ProductCard from '@/components/store/ProductCard';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface Cat { id: string; name: string; slug: string | null; image_url: string | null }

export default function Storefront() {
  const [params] = useSearchParams();
  const q = params.get('q') ?? '';
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [cats, setCats] = useState<Cat[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Loja Joanas de Barro | Cafés especiais e cerâmica';
    Promise.all([fetchStoreProducts(), fetchStoreSettings()])
      .then(([p, s]) => { setProducts(p); setSettings(s); })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
    supabase.from('categories').select('id,name,slug,image_url').order('sort_order')
      .then(({ data }) => setCats((data as Cat[]) ?? []));
  }, []);

  const filtered = useMemo(() => {
    if (!q.trim()) return products;
    const t = q.toLowerCase();
    return products.filter((p) =>
      [p.name, p.info?.store_title, p.description, p.info?.short_description]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(t)),
    );
  }, [products, q]);

  const featured = filtered.filter((p) => p.info?.is_featured);
  const design = getStoreDesign(settings?.design_config);

  const slides: HeroSlide[] = useMemo(() => {
    const base = (featured.length > 0 ? featured : filtered).slice(0, 5).map((p) => ({
      id: p.id,
      title: displayTitle(p),
      subtitle: p.info?.short_description || p.description || null,
      image: productImages(p)[0] ?? null,
      href: `/produto/${displaySlug(p)}`,
    }));
    if (base.length > 0) return base;
    return [
      {
        id: 'default',
        title: settings?.store_name || 'Joanas de Barro',
        subtitle:
          settings?.about_text ||
          'Kit café & arte: cafés especiais e cerâmica artesanal para transformar seu ritual diário.',
        image: null,
        href: null,
      },
    ];
  }, [featured, filtered, settings]);

  return (
    <div>
      {!q && <StoreHeroCarousel slides={slides} className="border-b border-store-border" />}


      {design.show_categories && cats.length > 0 && !q && (
        <section className="container py-10">
          <div className="flex flex-wrap justify-center gap-3">
            {cats.map((c) => (
              <Link
                key={c.id}
                to={`/categoria/${c.slug ?? c.id}`}
                className="px-5 py-2 rounded-full border border-border bg-card text-sm font-medium hover:border-primary hover:text-primary transition-colors"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {design.show_featured && featured.length > 0 && !q && (
        <section className="container pb-8">
          <SectionTitle title="Destaques" />
          <Grid products={featured} columns={design.product_columns} />
        </section>
      )}

      <section className="container pb-12">
        <SectionTitle title={q ? `Resultados para "${q}"` : 'Nossos cafés e acessórios'} />
        {loading ? (
          <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">Nenhum produto encontrado.</p>
        ) : (
          <Grid products={filtered} columns={design.product_columns} />
        )}
      </section>
    </div>
  );
}

export function SectionTitle({ title }: { title: string }) {
  return (
    <div className="text-center mb-8">
      <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-wide text-store-dark">{title}</h2>
      <div className="mt-3 border-t-2 border-dotted border-primary/50 mx-auto max-w-xs" />
    </div>
  );
}

export function Grid({ products, columns = 4 }: { products: StoreProduct[]; columns?: 3 | 4 }) {
  return (
    <div className={columns === 3 ? 'grid grid-cols-2 gap-6 lg:grid-cols-3' : 'grid grid-cols-2 gap-6 lg:grid-cols-4'}>
      {products.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchStoreProducts, StoreProduct } from '@/lib/storeUtils';
import { supabase } from '@/integrations/supabase/client';
import { Grid, SectionTitle } from './Storefront';
import { Skeleton } from '@/components/ui/skeleton';

export default function StoreCategory() {
  const { slug } = useParams<{ slug: string }>();
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [name, setName] = useState('Categoria');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    (async () => {
      const { data: cat } = await supabase
        .from('categories')
        .select('id,name,description,slug')
        .or(`slug.eq.${slug},id.eq.${slug}`)
        .limit(1)
        .maybeSingle();
      const all = await fetchStoreProducts();
      if (!active) return;
      const catRow = cat as { id: string; name: string } | null;
      setName(catRow?.name ?? 'Categoria');
      document.title = `${catRow?.name ?? 'Categoria'} | Joanas de Barro`;
      setProducts(catRow ? all.filter((p) => p.category_id === catRow.id) : []);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [slug]);

  return (
    <div className="container py-12">
      <SectionTitle title={name} />
      {loading ? (
        <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)}
        </div>
      ) : products.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">Nenhum produto nesta categoria por enquanto.</p>
      ) : (
        <Grid products={products} />
      )}
    </div>
  );
}

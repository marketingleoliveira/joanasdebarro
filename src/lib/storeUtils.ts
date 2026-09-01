import { supabase } from '@/integrations/supabase/client';

export const formatBRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v || 0));

export const slugify = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export interface StoreInfo {
  id?: string;
  product_id?: string;
  slug: string;
  store_title: string | null;
  short_description: string | null;
  store_description: string | null;
  images: unknown;
  promo_price: number | null;
  is_online: boolean;
  is_featured: boolean;
  sort_order: number;
}

export interface StoreProduct {
  id: string;
  name: string;
  description: string | null;
  sell_price: number;
  current_stock: number;
  unit: string;
  image_url: string | null;
  category_id: string | null;
  category?: { name: string; slug: string | null } | null;
  info: StoreInfo | null;
}

export const one = <T,>(v: T | T[] | null | undefined): T | null =>
  Array.isArray(v) ? (v[0] ?? null) : (v ?? null);

export const toImages = (images: unknown): string[] => {
  if (Array.isArray(images)) return images.filter((i): i is string => typeof i === 'string');
  return [];
};

export const productImages = (p: StoreProduct): string[] => {
  const imgs = toImages(p.info?.images);
  if (imgs.length) return imgs;
  return p.image_url ? [p.image_url] : [];
};

export const displayTitle = (p: StoreProduct) => p.info?.store_title || p.name;
export const displaySlug = (p: StoreProduct) => p.info?.slug || slugify(p.name);
export const finalPrice = (p: StoreProduct) =>
  p.info?.promo_price && Number(p.info.promo_price) > 0 ? Number(p.info.promo_price) : Number(p.sell_price);
export const hasOffer = (p: StoreProduct) =>
  !!(p.info?.promo_price && Number(p.info.promo_price) > 0 && Number(p.info.promo_price) < Number(p.sell_price));

const SELECT =
  'id,name,description,sell_price,current_stock,unit,image_url,category_id,categories(name,slug),product_store_info(id,product_id,slug,store_title,short_description,store_description,images,promo_price,is_online,is_featured,sort_order)';

/* eslint-disable @typescript-eslint/no-explicit-any */
const normalize = (rows: any[]): StoreProduct[] =>
  rows.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    sell_price: Number(r.sell_price),
    current_stock: Number(r.current_stock),
    unit: r.unit,
    image_url: r.image_url,
    category_id: r.category_id,
    category: one<any>(r.categories),
    info: one<any>(r.product_store_info),
  }));

export async function fetchStoreProducts(): Promise<StoreProduct[]> {
  const { data, error } = await supabase
    .from('products')
    .select(SELECT)
    .eq('is_active', true)
    .order('name');
  if (error) throw error;
  return normalize((data as any[]) || []).filter((p) => p.info?.is_online !== false);
}

export async function fetchStoreProductBySlug(slug: string): Promise<StoreProduct | null> {
  const all = await fetchStoreProducts();
  return all.find((p) => displaySlug(p) === slug) ?? null;
}

export interface StoreSettings {
  id: string;
  store_name: string;
  tagline: string;
  logo_url: string | null;
  hero_banners: unknown;
  announcement: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  instagram_url: string | null;
  about_text: string | null;
  shipping_flat_rate: number;
  free_shipping_threshold: number | null;
  payment_provider: string;
  payment_instructions: string | null;
  payment_config: unknown;
  is_open: boolean;
}

export async function fetchStoreSettings(): Promise<StoreSettings | null> {
  const { data } = await supabase.from('store_settings').select('*').limit(1).maybeSingle();
  return (data as unknown as StoreSettings) ?? null;
}

export function shippingFor(subtotal: number, s: StoreSettings | null): number {
  if (!s) return 0;
  const threshold = s.free_shipping_threshold ? Number(s.free_shipping_threshold) : null;
  if (threshold !== null && threshold > 0 && subtotal >= threshold) return 0;
  return Number(s.shipping_flat_rate || 0);
}

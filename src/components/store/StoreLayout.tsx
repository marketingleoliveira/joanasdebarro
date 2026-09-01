import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Search, ShoppingCart, User, Package, Menu, X } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { fetchStoreSettings, StoreSettings } from '@/lib/storeUtils';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Cat { id: string; name: string; slug: string | null }

export default function StoreLayout() {
  const { count } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [cats, setCats] = useState<Cat[]>([]);
  const [term, setTerm] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetchStoreSettings().then(setSettings).catch(() => setSettings(null));
    supabase
      .from('categories')
      .select('id,name,slug')
      .order('sort_order')
      .then(({ data }) => setCats((data as Cat[]) ?? []));
  }, []);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/loja?q=${encodeURIComponent(term)}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {settings?.announcement && (
        <div className="bg-store-dark text-store-dark-foreground text-center text-xs sm:text-sm py-2 px-4">
          {settings.announcement}
        </div>
      )}

      <header className="store-diamond border-b border-store-border">
        <div className="container py-4 flex items-center gap-4">
          <form onSubmit={onSearch} className="hidden md:flex items-center flex-1 max-w-xs">
            <div className="relative w-full">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="O que você procura?"
                aria-label="Buscar produtos"
                className="w-full rounded-full bg-card/90 border border-store-border pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </form>

          <Link to="/loja" className="flex-1 flex flex-col items-center text-center">
            <span className="font-display text-2xl sm:text-3xl font-bold text-primary leading-none">
              {settings?.store_name || 'Joanas de Barro'}
            </span>
            <span className="text-[11px] sm:text-xs tracking-[0.2em] uppercase text-store-dark/80">
              {settings?.tagline || 'kit café & arte'}
            </span>
          </Link>

          <div className="flex-1 flex items-center justify-end gap-1 sm:gap-3">
            <Link to="/meus-pedidos" className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-store-dark hover:text-primary">
              <Package size={16} /> Meus Pedidos
            </Link>
            <Link to={user ? '/minha-conta' : '/entrar'} className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-store-dark hover:text-primary">
              <User size={16} /> Minha Conta
            </Link>
            <Link to="/carrinho" className="relative p-2 text-store-dark hover:text-primary" aria-label="Carrinho">
              <ShoppingCart size={22} />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {count}
                </span>
              )}
            </Link>
            <button className="md:hidden p-2 text-store-dark" onClick={() => setMenuOpen((v) => !v)} aria-label="Menu">
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        <nav className="hidden md:block border-t border-store-border/70">
          <div className="container flex items-center justify-center gap-8 py-3">
            <NavLink to="/loja" end className={({ isActive }) => cn('text-xs font-semibold tracking-widest uppercase hover:text-primary', isActive ? 'text-primary' : 'text-store-dark')}>
              Loja
            </NavLink>
            {cats.map((c) => (
              <NavLink
                key={c.id}
                to={`/categoria/${c.slug ?? c.id}`}
                className={({ isActive }) => cn('text-xs font-semibold tracking-widest uppercase hover:text-primary', isActive ? 'text-primary' : 'text-store-dark')}
              >
                {c.name}
              </NavLink>
            ))}
          </div>
        </nav>

        {menuOpen && (
          <div className="md:hidden border-t border-store-border/70 bg-card/95 px-4 py-4 space-y-3">
            <form onSubmit={onSearch}>
              <input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Buscar produtos"
                aria-label="Buscar produtos"
                className="w-full rounded-full border border-store-border px-4 py-2 text-sm"
              />
            </form>
            <Link to="/loja" onClick={() => setMenuOpen(false)} className="block text-sm font-medium">Loja</Link>
            {cats.map((c) => (
              <Link key={c.id} to={`/categoria/${c.slug ?? c.id}`} onClick={() => setMenuOpen(false)} className="block text-sm">
                {c.name}
              </Link>
            ))}
            <Link to="/meus-pedidos" onClick={() => setMenuOpen(false)} className="block text-sm">Meus Pedidos</Link>
            <Link to={user ? '/minha-conta' : '/entrar'} onClick={() => setMenuOpen(false)} className="block text-sm">Minha Conta</Link>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="mt-16 bg-store-dark text-store-dark-foreground">
        <div className="container py-10 grid gap-8 sm:grid-cols-3">
          <div>
            <h2 className="font-display text-xl text-primary">{settings?.store_name || 'Joanas de Barro'}</h2>
            <p className="text-sm opacity-80 mt-2">{settings?.about_text || 'Cafés especiais e cerâmica artesanal.'}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-3">Atendimento</h3>
            <ul className="text-sm space-y-1 opacity-80">
              {settings?.phone && <li>Telefone: {settings.phone}</li>}
              {settings?.whatsapp && <li>WhatsApp: {settings.whatsapp}</li>}
              {settings?.email && <li>E-mail: {settings.email}</li>}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-3">Minha conta</h3>
            <div className="flex flex-col gap-2 items-start">
              <Button asChild variant="link" className="h-auto p-0 text-store-dark-foreground/80 hover:text-primary">
                <Link to="/meus-pedidos">Meus pedidos</Link>
              </Button>
              <Button asChild variant="link" className="h-auto p-0 text-store-dark-foreground/80 hover:text-primary">
                <Link to="/minha-conta">Meus dados</Link>
              </Button>
              <Button asChild variant="link" className="h-auto p-0 text-store-dark-foreground/80 hover:text-primary">
                <Link to="/login">Área do funcionário</Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 py-4 text-center text-xs opacity-70">
          © {new Date().getFullYear()} {settings?.store_name || 'Joanas de Barro'}. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}

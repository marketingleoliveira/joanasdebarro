import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ClipboardList, Instagram, Menu, MessageCircle, Phone, Search, ShoppingCart, User, X } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { fetchStoreSettings, getStoreDesign, StoreSettings } from '@/lib/storeUtils';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import brandLogo from '@/assets/joanas-de-barro-logo.png';

interface Cat { id: string; name: string; slug: string | null }

export default function StoreLayout() {
  const { count } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [cats, setCats] = useState<Cat[]>([]);
  const [term, setTerm] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const instagramUrl = settings?.instagram_url || 'https://www.instagram.com/joanas_de_barro/';
  const phone = settings?.phone || '(11) 99446-2244';
  const whatsapp = settings?.whatsapp || '(11) 99446-2244';
  const whatsappDigits = whatsapp.replace(/\D/g, '');
  const design = getStoreDesign(settings?.design_config);

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
    <div className={cn('min-h-screen flex flex-col bg-background', `store-theme-${design.palette}`)}>
      {design.show_announcement && settings?.announcement && (
        <div className="bg-primary px-4 py-2 text-center text-xs font-semibold text-primary-foreground">{settings.announcement}</div>
      )}
      {design.show_contacts && <div className="border-b border-store-border/60 bg-card text-store-dark">
        <div className="container flex min-h-8 items-center justify-between px-4 sm:px-8">
          <a
            href={instagramUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram da Joanas de Barro"
            className="flex h-8 w-8 items-center justify-center bg-primary text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Instagram size={16} aria-hidden="true" />
          </a>
          <div className="hidden items-center gap-5 text-xs md:flex">
            <a href={`https://wa.me/55${whatsappDigits}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-primary">
              <MessageCircle size={14} aria-hidden="true" /> Fale Conosco
            </a>
            <a href={`tel:+55${phone.replace(/\D/g, '')}`} className="flex items-center gap-2 hover:text-primary">
              <Phone size={14} aria-hidden="true" /> Telefone: {phone}
            </a>
            <a href={`https://wa.me/55${whatsappDigits}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-primary">
              <MessageCircle size={14} aria-hidden="true" /> Whatsapp: {whatsapp}
            </a>
          </div>
          <span className="text-xs md:hidden">Joanas de Barro</span>
        </div>
      </div>}

      <header className="store-diamond border-b border-store-border">
        <div className={cn('container grid grid-cols-[1fr_auto] items-center gap-4 px-4 py-4 md:grid-cols-[1fr_220px_1fr] md:px-8', design.header_style === 'compact' ? 'min-h-[104px]' : 'min-h-[140px]')}>
          <div className="hidden max-w-sm md:block">
            <p className="mb-5 text-xs text-store-dark">
              Bem-vindo,{' '}
              <Link to={user ? '/minha-conta' : '/entrar'} className="font-semibold text-primary hover:underline">
                identifique-se
              </Link>{' '}
              para fazer pedidos
            </p>
            {design.show_search && <form onSubmit={onSearch} className="flex w-full border border-store-border bg-card shadow-sm">
              <input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Digite o que você procura"
                aria-label="Buscar produtos"
                className="min-w-0 flex-1 bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-inset focus:ring-primary/40"
              />
              <Button type="submit" size="icon" className="h-9 w-11 shrink-0 rounded-none bg-store-dark text-store-dark-foreground hover:bg-store-dark/90" aria-label="Pesquisar">
                <Search size={17} aria-hidden="true" />
              </Button>
            </form>}
          </div>

          <Link to="/loja" className="flex items-center justify-start md:justify-center" aria-label="Página inicial da Joanas de Barro">
            <img
              src={settings?.logo_url || brandLogo}
              alt="Joanas de Barro — kit café & arte"
              width={816}
              height={816}
              className="h-24 w-24 object-contain sm:h-28 sm:w-28 md:h-32 md:w-32"
            />
          </Link>

          <div className="flex items-center justify-end gap-2">
            <div className="hidden min-w-[264px] md:block">
              <div className="mb-5 flex justify-end gap-5">
                <Link to="/meus-pedidos" className="flex items-center gap-2 text-xs font-medium text-store-dark hover:text-primary">
                  <span className="flex h-6 w-6 items-center justify-center bg-primary text-primary-foreground"><ClipboardList size={14} aria-hidden="true" /></span>
                  Meus Pedidos
                </Link>
                <Link to={user ? '/minha-conta' : '/entrar'} className="flex items-center gap-2 text-xs font-medium text-store-dark hover:text-primary">
                  <span className="flex h-6 w-6 items-center justify-center bg-primary text-primary-foreground"><User size={14} aria-hidden="true" /></span>
                  Minha Conta
                </Link>
              </div>
              <Link to="/carrinho" className="ml-auto flex h-11 max-w-[264px] items-center border border-store-border bg-card/25 text-store-dark transition-colors hover:bg-card/50" aria-label={`Carrinho com ${count} ${count === 1 ? 'item' : 'itens'}`}>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-primary text-primary-foreground"><ShoppingCart size={25} aria-hidden="true" /></span>
                <span className="px-4 text-xs font-bold uppercase">{count === 0 ? 'Carrinho vazio' : `${count} ${count === 1 ? 'item' : 'itens'}`}</span>
              </Link>
            </div>
            <Link to="/carrinho" className="relative p-2 text-store-dark hover:text-primary md:hidden" aria-label="Carrinho">
              <ShoppingCart size={23} aria-hidden="true" />
              {count > 0 && <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">{count}</span>}
            </Link>
            <Button variant="ghost" size="icon" className="text-store-dark md:hidden" onClick={() => setMenuOpen((v) => !v)} aria-label="Menu">
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </Button>
          </div>
        </div>

        <nav className="hidden border-t border-store-border/70 bg-store-dark/10 md:block" aria-label="Categorias de produtos">
          <div className="container flex min-h-[50px] items-stretch px-8">
            {cats.map((c) => (
              <NavLink
                key={c.id}
                to={`/categoria/${c.slug ?? c.id}`}
                className={({ isActive }) => cn('flex items-center border-r border-card/70 px-5 text-sm font-bold uppercase hover:bg-card/20 hover:text-primary first:border-l', isActive ? 'bg-card/25 text-primary' : 'text-store-dark')}
              >
                {c.name}
              </NavLink>
            ))}
          </div>
        </nav>

        {menuOpen && (
          <div className="md:hidden border-t border-store-border/70 bg-card/95 px-4 py-4 space-y-3">
            <p className="text-xs text-store-dark">Bem-vindo, <Link to={user ? '/minha-conta' : '/entrar'} className="font-semibold text-primary">identifique-se</Link> para fazer pedidos</p>
            {design.show_search && <form onSubmit={onSearch} className="flex border border-store-border">
              <input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Buscar produtos"
                aria-label="Buscar produtos"
                className="min-w-0 flex-1 px-4 py-2 text-sm outline-none"
              />
              <Button type="submit" size="icon" className="rounded-none bg-store-dark text-store-dark-foreground"><Search size={17} /></Button>
            </form>}
            {cats.map((c) => (
              <Link key={c.id} to={`/categoria/${c.slug ?? c.id}`} onClick={() => setMenuOpen(false)} className="block text-sm font-semibold uppercase">
                {c.name}
              </Link>
            ))}
            <Link to="/meus-pedidos" onClick={() => setMenuOpen(false)} className="block text-sm">Meus Pedidos</Link>
            <Link to={user ? '/minha-conta' : '/entrar'} onClick={() => setMenuOpen(false)} className="block text-sm">Minha Conta</Link>
            <div className="flex flex-wrap gap-4 border-t border-store-border pt-3 text-xs">
              <a href={`tel:+55${phone.replace(/\D/g, '')}`}>Telefone: {phone}</a>
              <a href={`https://wa.me/55${whatsappDigits}`} target="_blank" rel="noreferrer">Whatsapp: {whatsapp}</a>
            </div>
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
                <Link to="/login">Acesso Equipe</Link>
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

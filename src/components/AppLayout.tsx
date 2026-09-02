import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, Package, ArrowLeftRight, DollarSign, ShoppingCart, Users, LogOut, Menu, X, Store, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import SupportFAQ from '@/components/SupportFAQ';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/products', label: 'Produtos', icon: Package },
  { to: '/inventory', label: 'Estoque', icon: ArrowLeftRight },
  { to: '/sales', label: 'Vendas', icon: ShoppingCart },
  { to: '/finance', label: 'Financeiro', icon: DollarSign },
  { to: '/customers', label: 'Clientes', icon: Users },
  { to: '/admin/loja', label: 'Loja Online', icon: Store },
  { to: '/configuracao', label: 'Configuração', icon: Settings },
];

export default function AppLayout() {
  const { profile, userRole, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-foreground/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 flex flex-col bg-sidebar text-sidebar-foreground transition-transform lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between p-5 border-b border-sidebar-border">
          <h1 className="text-xl font-display text-sidebar-primary-foreground font-bold">Joanas de Barro</h1>
          <button className="lg:hidden text-sidebar-foreground" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-sidebar-border space-y-1">
          <div className="text-sm mb-2">
            <p className="font-medium text-sidebar-accent-foreground">{profile?.display_name || 'Usuário'}</p>
            <p className="text-sidebar-foreground/60 text-xs capitalize">{userRole || 'seller'}</p>
          </div>
          <SupportFAQ />
          <Button variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground hover:text-destructive" onClick={handleSignOut}>
            <LogOut size={16} className="mr-2" /> Sair
          </Button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 border-b border-border bg-card flex items-center px-4 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="p-2">
            <Menu size={20} />
          </button>
          <span className="ml-2 font-display font-semibold text-primary">Joanas de Barro</span>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

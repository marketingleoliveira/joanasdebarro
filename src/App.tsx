import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import AppLayout from "@/components/AppLayout";
import LoginPage from "@/pages/Login";
import DashboardPage from "@/pages/Dashboard";
import ProductsPage from "@/pages/Products";
import InventoryPage from "@/pages/Inventory";
import SalesPage from "@/pages/Sales";
import FinancePage from "@/pages/Finance";
import CustomersPage from "@/pages/Customers";
import StoreAdminPage from "@/pages/StoreAdmin";
import SettingsPage from "@/pages/Settings";
import NotFound from "@/pages/NotFound";
import StoreLayout from "@/components/store/StoreLayout";
import Storefront from "@/pages/store/Storefront";
import StoreCategory from "@/pages/store/StoreCategory";
import StoreProductPage from "@/pages/store/StoreProductPage";
import CartPage from "@/pages/store/CartPage";
import CheckoutPage from "@/pages/store/CheckoutPage";
import StoreAuth from "@/pages/store/StoreAuth";
import MyAccount from "@/pages/store/MyAccount";
import MyOrders from "@/pages/store/MyOrders";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center text-muted-foreground">Carregando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center text-muted-foreground">Carregando...</div>;
  if (user) return <Navigate to="/erp" replace />;
  return <>{children}</>;
}

function SettingsRoute({ children }: { children: React.ReactNode }) {
  const { loading, canManageSettings } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center text-muted-foreground">Carregando...</div>;
  if (!canManageSettings) return <Navigate to="/erp" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <Routes>
              {/* Loja pública */}
              <Route path="/" element={<Navigate to="/loja" replace />} />
              <Route element={<StoreLayout />}>
                <Route path="/loja" element={<Storefront />} />
                <Route path="/categoria/:slug" element={<StoreCategory />} />
                <Route path="/produto/:slug" element={<StoreProductPage />} />
                <Route path="/carrinho" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/entrar" element={<StoreAuth />} />
                <Route path="/minha-conta" element={<MyAccount />} />
                <Route path="/meus-pedidos" element={<MyOrders />} />
              </Route>

              {/* ERP */}
              <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
              <Route path="/erp" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                <Route index element={<DashboardPage />} />
                <Route path="products" element={<ProductsPage />} />
                <Route path="inventory" element={<InventoryPage />} />
                <Route path="sales" element={<SalesPage />} />
                <Route path="finance" element={<FinancePage />} />
                <Route path="customers" element={<CustomersPage />} />
                <Route path="admin/loja" element={<StoreAdminPage />} />
                <Route path="configuracao" element={<SettingsRoute><SettingsPage /></SettingsRoute>} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

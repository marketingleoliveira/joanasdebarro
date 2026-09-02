import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';

export default function StoreAuth() {
  const [params] = useSearchParams();
  const next = params.get('next') || '/minha-conta';
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [login, setLogin] = useState({ email: '', password: '' });
  const [signup, setSignup] = useState({ name: '', email: '', phone: '', password: '' });

  useEffect(() => {
    document.title = 'Minha conta | Joanas de Barro';
  }, []);

  useEffect(() => {
    if (user) navigate(next, { replace: true });
  }, [user, next, navigate]);

  const doLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword(login);
    setLoading(false);
    if (error) toast({ title: 'Não foi possível entrar', description: error.message, variant: 'destructive' });
    else navigate(next, { replace: true });
  };

  const doSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: signup.email,
      password: signup.password,
      options: {
        emailRedirectTo: window.location.origin + '/loja',
        data: { display_name: signup.name, phone: signup.phone, account_type: 'customer' },
      },
    });
    setLoading(false);
    if (error) {
      toast({ title: 'Erro no cadastro', description: error.message, variant: 'destructive' });
      return;
    }
    if (data.session) {
      toast({ title: 'Conta criada!', description: 'Você já está conectado.' });
      navigate(next, { replace: true });
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email: signup.email, password: signup.password });
      if (signInError) {
        toast({ title: 'Conta criada', description: 'Faça login para continuar.' });
      } else {
        navigate(next, { replace: true });
      }
    }

  };

  return (
    <div className="container max-w-md py-16">
      <h1 className="font-display text-3xl font-bold text-center mb-2">Minha Conta</h1>
      <p className="text-center text-sm text-muted-foreground mb-8">Acompanhe seus pedidos e compre mais rápido.</p>

      <Tabs defaultValue="login">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="login">Entrar</TabsTrigger>
          <TabsTrigger value="signup">Criar conta</TabsTrigger>
        </TabsList>

        <TabsContent value="login">
          <form onSubmit={doLogin} className="space-y-4 bg-card border border-border rounded-xl p-6">
            <div className="space-y-1.5">
              <Label>E-mail</Label>
              <Input type="email" required value={login.email} onChange={(e) => setLogin({ ...login, email: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Senha</Label>
              <Input type="password" required value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</Button>
            <p className="text-xs text-center text-muted-foreground">
              É da equipe? <Link to="/login" className="text-primary hover:underline">Acesse o sistema</Link>
            </p>
          </form>
        </TabsContent>

        <TabsContent value="signup">
          <form onSubmit={doSignup} className="space-y-4 bg-card border border-border rounded-xl p-6">
            <div className="space-y-1.5">
              <Label>Nome completo</Label>
              <Input required value={signup.name} onChange={(e) => setSignup({ ...signup, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>E-mail</Label>
              <Input type="email" required value={signup.email} onChange={(e) => setSignup({ ...signup, email: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Telefone / WhatsApp</Label>
              <Input value={signup.phone} onChange={(e) => setSignup({ ...signup, phone: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Senha</Label>
              <Input type="password" required minLength={6} value={signup.password} onChange={(e) => setSignup({ ...signup, password: e.target.value })} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Criando...' : 'Criar conta'}</Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}

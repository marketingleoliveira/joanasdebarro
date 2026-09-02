import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userRole: string | null;
  canManageSettings: boolean;
  profile: { display_name: string; email: string | null; avatar_url: string | null } | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null, session: null, loading: true, userRole: null, canManageSettings: false, profile: null, signOut: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [canManageSettings, setCanManageSettings] = useState(false);
  const [profile, setProfile] = useState<AuthContextType['profile']>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => {
          fetchUserData(session.user.id);
        }, 0);
      } else {
        setUserRole(null);
        setCanManageSettings(false);
        setProfile(null);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (userId: string) => {
    const [rolesRes, profileRes, settingsAccessRes] = await Promise.all([
      supabase.from('user_roles').select('role').eq('user_id', userId).limit(1).single(),
      supabase.from('profiles').select('display_name, email, avatar_url').eq('user_id', userId).limit(1).single(),
      supabase.rpc('can_manage_settings'),
    ]);
    setUserRole(rolesRes.data?.role ?? 'seller');
    setProfile(profileRes.data ?? null);
    setCanManageSettings(settingsAccessRes.data === true);
    setLoading(false);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, userRole, canManageSettings, profile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

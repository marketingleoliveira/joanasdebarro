import { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';

type AppRole = 'admin' | 'manager' | 'seller';
interface StaffRole { user_id: string; display_name: string; email: string; role: AppRole }

const labels: Record<AppRole, string> = { admin: 'Administrador', manager: 'Gerente', seller: 'Vendedor' };

export default function RoleSettings() {
  const [staff, setStaff] = useState<StaffRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = async () => {
    const { data, error } = await supabase.rpc('list_staff_roles');
    if (error) toast({ title: 'Erro ao carregar cargos', description: error.message, variant: 'destructive' });
    setStaff((data as StaffRole[] | null) ?? []);
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const changeRole = async (userId: string, role: AppRole) => {
    setSavingId(userId);
    const { error } = await supabase.rpc('set_staff_role', { _target_user_id: userId, _role: role });
    setSavingId(null);
    if (error) return toast({ title: 'Não foi possível alterar o cargo', description: error.message, variant: 'destructive' });
    setStaff((current) => current.map((item) => item.user_id === userId ? { ...item, role } : item));
    toast({ title: 'Cargo atualizado' });
  };

  if (loading) return <div className="space-y-3"><Skeleton className="h-20" /><Skeleton className="h-20" /></div>;

  return (
    <div className="space-y-3">
      <div className="flex gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
        <ShieldCheck className="mt-0.5 shrink-0 text-primary" size={18} />
        <p>Somente esta conta pode administrar o módulo e os cargos. Contas de clientes não aparecem nesta lista.</p>
      </div>
      {staff.map((member) => (
        <div key={member.user_id} className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0"><p className="font-medium">{member.display_name}</p><p className="truncate text-sm text-muted-foreground">{member.email}</p></div>
          <Select value={member.role} disabled={savingId === member.user_id} onValueChange={(role: AppRole) => void changeRole(member.user_id, role)}>
            <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
            <SelectContent>{Object.entries(labels).map(([role, label]) => <SelectItem key={role} value={role}>{label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      ))}
    </div>
  );
}
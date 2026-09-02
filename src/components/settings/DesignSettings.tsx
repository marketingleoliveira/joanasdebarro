import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { StoreDesignConfig } from '@/lib/storeUtils';

interface DesignSettingsProps {
  value: StoreDesignConfig;
  onChange: (value: StoreDesignConfig) => void;
}

export default function DesignSettings({ value, onChange }: DesignSettingsProps) {
  const set = <K extends keyof StoreDesignConfig>(key: K, next: StoreDesignConfig[K]) => onChange({ ...value, [key]: next });
  const toggles: Array<{ key: keyof Pick<StoreDesignConfig, 'show_search' | 'show_contacts' | 'show_announcement' | 'show_featured' | 'show_categories'>; label: string }> = [
    { key: 'show_search', label: 'Exibir busca no cabeçalho' },
    { key: 'show_contacts', label: 'Exibir contatos e Instagram' },
    { key: 'show_announcement', label: 'Exibir barra de anúncio' },
    { key: 'show_featured', label: 'Exibir produtos em destaque' },
    { key: 'show_categories', label: 'Exibir categorias na página inicial' },
  ];

  return (
    <div className="grid gap-6 rounded-lg border border-border bg-card p-6 sm:grid-cols-2">
      <Field label="Paleta da loja">
        <Select value={value.palette} onValueChange={(next: StoreDesignConfig['palette']) => set('palette', next)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="classic">Azul clássico</SelectItem>
            <SelectItem value="terracotta">Terracota artesanal</SelectItem>
            <SelectItem value="clean">Clara e minimalista</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field label="Estilo do cabeçalho">
        <Select value={value.header_style} onValueChange={(next: StoreDesignConfig['header_style']) => set('header_style', next)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="reference">Completo</SelectItem><SelectItem value="compact">Compacto</SelectItem></SelectContent>
        </Select>
      </Field>
      <Field label="Produtos por linha no computador">
        <Select value={String(value.product_columns)} onValueChange={(next) => set('product_columns', Number(next) as 3 | 4)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="3">3 produtos</SelectItem><SelectItem value="4">4 produtos</SelectItem></SelectContent>
        </Select>
      </Field>
      <div className="space-y-4 sm:col-span-2">
        {toggles.map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between gap-4 border-b border-border pb-3 last:border-0">
            <Label htmlFor={key}>{label}</Label>
            <Switch id={key} checked={value[key]} onCheckedChange={(next) => set(key, next)} />
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}</div>;
}
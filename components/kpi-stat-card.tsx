import { Card } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface KPIStatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtext?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export function KPIStatCard({
  icon: Icon,
  label,
  value,
  subtext,
  trend,
  trendValue,
}: KPIStatCardProps) {
  return (
    <Card className="border-border p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
          {subtext && <p className="mt-1 text-xs text-muted-foreground">{subtext}</p>}
          {trend && trendValue && (
            <p
              className={`mt-2 text-xs font-semibold ${
                trend === 'up'
                  ? 'text-accent'
                  : trend === 'down'
                    ? 'text-destructive'
                    : 'text-muted-foreground'
              }`}
            >
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
            </p>
          )}
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
}

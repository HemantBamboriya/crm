import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Employee } from '@/lib/types';
import { Medal, TrendingUp } from 'lucide-react';

export function Leaderboard({ employees }: { employees: Employee[] }) {
  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'text-yellow-500';
      case 2:
        return 'text-gray-400';
      case 3:
        return 'text-orange-600';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2">
          <Medal className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Top Performers</h3>
        </div>
      </div>

      <div className="divide-y divide-border">
        {employees.map((employee, index) => (
          <div key={employee.id} className="p-4 hover:bg-secondary/5 transition-colors">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                <Medal className={`w-4 h-4 ${getMedalColor(index + 1)}`} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{employee.name}</p>
                <p className="text-xs text-muted-foreground">{employee.department}</p>
              </div>

              <div className="flex items-center gap-6 text-right">
                <div>
                  <p className="text-xs text-muted-foreground">Points</p>
                  <p className="font-bold text-primary">{employee.points}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Resolved</p>
                  <p className="font-bold text-accent">{employee.resolvedCount}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Employee } from '@/lib/types';
import { Award, TrendingUp, CheckCircle, Clock } from 'lucide-react';

export function EmployeeScoreCard({ employee, rank }: { employee: Employee; rank?: number }) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-foreground">{employee.name}</h3>
            {rank && <Badge variant="outline" className="text-xs">#{rank}</Badge>}
          </div>
          <p className="text-sm text-muted-foreground">{employee.department}</p>
        </div>
        <Award className="w-6 h-6 text-primary" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-muted-foreground">Points</p>
          <p className="text-xl font-bold text-primary">{employee.points}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Resolved</p>
          <div className="flex items-center gap-1 mt-1">
            <CheckCircle className="w-4 h-4 text-accent" />
            <p className="text-lg font-bold text-foreground">{employee.resolvedCount}</p>
          </div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Avg Time</p>
          <div className="flex items-center gap-1 mt-1">
            <Clock className="w-4 h-4 text-secondary" />
            <p className="text-sm font-semibold text-foreground">{employee.avgResolutionTime}h</p>
          </div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Active Tasks</p>
          <p className="text-lg font-bold text-foreground">{employee.assignedComplaints.length}</p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-accent" />
          <span className="text-xs font-medium text-foreground">Top Performer</span>
        </div>
      </div>
    </Card>
  );
}

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ComplaintUpdate } from '@/lib/types';
import { Check, Clock } from 'lucide-react';

export function StatusTimeline({ updates }: { updates: ComplaintUpdate[] }) {
  const displayUpdates = updates.length > 0 ? updates : [];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-6">Updates & Timeline</h3>

      {displayUpdates.length > 0 ? (
        <div className="space-y-4">
          {displayUpdates.map((update, index) => (
            <div key={update.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 border-2 border-primary">
                  <Check className="w-4 h-4 text-primary" />
                </div>
                {index < displayUpdates.length - 1 && (
                  <div className="w-0.5 h-12 bg-border mt-2" />
                )}
              </div>

              <div className="pt-1 pb-4 flex-1">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="font-medium text-foreground">{update.employeeName}</p>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(update.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{update.message}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Clock className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground text-sm">No updates yet</p>
        </div>
      )}
    </Card>
  );
}

'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Complaint } from '@/lib/types';
import { MapPin, AlertCircle, CheckCircle } from 'lucide-react';

export function MapView({ complaints }: { complaints: Complaint[] }) {
  const complaints_with_coords = complaints.filter((c) => c.latitude && c.longitude);

  return (
    <Card className="w-full p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground mb-2">Map View</h3>
        <p className="text-sm text-muted-foreground">Issues plotted by location</p>
      </div>

      {complaints_with_coords.length > 0 ? (
        <div className="space-y-4">
          <div className="border border-border rounded-lg p-4 bg-secondary/5 min-h-64 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground mb-2">Interactive map would display here</p>
              <p className="text-xs text-muted-foreground">
                {complaints_with_coords.length} locations ready to visualize
              </p>
            </div>
          </div>

          <div className="grid gap-2">
            <p className="text-sm font-medium text-foreground">Locations:</p>
            {complaints_with_coords.map((complaint) => (
              <div
                key={complaint.id}
                className="p-3 rounded-lg border border-border hover:bg-secondary/5 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{complaint.location}</p>
                    <p className="text-xs text-muted-foreground">
                      {complaint.latitude?.toFixed(3)}, {complaint.longitude?.toFixed(3)}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Badge variant="outline" className="text-xs">
                      {complaint.category}
                    </Badge>
                    {complaint.status === 'Resolved' ? (
                      <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No complaints with location data</p>
        </div>
      )}
    </Card>
  );
}

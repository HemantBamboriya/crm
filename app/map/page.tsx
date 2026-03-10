'use client';

import { useState } from 'react';
import { Navbar } from '@/components/navbar';
import { ComplaintCard } from '@/components/complaint-card';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockComplaints } from '@/lib/mock-data';
import { Filter, MapPin, AlertCircle, CheckCircle, Clock } from 'lucide-react';

type FilterStatus = 'all' | 'open' | 'in-progress' | 'resolved';
type FilterCategory = 'all' | 'Road' | 'Water' | 'Electricity' | 'Sanitation' | 'Other';
type FilterPriority = 'all' | 'Critical' | 'Medium' | 'Low' | 'Resolved';

export default function MapPage() {
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<FilterCategory>('all');
  const [priorityFilter, setPriorityFilter] = useState<FilterPriority>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredComplaints = mockComplaints.filter((complaint) => {
    const matchesStatus =
      statusFilter === 'all' ||
      complaint.status.toLowerCase().replace(' ', '-') === statusFilter;
    const matchesCategory = categoryFilter === 'all' || complaint.category === categoryFilter;
    const matchesPriority = priorityFilter === 'all' || complaint.priority === priorityFilter;
    const matchesSearch =
      complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.location.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesCategory && matchesPriority && matchesSearch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Resolved':
        return <CheckCircle className="h-5 w-5 text-accent" />;
      case 'In Progress':
        return <Clock className="h-5 w-5 text-secondary" />;
      default:
        return <AlertCircle className="h-5 w-5 text-destructive" />;
    }
  };

  const statusStats = {
    open: mockComplaints.filter((c) => c.status === 'Open').length,
    inProgress: mockComplaints.filter((c) => c.status === 'In Progress').length,
    resolved: mockComplaints.filter((c) => c.status === 'Resolved').length,
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground">Track Issues</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            View and filter all reported issues in your community
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-4">
          {/* Sidebar with Filters */}
          <aside className="lg:col-span-1">
            <Card className="border-border sticky top-24 p-6">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <Filter className="h-5 w-5" />
                Filters
              </h3>

              {/* Status Filter */}
              <div className="mt-6 space-y-2">
                <label className="text-sm font-medium text-foreground">Status</label>
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as FilterStatus)}>
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Issues</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category Filter */}
              <div className="mt-6 space-y-2">
                <label className="text-sm font-medium text-foreground">Category</label>
                <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as FilterCategory)}>
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Road">Road</SelectItem>
                    <SelectItem value="Water">Water</SelectItem>
                    <SelectItem value="Electricity">Electricity</SelectItem>
                    <SelectItem value="Sanitation">Sanitation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Priority Filter */}
              <div className="mt-6 space-y-2">
                <label className="text-sm font-medium text-foreground">Priority</label>
                <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as FilterPriority)}>
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Stats */}
              <div className="mt-8 space-y-3 border-t border-border pt-6">
                <h4 className="text-sm font-semibold text-foreground">Stats</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded-lg bg-destructive/10 p-3">
                    <span className="text-xs font-medium text-foreground">Open</span>
                    <span className="font-semibold text-destructive">{statusStats.open}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-secondary/10 p-3">
                    <span className="text-xs font-medium text-foreground">In Progress</span>
                    <span className="font-semibold text-secondary">{statusStats.inProgress}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-accent/10 p-3">
                    <span className="text-xs font-medium text-foreground">Resolved</span>
                    <span className="font-semibold text-accent">{statusStats.resolved}</span>
                  </div>
                </div>
              </div>

              {/* Reset Filters */}
              <Button
                variant="outline"
                onClick={() => {
                  setStatusFilter('all');
                  setCategoryFilter('all');
                  setPriorityFilter('all');
                  setSearchTerm('');
                }}
                className="mt-8 w-full"
              >
                Reset Filters
              </Button>
            </Card>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Map Placeholder */}
            <Card className="border-border mb-8 h-96 bg-gradient-to-br from-primary/5 to-accent/5 p-6 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="mx-auto h-12 w-12 text-primary/40" />
                <h3 className="mt-4 text-lg font-semibold text-muted-foreground">
                  Interactive Map
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  To use Mapbox, add your NEXT_PUBLIC_MAPBOX_TOKEN to .env.local
                </p>
                <p className="mt-4 text-xs text-muted-foreground">
                  Currently showing: {filteredComplaints.length} issues
                </p>
              </div>
            </Card>

            {/* Search Bar */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search by title or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Results */}
            <div>
              <h3 className="mb-4 text-lg font-semibold text-foreground">
                Issues ({filteredComplaints.length})
              </h3>
              {filteredComplaints.length > 0 ? (
                <div className="space-y-4">
                  {filteredComplaints.map((complaint) => (
                    <div key={complaint.id} className="flex gap-4">
                      <div className="flex-shrink-0 pt-1">
                        {getStatusIcon(complaint.status)}
                      </div>
                      <div className="flex-1">
                        <ComplaintCard complaint={complaint} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Card className="border-border p-8 text-center">
                  <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground" />
                  <h4 className="mt-2 text-lg font-semibold text-foreground">
                    No issues found
                  </h4>
                  <p className="mt-1 text-muted-foreground">
                    Try adjusting your filters to find issues.
                  </p>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

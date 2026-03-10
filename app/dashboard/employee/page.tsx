'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Navbar } from '@/components/navbar';
import { ComplaintCard } from '@/components/complaint-card';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Complaint } from '@/lib/types';
import { LogOut, AlertCircle, CheckCircle, TrendingUp, Trophy } from 'lucide-react';

const categoryDepartmentMap: Record<Complaint['category'], string> = {
  Road: 'Roads & Infrastructure',
  Water: 'Water Services',
  Electricity: 'Electrical Maintenance',
  Sanitation: 'Sanitation',
  Parks: 'Parks',
  Utilities: 'Utilities',
  Other: 'General Operations',
};

function normalizeDepartment(value?: string) {
  return value?.trim().toLowerCase().replace(/\s+/g, ' ') ?? '';
}

export default function EmployeeDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('tasks');
  const [tasks, setTasks] = useState<Complaint[]>([]);
  const [availableTasks, setAvailableTasks] = useState<Complaint[]>([]);
  const [allIssues, setAllIssues] = useState<Complaint[]>([]);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const response = await fetch('/api/complaints?scope=employee');
      if (!response.ok) return;
      const data = await response.json();
      setTasks(data.items ?? []);
      setAvailableTasks(data.availableItems ?? []);
      setAllIssues(data.allItems ?? []);
    };

    load().catch(() => undefined);
    const timer = setInterval(() => {
      load().catch(() => undefined);
    }, 5000);

    return () => clearInterval(timer);
  }, [user]);

  const stats = {
    assigned: tasks.length,
    available: availableTasks.length,
    total: allIssues.length,
    open: tasks.filter((c) => c.status === 'Open').length,
    inProgress: tasks.filter((c) => c.status === 'In Progress').length,
    resolved: tasks.filter((c) => c.status === 'Resolved').length,
    points: user?.rewardPoints ?? 0,
  };

  const criticalTasks = tasks.filter((c) => c.priority === 'Critical');
  const canResolveComplaint = (complaint: Complaint) =>
    normalizeDepartment(user?.department) === normalizeDepartment(categoryDepartmentMap[complaint.category]);

  const claimTask = async (complaintId: string) => {
    setClaimingId(complaintId);
    try {
      const response = await fetch(`/api/complaints/${complaintId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          actor: 'employee',
          action: 'claim',
        }),
      });

      if (!response.ok) {
        return;
      }

      const data = await response.json();
      const claimed = data.complaint as Complaint;
      setTasks((prev) => [claimed, ...prev.filter((item) => item.id !== claimed.id)]);
      setAvailableTasks((prev) => prev.filter((item) => item.id !== complaintId));
      setAllIssues((prev) => prev.map((item) => (item.id === claimed.id ? claimed : item)));
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="border-b border-border bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Employee Dashboard</h1>
              <p className="mt-1 text-muted-foreground">Welcome, {user?.name}</p>
            </div>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </section>

      <section className="border-b border-border py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Assigned Tasks', value: stats.assigned, icon: AlertCircle, color: 'text-primary' },
              { label: 'Available Tasks', value: stats.available, icon: AlertCircle, color: 'text-destructive' },
              { label: 'All Issues', value: stats.total, icon: TrendingUp, color: 'text-secondary' },
              { label: 'Reward Points', value: stats.points, icon: Trophy, color: 'text-accent' },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="mt-2 text-2xl font-bold text-foreground">{stat.value}</p>
                    </div>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="critical">Critical</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="tasks">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-foreground">All Active Tasks</h2>
                  <Badge variant="outline">{tasks.length} total</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Department: {user?.department ?? 'Unassigned'} - Open each task to report live location and progress.
                </p>

                {tasks.length > 0 ? (
                  <div className="grid gap-4">
                    {tasks.map((complaint) => (
                      <div
                        key={complaint.id}
                        onClick={() => router.push(`/complaint/${complaint.id}`)}
                        className="cursor-pointer"
                      >
                        <ComplaintCard complaint={complaint} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <Card className="p-8 text-center">
                    <CheckCircle className="w-12 h-12 mx-auto text-accent mb-3" />
                    <p className="text-muted-foreground">No assigned tasks yet</p>
                  </Card>
                )}

                <div className="pt-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-foreground">Available Tasks</h3>
                    <Badge variant="secondary">{availableTasks.length} open</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    All open issues are listed here. You can claim and resolve only complaints from your department.
                  </p>
                </div>

                {availableTasks.length > 0 ? (
                  <div className="grid gap-4">
                    {availableTasks.map((complaint) => (
                      <div key={complaint.id} className="space-y-3">
                        <div
                          onClick={() => router.push(`/complaint/${complaint.id}`)}
                          className="cursor-pointer"
                        >
                          <ComplaintCard complaint={complaint} />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Required department: {categoryDepartmentMap[complaint.category]}
                        </p>
                        <Button
                          onClick={() => claimTask(complaint.id)}
                          disabled={claimingId === complaint.id || !canResolveComplaint(complaint)}
                          className="w-full"
                        >
                          {claimingId === complaint.id
                            ? 'Claiming...'
                            : canResolveComplaint(complaint)
                              ? 'Claim Task'
                              : 'Not Your Department'}
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Card className="p-6 text-center">
                    <p className="text-muted-foreground">No open unassigned issues available right now.</p>
                  </Card>
                )}

                <div className="pt-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-foreground">All Issues</h3>
                    <Badge variant="outline">{allIssues.length} total</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Full complaint visibility across departments. Only your department can claim and resolve its matching issues.
                  </p>
                </div>

                {allIssues.length > 0 ? (
                  <div className="grid gap-4">
                    {allIssues.map((complaint) => (
                      <div
                        key={`all-${complaint.id}`}
                        onClick={() => router.push(`/complaint/${complaint.id}`)}
                        className="cursor-pointer"
                      >
                        <ComplaintCard complaint={complaint} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <Card className="p-6 text-center">
                    <p className="text-muted-foreground">No issues found.</p>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="critical">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-foreground">Critical Priorities</h2>
                  <Badge variant="destructive">{criticalTasks.length}</Badge>
                </div>

                {criticalTasks.length > 0 ? (
                  <div className="grid gap-4">
                    {criticalTasks.map((complaint) => (
                      <div
                        key={complaint.id}
                        onClick={() => router.push(`/complaint/${complaint.id}`)}
                        className="cursor-pointer"
                      >
                        <ComplaintCard complaint={complaint} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <Card className="p-8 text-center">
                    <CheckCircle className="w-12 h-12 mx-auto text-accent mb-3" />
                    <p className="text-muted-foreground">No critical tasks</p>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="performance">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-6">Performance Overview</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Reward Points</span>
                    <span className="text-sm font-semibold text-foreground">{stats.points}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">In Progress</span>
                    <span className="text-sm font-semibold text-foreground">{stats.inProgress}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Resolved</span>
                    <span className="text-sm font-semibold text-foreground">{stats.resolved}</span>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}

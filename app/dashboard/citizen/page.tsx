'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Navbar } from '@/components/navbar';
import { ComplaintCard } from '@/components/complaint-card';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Complaint } from '@/lib/types';
import { Plus, CheckCircle, AlertCircle, TrendingUp, LogOut } from 'lucide-react';

export default function CitizenDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('my-complaints');
  const [myComplaints, setMyComplaints] = useState<Complaint[]>([]);
  const [communityComplaints, setCommunityComplaints] = useState<Complaint[]>([]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const [mineResponse, allResponse] = await Promise.all([
        fetch('/api/complaints?scope=mine'),
        fetch('/api/complaints?scope=all'),
      ]);

      if (mineResponse.ok) {
        const mineData = await mineResponse.json();
        setMyComplaints(mineData.items ?? []);
      }

      if (allResponse.ok) {
        const allData = await allResponse.json();
        setCommunityComplaints(allData.items ?? []);
      }
    };

    load().catch(() => undefined);
    const timer = setInterval(() => {
      load().catch(() => undefined);
    }, 5000);

    return () => clearInterval(timer);
  }, [user]);

  const filteredComplaints = myComplaints.filter(
    (c) => c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: myComplaints.length,
    open: myComplaints.filter((c) => c.status === 'Open').length,
    inProgress: myComplaints.filter((c) => c.status === 'In Progress').length,
    resolved: myComplaints.filter((c) => c.status === 'Resolved').length,
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="border-b border-border bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Citizen Dashboard</h1>
              <p className="mt-1 text-muted-foreground">Welcome, {user?.name}</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => router.push('/report')} variant="default">
                <Plus className="w-4 h-4 mr-2" />
                Report Issue
              </Button>
              <Button onClick={handleLogout} variant="outline">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Total Complaints', value: stats.total, icon: AlertCircle, color: 'text-primary' },
              { label: 'Open', value: stats.open, icon: AlertCircle, color: 'text-destructive' },
              { label: 'In Progress', value: stats.inProgress, icon: TrendingUp, color: 'text-secondary' },
              { label: 'Resolved', value: stats.resolved, icon: CheckCircle, color: 'text-accent' },
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

      {/* Content */}
      <section className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="my-complaints">My Complaints</TabsTrigger>
              <TabsTrigger value="community">Community Feed</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
            </TabsList>

            <TabsContent value="my-complaints">
              <div className="space-y-6">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search complaints..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Open a complaint to upload fresh photos or share your live location with the assigned employee.
                </p>

                {filteredComplaints.length > 0 ? (
                  <div className="grid gap-4">
                    {filteredComplaints.map((complaint) => (
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
                    <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No complaints found</p>
                    <Button onClick={() => router.push('/report')} variant="outline" className="mt-4">
                      <Plus className="w-4 h-4 mr-2" />
                      Report New Issue
                    </Button>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="community">
              <div className="space-y-4">
                <p className="text-muted-foreground text-sm">
                  Support issues in your community. Your votes help prioritize repairs.
                </p>
                <div className="grid gap-4">
                  {communityComplaints.map((complaint) => (
                    <div
                      key={complaint.id}
                      onClick={() => router.push(`/complaint/${complaint.id}`)}
                      className="cursor-pointer"
                    >
                      <ComplaintCard complaint={complaint} showVoting={true} />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="stats">
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Community Statistics</h3>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Complaints</p>
                      <p className="text-2xl font-bold text-foreground">{communityComplaints.length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Resolved</p>
                      <p className="text-2xl font-bold text-accent">{communityComplaints.filter((c) => c.status === 'Resolved').length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pending</p>
                      <p className="text-2xl font-bold text-destructive">{communityComplaints.filter((c) => c.status !== 'Resolved').length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Open</p>
                      <p className="text-2xl font-bold text-primary">{communityComplaints.filter((c) => c.status === 'Open').length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Critical Issues</p>
                      <p className="text-2xl font-bold text-destructive">{communityComplaints.filter((c) => c.priority === 'Critical').length}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Category Breakdown</h3>
                  <div className="space-y-2">
                    {['Road', 'Water', 'Electricity', 'Sanitation', 'Parks', 'Utilities', 'Other'].map((category) => {
                      const count = communityComplaints.filter((c) => c.category === category).length;
                      const total = communityComplaints.length || 1;
                      return (
                        <div key={category} className="flex items-center justify-between">
                          <span className="text-sm text-foreground">{category}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-40 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary"
                                style={{
                                  width: `${(count / total) * 100}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground w-12 text-right">{count}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}

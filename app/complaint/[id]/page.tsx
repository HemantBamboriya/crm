'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Navbar } from '@/components/navbar';
import { StatusTimeline } from '@/components/status-timeline';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Complaint } from '@/lib/types';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Clock,
  MapPin,
  Trophy,
  Upload,
  User,
  Zap,
} from 'lucide-react';

export default function ComplaintDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const complaintId = params.id as string;
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<Complaint['status']>('Open');
  const [error, setError] = useState('');
  const [resolvedLocally, setResolvedLocally] = useState(false);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setLoading(true);
      const response = await fetch(`/api/complaints/${complaintId}`, { cache: 'no-store' });
      if (!response.ok) {
        setComplaint(null);
        setLoading(false);
        return;
      }
      const data = await response.json();
      setComplaint(data.complaint ?? null);
      setStatus(data.complaint?.status ?? 'Open');
      if (data.complaint?.status === 'Resolved') {
        setResolvedLocally(true);
      }
      setLoading(false);
    };

    load().catch(() => {
      setComplaint(null);
      setLoading(false);
    });

    const timer = setInterval(() => {
      load().catch(() => undefined);
    }, 5000);

    return () => clearInterval(timer);
  }, [complaintId, user]);

  const captureCitizenLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported in this browser.');
      return;
    }

    setSaving(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const response = await fetch(`/api/complaints/${complaintId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            actor: 'citizen',
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            location: complaint?.location,
          }),
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          setError(data.error || 'Failed to update live location.');
        } else {
          setComplaint(data.complaint ?? null);
        }
        setSaving(false);
      },
      () => {
        setError('Unable to access current location.');
        setSaving(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const uploadCitizenPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1_500_000) {
      setError('Photo must be smaller than 1.5 MB.');
      return;
    }

    setSaving(true);
    const image = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ''));
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    }).catch(() => '');

    if (!image) {
      setError('Could not process the selected photo.');
      setSaving(false);
      return;
    }

    const response = await fetch(`/api/complaints/${complaintId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actor: 'citizen', image }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(data.error || 'Failed to upload photo.');
    } else {
      setComplaint(data.complaint ?? null);
      setError('');
    }
    setSaving(false);
  };

  const reportEmployeeUpdate = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported in this browser.');
      return;
    }

    setSaving(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const response = await fetch(`/api/complaints/${complaintId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            actor: 'employee',
            status,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            note: note.trim() || undefined,
          }),
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          setError(data.error || 'Failed to update task.');
        } else {
          setComplaint(data.complaint ?? null);
          setNote('');
          setError('');
        }
        setSaving(false);
      },
      () => {
        setError('Unable to access current location.');
        setSaving(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const resolveIssue = async () => {
    setSaving(true);
    setError('');

    try {
      const response = await fetch(`/api/complaints/${complaintId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actor: 'employee',
          action: 'resolve',
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error || 'Failed to resolve issue.');
        return;
      }

      setComplaint(data.complaint ?? null);
      setStatus('Resolved');
      setNote('');
      setResolvedLocally(true);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Loading complaint...</p>
          </Card>
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <Card className="p-8 text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Complaint Not Found</h2>
            <p className="text-muted-foreground mb-4">The requested complaint could not be found.</p>
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'bg-destructive text-destructive-foreground';
      case 'Medium':
        return 'bg-secondary text-secondary-foreground';
      case 'Low':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getRiskBadge = () => {
    if (complaint.aiRiskScore >= 80) return { label: 'High Risk', color: 'text-destructive' };
    if (complaint.aiRiskScore >= 50) return { label: 'Medium Risk', color: 'text-secondary' };
    return { label: 'Low Risk', color: 'text-accent' };
  };

  const liveCitizenLocation = complaint.citizenLiveLocation;
  const liveEmployeeLocation = complaint.employeeLiveLocation;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="border-b border-border bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Button onClick={() => router.back()} variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground">{complaint.title}</h1>
              <p className="mt-2 text-muted-foreground">{complaint.description}</p>
            </div>
            <Badge className={getPriorityColor(complaint.priority)}>{complaint.priority}</Badge>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-6">Complaint Details</h2>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold">Ticket ID</p>
                  <p className="mt-2 font-mono text-foreground">{complaint.ticketId}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold">Status</p>
                  <div className="mt-2 flex items-center gap-2">
                    {complaint.status === 'Resolved' ? (
                      <CheckCircle className="w-4 h-4 text-accent" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-destructive" />
                    )}
                    <span className="font-medium text-foreground">{complaint.status}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold">Category</p>
                  <p className="mt-2 font-medium text-foreground">{complaint.category}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold">Priority</p>
                  <p className="mt-2 font-medium text-foreground">{complaint.priority}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold">Reported Date</p>
                  <p className="mt-2 font-medium text-foreground">{complaint.date}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold">Community Support</p>
                  <p className="mt-2 font-medium text-foreground">{complaint.votes} votes</p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-border space-y-4">
                <div className="flex items-start gap-4">
                  <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Location</p>
                    <p className="text-foreground">{complaint.location}</p>
                    {complaint.latitude && complaint.longitude && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {complaint.latitude.toFixed(5)}, {complaint.longitude.toFixed(5)}
                      </p>
                    )}
                  </div>
                </div>
                {liveCitizenLocation && (
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-sm font-medium text-foreground">Citizen live location</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {liveCitizenLocation.latitude.toFixed(5)}, {liveCitizenLocation.longitude.toFixed(5)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Updated {new Date(liveCitizenLocation.updatedAt).toLocaleString()}
                    </p>
                  </div>
                )}
                {liveEmployeeLocation && (
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-sm font-medium text-foreground">Employee live location</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {liveEmployeeLocation.latitude.toFixed(5)}, {liveEmployeeLocation.longitude.toFixed(5)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Updated {new Date(liveEmployeeLocation.updatedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {complaint.images && complaint.images.length > 0 && (
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Photo Evidence</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {complaint.images.map((image, index) => (
                    <img
                      key={`${complaint.id}-image-${index}`}
                      src={image}
                      alt={`Complaint evidence ${index + 1}`}
                      className="w-full rounded-lg border border-border object-cover"
                    />
                  ))}
                </div>
              </Card>
            )}

            <StatusTimeline updates={complaint.updates} />
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                AI Assessment
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-foreground">Risk Score</span>
                    <span className={`text-sm font-bold ${getRiskBadge().color}`}>
                      {complaint.aiRiskScore}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-destructive"
                      style={{ width: `${complaint.aiRiskScore}%` }}
                    />
                  </div>
                </div>

                <Badge variant="outline" className="w-full text-center py-2">
                  {getRiskBadge().label}
                </Badge>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Assignment
              </h3>
              <p className="text-sm text-muted-foreground">
                {complaint.assignedEmployeeName
                  ? `${complaint.assignedEmployeeName} - ${complaint.assignedEmployeeDepartment ?? 'Operations'}`
                  : 'Not assigned yet'}
              </p>
              <div className="mt-4 flex items-center gap-2 text-sm text-foreground">
                <Trophy className="w-4 h-4 text-accent" />
                <span>{complaint.rewardPoints} reward points attached to this task</span>
              </div>
              {typeof complaint.proximityMeters === 'number' && (
                <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Nearest live employee is {complaint.proximityMeters} m away</span>
                </div>
              )}
            </Card>

            {user?.role === 'citizen' && (
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Citizen Updates</h3>
                <div className="space-y-3">
                  <Button onClick={captureCitizenLocation} className="w-full" disabled={saving}>
                    <MapPin className="w-4 h-4 mr-2" />
                    Share Live Location
                  </Button>
                  <label className="block">
                    <span className="sr-only">Upload photo</span>
                    <input type="file" accept="image/*" className="hidden" onChange={uploadCitizenPhoto} />
                    <span className="inline-flex w-full cursor-pointer items-center justify-center rounded-md border border-input px-4 py-2 text-sm font-medium">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Photo
                    </span>
                  </label>
                </div>
              </Card>
            )}

            {user?.role === 'employee' && complaint.assignedEmployeeId === user.id && (
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Employee Field Update</h3>
                <div className="space-y-3">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Complaint['status'])}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add a field note"
                    className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                  <Button onClick={reportEmployeeUpdate} className="w-full" disabled={saving}>
                    <MapPin className="w-4 h-4 mr-2" />
                    Report Live Progress
                  </Button>
                  <Button
                    onClick={resolveIssue}
                    className="w-full"
                    disabled={saving || resolvedLocally || complaint.status === 'Resolved'}
                    variant={resolvedLocally || complaint.status === 'Resolved' ? 'outline' : 'default'}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {resolvedLocally || complaint.status === 'Resolved' ? 'Issue Resolved' : 'Resolve Issue'}
                  </Button>
                </div>
              </Card>
            )}

            {complaint.notes && (
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Latest Note</h3>
                <p className="text-sm text-muted-foreground">{complaint.notes}</p>
              </Card>
            )}

            {error && (
              <Card className="p-4 border-destructive/30">
                <p className="text-sm text-destructive">{error}</p>
              </Card>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

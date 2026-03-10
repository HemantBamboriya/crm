'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Camera, CheckCircle, MapPin } from 'lucide-react';
import { Complaint } from '@/lib/types';

const categoryMap: Record<string, Complaint['category']> = {
  road: 'Road',
  water: 'Water',
  electricity: 'Electricity',
  sanitation: 'Sanitation',
  other: 'Other',
};

const rewardPointMap: Record<Complaint['priority'], number> = {
  Critical: 100,
  Medium: 60,
  Low: 30,
};

export default function ReportPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    priority: 'Medium' as Complaint['priority'],
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
  });
  const [submitted, setSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string>('');

  useEffect(() => {
    const loadRecent = async () => {
      try {
        const response = await fetch('/api/complaints?scope=mine');
        if (!response.ok) return;
        const data = await response.json();
        setRecentComplaints((data.items ?? []).slice(0, 5));
      } catch {
        // Ignore initial load failures.
      }
    };

    loadRecent();
  }, []);

  const captureLocation = () => {
    if (!navigator.geolocation) {
      setSubmitError('Geolocation is not supported in this browser.');
      return;
    }

    setIsLocating(true);
    setSubmitError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          location:
            prev.location ||
            `Lat ${position.coords.latitude.toFixed(5)}, Lng ${position.coords.longitude.toFixed(5)}`,
        }));
        setIsLocating(false);
      },
      () => {
        setSubmitError('Unable to access your current location.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setPhotoPreview('');
      return;
    }

    if (file.size > 1_500_000) {
      setSubmitError('Photo must be smaller than 1.5 MB.');
      return;
    }

    const preview = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ''));
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    }).catch(() => '');

    if (!preview) {
      setSubmitError('Could not process the selected photo.');
      return;
    }

    setPhotoPreview(preview);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: categoryMap[formData.category || 'other'] ?? 'Other',
          priority: formData.priority,
          location: formData.location,
          latitude: formData.latitude,
          longitude: formData.longitude,
          images: photoPreview ? [photoPreview] : [],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit');
      }

      const data = await response.json();
      setSubmittedId(data.complaint?.ticketId ?? '');
      setSubmitted(true);
      setRecentComplaints((prev) => [data.complaint, ...prev].slice(0, 5));
      setFormData({
        title: '',
        description: '',
        category: '',
        location: '',
        priority: 'Medium',
        latitude: undefined,
        longitude: undefined,
      });
      setPhotoPreview('');
      setTimeout(() => {
        setSubmitted(false);
      }, 3000);
    } catch {
      setSubmitError('Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const categories = [
    { value: 'road', label: 'Road & Infrastructure' },
    { value: 'water', label: 'Water Supply' },
    { value: 'electricity', label: 'Electricity' },
    { value: 'sanitation', label: 'Sanitation' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground">Report an Issue</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Share the issue location, live coordinates, and a photo so the nearest employee can be assigned faster.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {submitted ? (
              <Card className="border-border p-8 text-center">
                <div className="flex justify-center">
                  <div className="rounded-full bg-accent/10 p-4">
                    <CheckCircle className="h-8 w-8 text-accent" />
                  </div>
                </div>
                <h2 className="mt-4 text-2xl font-bold text-foreground">
                  Issue Reported Successfully
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Your issue has been logged with ticket #{submittedId || 'N/A'}.
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Nearest matching employees will see the task with reward points based on priority.
                </p>
              </Card>
            ) : (
              <Card className="border-border p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="title" className="text-foreground">
                      Issue Title *
                    </Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="e.g., Pothole on Main Street"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="category" className="text-foreground">
                      Category *
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="location" className="text-foreground">
                        Location *
                      </Label>
                      <Button type="button" variant="outline" size="sm" onClick={captureLocation} disabled={isLocating}>
                        <MapPin className="h-4 w-4 mr-2" />
                        {isLocating ? 'Locating...' : 'Use Live Location'}
                      </Button>
                    </div>
                    <div className="relative mt-2">
                      <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="location"
                        name="location"
                        placeholder="Enter street address or area name"
                        value={formData.location}
                        onChange={handleChange}
                        required
                        className="pl-10"
                      />
                    </div>
                    {typeof formData.latitude === 'number' && typeof formData.longitude === 'number' && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Live coordinates captured: {formData.latitude.toFixed(5)}, {formData.longitude.toFixed(5)}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="priority" className="text-foreground">
                      Priority Level
                    </Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value: Complaint['priority']) =>
                        setFormData((prev) => ({ ...prev, priority: value }))
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Assigned worker reward points: {rewardPointMap[formData.priority]}
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-foreground">
                      Detailed Description *
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Provide details about the issue, including when you first noticed it and any relevant context."
                      value={formData.description}
                      onChange={handleChange}
                      required
                      className="mt-2 min-h-32"
                    />
                  </div>

                  <div>
                    <Label htmlFor="photo" className="text-foreground">
                      Photo Evidence
                    </Label>
                    <div className="mt-2 space-y-3">
                      <Input id="photo" type="file" accept="image/*" onChange={handlePhotoChange} />
                      {photoPreview && (
                        <img
                          src={photoPreview}
                          alt="Complaint preview"
                          className="h-40 w-full rounded-md object-cover border border-border"
                        />
                      )}
                    </div>
                  </div>

                  {submitError && <p className="text-sm text-destructive">{submitError}</p>}

                  <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Report'}
                  </Button>
                </form>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="border-border p-6 bg-primary/5">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <AlertCircle className="h-5 w-5 text-primary" />
                Reporting Guidelines
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 font-semibold text-primary">1</span>
                  <span>Capture live coordinates whenever possible for automatic nearest-employee assignment.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 font-semibold text-primary">2</span>
                  <span>Upload one clear photo so field staff can verify the complaint before arrival.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 font-semibold text-primary">3</span>
                  <span>Choose the right category and priority so routing and reward points stay accurate.</span>
                </li>
              </ul>
            </Card>

            <Card className="border-border p-6">
              <h3 className="text-lg font-semibold text-foreground">Task Routing</h3>
              <div className="mt-4 space-y-4 text-sm text-muted-foreground">
                <div>
                  <p className="font-semibold text-foreground">Nearest Employee</p>
                  <p className="mt-1">The system uses live coordinates to route the task to the closest employee with the relevant department.</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Live Tracking</p>
                  <p className="mt-1">Citizens and employees can keep sharing their location after the ticket is created.</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Rewards</p>
                  <p className="mt-1">Critical tasks carry the highest point value to support employee reward programs.</p>
                </div>
              </div>
            </Card>

            <Card className="border-border p-6 bg-accent/5">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Camera className="h-5 w-5 text-accent" />
                Your Recent Reports
              </h3>
              <div className="mt-4 space-y-2">
                {recentComplaints.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No reports yet.</p>
                ) : (
                  recentComplaints.map((item) => (
                    <div key={item.id} className="rounded border border-border p-2">
                      <p className="text-xs font-medium text-foreground line-clamp-1">{item.title}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {item.ticketId} - {item.status}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

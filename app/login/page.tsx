'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, Loader2, MapPin, Shield, Users } from 'lucide-react';

const employeeDepartments = [
  'Roads & Infrastructure',
  'Water Services',
  'Electrical Maintenance',
  'Sanitation',
  'Parks',
  'Utilities',
  'General Operations',
];

export default function LoginPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('');
  const [department, setDepartment] = useState(employeeDepartments[0]);
  const [selectedRole, setSelectedRole] = useState<'citizen' | 'employee' | null>(null);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const captureLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported in this browser.');
      return;
    }

    setIsLocating(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        if (!location.trim()) {
          setLocation(`Lat ${position.coords.latitude.toFixed(5)}, Lng ${position.coords.longitude.toFixed(5)}`);
        }
        setIsLocating(false);
      },
      () => {
        setError('Unable to access current location.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const resetRegistrationFields = () => {
    setName('');
    setLocation('');
    setDepartment(employeeDepartments[0]);
    setLatitude(undefined);
    setLongitude(undefined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !selectedRole) {
      setError('Please select a role, email and password.');
      return;
    }
    if (mode === 'register' && !name.trim()) {
      setError('Please enter a name for registration.');
      return;
    }
    if (mode === 'register' && !location.trim()) {
      setError('Please provide your location during registration.');
      return;
    }
    if (mode === 'register' && selectedRole === 'employee' && !department.trim()) {
      setError('Please select a department for the employee account.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      if (mode === 'register') {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            email,
            password,
            role: selectedRole,
            location,
            latitude,
            longitude,
            department: selectedRole === 'employee' ? department : undefined,
          }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || 'Registration failed');
        }

        setMode('login');
        resetRegistrationFields();
        setSuccess('Registration successful. Login with your email and password.');
        return;
      }

      await login(email, password, selectedRole);
      router.push(selectedRole === 'citizen' ? '/dashboard/citizen' : '/dashboard/employee');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-primary">CivicCRM</h1>
          </div>
          <p className="text-muted-foreground">Smart public service platform with live field tracking</p>
        </div>

        <Card className="p-6 mb-6">
          <div className="grid grid-cols-2 gap-2 mb-4">
            <Button
              type="button"
              variant={mode === 'login' ? 'default' : 'outline'}
              onClick={() => setMode('login')}
            >
              Login
            </Button>
            <Button
              type="button"
              variant={mode === 'register' ? 'default' : 'outline'}
              onClick={() => setMode('register')}
            >
              Register
            </Button>
          </div>

          <h2 className="text-sm font-semibold text-foreground mb-4">Select Your Role</h2>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { role: 'citizen' as const, label: 'Citizen', icon: Users },
              { role: 'employee' as const, label: 'Employee', icon: Shield },
            ].map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.role}
                  type="button"
                  onClick={() => setSelectedRole(option.role)}
                  className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                    selectedRole === option.role
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Name</label>
                  <Input
                    type="text"
                    placeholder="Enter full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-foreground">Location</label>
                    <Button type="button" variant="outline" size="sm" onClick={captureLocation} disabled={isLocating}>
                      <MapPin className="w-4 h-4 mr-2" />
                      {isLocating ? 'Locating...' : 'Use Current Location'}
                    </Button>
                  </div>
                  <Input
                    type="text"
                    placeholder="Ward, street, area or office location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    disabled={isLoading}
                    className="w-full"
                  />
                </div>

                {selectedRole === 'employee' && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Department</label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      disabled={isLoading}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      {employeeDepartments.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <Input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Password</label>
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 flex gap-2 items-start">
                <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-3 rounded-lg bg-accent/10">
                <p className="text-sm text-accent">{success}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={
                !selectedRole ||
                !email ||
                !password ||
                isLoading ||
                (mode === 'register' && (!name.trim() || !location.trim()))
              }
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {mode === 'register' ? 'Registering...' : 'Logging in...'}
                </>
              ) : (
                mode === 'register' ? 'Register' : 'Login'
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

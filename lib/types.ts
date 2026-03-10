export type UserRole = 'citizen' | 'employee' | 'admin';
export type ComplaintStatus = 'Open' | 'In Progress' | 'Resolved';
export type ComplaintPriority = 'Critical' | 'Medium' | 'Low';
export type ComplaintCategory = 'Road' | 'Water' | 'Electricity' | 'Sanitation' | 'Parks' | 'Utilities' | 'Other';

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface LiveLocation extends GeoPoint {
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  location?: string;
  latitude?: number;
  longitude?: number;
  department?: string;
  rewardPoints?: number;
  avatar?: string;
  joinedDate: string;
}

export interface Complaint {
  id: string;
  ticketId: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  location: string;
  latitude?: number;
  longitude?: number;
  citizenLiveLocation?: LiveLocation;
  employeeLiveLocation?: LiveLocation;
  date: string;
  status: ComplaintStatus;
  citizenId: string;
  votes: number;
  assignedEmployeeId?: string;
  assignedEmployeeName?: string;
  assignedEmployeeDepartment?: string;
  rewardPoints: number;
  proximityMeters?: number | null;
  aiRiskScore: number; // 1-100
  images?: string[];
  updates: ComplaintUpdate[];
  notes: string;
}

export interface ComplaintUpdate {
  id: string;
  timestamp: string;
  message: string;
  employeeId: string;
  employeeName: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  assignedComplaints: string[];
  resolvedCount: number;
  points: number;
  avgResolutionTime: number; // in hours
  avatar?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

export interface Vote {
  complaintId: string;
  userId: string;
  timestamp: string;
}

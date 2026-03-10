import { Complaint, ComplaintUpdate, Employee, User } from '@/lib/types';

export const mockUsers: User[] = [
  {
    id: 'citizen-1',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    role: 'citizen',
    joinedDate: '2023-06-15',
  },
  {
    id: 'citizen-2',
    name: 'Michael Chen',
    email: 'michael@example.com',
    role: 'citizen',
    joinedDate: '2023-08-20',
  },
  {
    id: 'emp-1',
    name: 'David Rodriguez',
    email: 'david.rodriguez@city.gov',
    role: 'employee',
    joinedDate: '2022-01-10',
  },
  {
    id: 'emp-2',
    name: 'Emily Watson',
    email: 'emily.watson@city.gov',
    role: 'employee',
    joinedDate: '2022-03-15',
  },
];

export const mockEmployees: Employee[] = [
  {
    id: 'emp-1',
    name: 'David Rodriguez',
    email: 'david.rodriguez@city.gov',
    department: 'Roads & Infrastructure',
    assignedComplaints: ['1', '5'],
    resolvedCount: 156,
    points: 2840,
    avgResolutionTime: 36,
  },
  {
    id: 'emp-2',
    name: 'Emily Watson',
    email: 'emily.watson@city.gov',
    department: 'Utilities',
    assignedComplaints: ['2'],
    resolvedCount: 203,
    points: 3650,
    avgResolutionTime: 28,
  },
  {
    id: 'emp-3',
    name: 'James Mitchell',
    email: 'james.mitchell@city.gov',
    department: 'Sanitation',
    assignedComplaints: ['4'],
    resolvedCount: 189,
    points: 3420,
    avgResolutionTime: 32,
  },
  {
    id: 'emp-4',
    name: 'Lisa Park',
    email: 'lisa.park@city.gov',
    department: 'Electricity & Lighting',
    assignedComplaints: ['3'],
    resolvedCount: 167,
    points: 3010,
    avgResolutionTime: 40,
  },
];

const mockUpdates: ComplaintUpdate[] = [
  {
    id: 'u1',
    timestamp: '2024-03-08T14:30:00Z',
    message: 'Road crew dispatched to assess the pothole damage',
    employeeId: 'emp-1',
    employeeName: 'David Rodriguez',
  },
  {
    id: 'u2',
    timestamp: '2024-03-08T10:15:00Z',
    message: 'Complaint received and prioritized for immediate action',
    employeeId: 'emp-1',
    employeeName: 'David Rodriguez',
  },
];

export const mockComplaints: Complaint[] = [
  {
    id: '1',
    ticketId: 'TKT-2024-001',
    title: 'Pothole on Main Street',
    description: 'Large pothole causing damage to vehicles and creating safety hazards',
    category: 'Road',
    priority: 'Critical',
    location: 'Main St & 5th Ave',
    latitude: 40.7128,
    longitude: -74.006,
    date: '2024-03-08',
    status: 'In Progress',
    citizenId: 'citizen-1',
    votes: 23,
    assignedEmployeeId: 'emp-1',
    assignedEmployeeName: 'David Rodriguez',
    assignedEmployeeDepartment: 'Roads & Infrastructure',
    rewardPoints: 100,
    proximityMeters: 420,
    aiRiskScore: 92,
    notes: 'Active construction zone, repair may take 3-5 days',
    updates: mockUpdates,
  },
  {
    id: '2',
    ticketId: 'TKT-2024-002',
    title: 'Water Pipe Burst',
    description: 'Water leaking from underground pipe for 3 days, causing flooding',
    category: 'Water',
    priority: 'Critical',
    location: 'Park Ridge Lane',
    latitude: 40.748,
    longitude: -73.968,
    date: '2024-03-07',
    status: 'In Progress',
    citizenId: 'citizen-2',
    votes: 31,
    assignedEmployeeId: 'emp-2',
    assignedEmployeeName: 'Emily Watson',
    assignedEmployeeDepartment: 'Utilities',
    rewardPoints: 100,
    proximityMeters: 580,
    aiRiskScore: 88,
    notes: 'Emergency response team on standby',
    updates: [],
  },
  {
    id: '3',
    ticketId: 'TKT-2024-003',
    title: 'Broken Street Light',
    description: 'Street light has been non-functional for 2 weeks',
    category: 'Electricity',
    priority: 'Medium',
    location: 'Oak Street',
    latitude: 40.758,
    longitude: -73.985,
    date: '2024-03-06',
    status: 'Open',
    citizenId: 'citizen-1',
    votes: 12,
    assignedEmployeeId: 'emp-4',
    assignedEmployeeName: 'Lisa Park',
    assignedEmployeeDepartment: 'Electrical Maintenance',
    rewardPoints: 60,
    aiRiskScore: 65,
    notes: 'Scheduled for maintenance this week',
    updates: [],
  },
  {
    id: '4',
    ticketId: 'TKT-2024-004',
    title: 'Garbage Collection Missed',
    description: 'Regular garbage collection missed this week',
    category: 'Sanitation',
    priority: 'Medium',
    location: 'Elm Avenue',
    latitude: 40.768,
    longitude: -73.978,
    date: '2024-03-05',
    status: 'Resolved',
    citizenId: 'citizen-2',
    votes: 8,
    assignedEmployeeId: 'emp-3',
    assignedEmployeeName: 'James Mitchell',
    assignedEmployeeDepartment: 'Sanitation',
    rewardPoints: 60,
    aiRiskScore: 42,
    notes: 'Rescheduled and completed',
    updates: [],
  },
  {
    id: '5',
    ticketId: 'TKT-2024-005',
    title: 'Damaged Traffic Signal',
    description: 'Traffic light not working properly causing congestion',
    category: 'Road',
    priority: 'Critical',
    location: 'Downtown Intersection',
    latitude: 40.758,
    longitude: -73.988,
    date: '2024-03-04',
    status: 'In Progress',
    citizenId: 'citizen-1',
    votes: 45,
    assignedEmployeeId: 'emp-1',
    assignedEmployeeName: 'David Rodriguez',
    assignedEmployeeDepartment: 'Roads & Infrastructure',
    rewardPoints: 100,
    proximityMeters: 210,
    aiRiskScore: 95,
    notes: 'Traffic control measures implemented',
    updates: [],
  },
  {
    id: '6',
    ticketId: 'TKT-2024-006',
    title: 'Sidewalk Repair Needed',
    description: 'Cracked and uneven sidewalk is hazardous',
    category: 'Road',
    priority: 'Low',
    location: 'Birch Road',
    latitude: 40.728,
    longitude: -73.994,
    date: '2024-03-03',
    status: 'Open',
    citizenId: 'citizen-2',
    votes: 5,
    rewardPoints: 30,
    aiRiskScore: 35,
    notes: 'Pending budget allocation',
    updates: [],
  },
];

export const mockAnalytics = {
  totalComplaints: 1247,
  resolvedComplaints: 892,
  pendingComplaints: 355,
  criticalIssues: 23,
  avgResolutionTime: '4.2 days',
  categoryBreakdown: {
    Road: 345,
    Water: 156,
    Electricity: 234,
    Sanitation: 512,
  },
  statusBreakdown: {
    Open: 120,
    'In Progress': 235,
    Resolved: 892,
  },
  monthlyTrend: [
    { month: 'Jan', complaints: 145, resolved: 98 },
    { month: 'Feb', complaints: 178, resolved: 142 },
    { month: 'Mar', complaints: 156, resolved: 128 },
    { month: 'Apr', complaints: 189, resolved: 165 },
    { month: 'May', complaints: 202, resolved: 178 },
    { month: 'Jun', complaints: 198, resolved: 181 },
  ],
};

// Helper functions
export function getCurrentUser(role: string): User {
  if (role === 'employee') {
    return mockUsers[2];
  } else if (role === 'citizen') {
    return mockUsers[0];
  }
  return mockUsers[0];
}

export function getCitizenComplaintsById(citizenId: string): Complaint[] {
  return mockComplaints.filter((c) => c.citizenId === citizenId);
}

export function getAssignedComplaints(employeeId: string): Complaint[] {
  return mockComplaints.filter((c) => c.assignedEmployeeId === employeeId);
}

export function getComplaintById(id: string): Complaint | undefined {
  return mockComplaints.find((c) => c.id === id);
}

export function getEmployeeById(id: string): Employee | undefined {
  return mockEmployees.find((e) => e.id === id);
}

export function getLeaderboard(): Employee[] {
  return [...mockEmployees].sort((a, b) => b.points - a.points);
}

import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongodb';
import {
  ComplaintCategory,
  ComplaintPriority,
  ComplaintStatus,
  GeoPoint,
  LiveLocation,
  UserRole,
} from '@/lib/types';

interface DbUser {
  _id?: ObjectId;
  name: string;
  email: string;
  role: UserRole;
  joinedDate: string;
  passwordHash: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  department?: string;
  rewardPoints?: number;
}

interface DbLiveString {
  _id?: ObjectId;
  value: string;
  createdAt: Date;
  userId?: string;
  userName?: string;
}

interface DbComplaintUpdate {
  id: string;
  timestamp: string;
  message: string;
  employeeId: string;
  employeeName: string;
}

interface DbComplaint {
  _id?: ObjectId;
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
  rewardGranted?: boolean;
  proximityMeters?: number | null;
  aiRiskScore: number;
  images?: string[];
  updates: DbComplaintUpdate[];
  notes: string;
  createdAt: Date;
}

type LiveStringLike = {
  _id?: { toHexString: () => string };
  value: string;
  createdAt: Date;
  userId?: string;
  userName?: string;
};

let isDbPrepared = false;

const CATEGORY_DEPARTMENT_MAP: Record<ComplaintCategory, string> = {
  Road: 'Roads & Infrastructure',
  Water: 'Water Services',
  Electricity: 'Electrical Maintenance',
  Sanitation: 'Sanitation',
  Parks: 'Parks',
  Utilities: 'Utilities',
  Other: 'General Operations',
};

const DEPARTMENT_ALIASES: Record<string, string> = {
  'roads & infrastructure': 'Roads & Infrastructure',
  roads: 'Roads & Infrastructure',
  infrastructure: 'Roads & Infrastructure',
  'water services': 'Water Services',
  water: 'Water Services',
  'electrical maintenance': 'Electrical Maintenance',
  electricity: 'Electrical Maintenance',
  'electricity & lighting': 'Electrical Maintenance',
  lighting: 'Electrical Maintenance',
  sanitation: 'Sanitation',
  parks: 'Parks',
  utilities: 'Utilities',
  'general operations': 'General Operations',
  operations: 'General Operations',
};

function normalizeText(value?: string) {
  return value?.trim().toLowerCase().replace(/\s+/g, ' ') ?? '';
}

function canonicalDepartment(department?: string) {
  const normalized = normalizeText(department);
  return DEPARTMENT_ALIASES[normalized] ?? department?.trim();
}

function locationMatchScore(a?: string, b?: string) {
  const first = normalizeText(a);
  const second = normalizeText(b);
  if (!first || !second) {
    return Number.POSITIVE_INFINITY;
  }
  if (first === second) {
    return 0;
  }
  if (first.includes(second) || second.includes(first)) {
    return 500;
  }
  return Number.POSITIVE_INFINITY;
}

function categoriesForDepartment(department?: string) {
  const canonical = canonicalDepartment(department);
  if (!canonical) {
    return [] as ComplaintCategory[];
  }

  return (Object.entries(CATEGORY_DEPARTMENT_MAP) as [ComplaintCategory, string][])
    .filter(([, value]) => value === canonical)
    .map(([category]) => category);
}

function pointsFromPriority(priority: ComplaintPriority) {
  if (priority === 'Critical') return 100;
  if (priority === 'Medium') return 60;
  return 30;
}

function riskFromPriority(priority: ComplaintPriority) {
  if (priority === 'Critical') return 90;
  if (priority === 'Medium') return 60;
  return 35;
}

function generateTicketId() {
  const d = new Date();
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `TKT-${y}${m}${day}-${random}`;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function distanceInMeters(a: GeoPoint, b: GeoPoint) {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earthRadius = 6371000;
  const latDelta = toRadians(b.latitude - a.latitude);
  const lonDelta = toRadians(b.longitude - a.longitude);
  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);

  const haversine =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(lonDelta / 2) ** 2;

  return 2 * earthRadius * Math.asin(Math.sqrt(haversine));
}

function toLiveLocation(point: GeoPoint): LiveLocation {
  return {
    ...point,
    updatedAt: new Date().toISOString(),
  };
}

async function getUsersCollection() {
  const db = await getDb();
  return db.collection<DbUser>('users');
}

async function getComplaintsCollection() {
  const db = await getDb();
  return db.collection<DbComplaint>('complaints');
}

async function findNearestEmployee(input: { point?: GeoPoint; department?: string; locationText?: string }) {
  const users = await getUsersCollection();
  const department = canonicalDepartment(input.department);
  const candidates = await users
    .find({
      role: 'employee',
      ...(department ? { department } : {}),
    })
    .toArray();

  if (candidates.length === 0 && department) {
    return findNearestEmployee({ point: input.point, locationText: input.locationText });
  }

  let nearest: (DbUser & { distanceMeters: number; locationScore: number }) | null = null;

  for (const employee of candidates) {
    const hasGeo =
      input.point &&
      typeof employee.latitude === 'number' &&
      typeof employee.longitude === 'number';
    const distanceMeters = hasGeo
      ? distanceInMeters(input.point as GeoPoint, {
          latitude: employee.latitude as number,
          longitude: employee.longitude as number,
        })
      : Number.POSITIVE_INFINITY;
    const locationScore = locationMatchScore(input.locationText, employee.location);

    if (
      !nearest ||
      distanceMeters < nearest.distanceMeters ||
      (distanceMeters === nearest.distanceMeters && locationScore < nearest.locationScore)
    ) {
      nearest = { ...employee, distanceMeters, locationScore };
    }
  }

  if (nearest && (Number.isFinite(nearest.distanceMeters) || Number.isFinite(nearest.locationScore))) {
    return nearest;
  }

  return candidates[0] ? { ...candidates[0], distanceMeters: Number.POSITIVE_INFINITY, locationScore: Number.POSITIVE_INFINITY } : null;
}

async function incrementEmployeePoints(employeeId: string, points: number) {
  if (!ObjectId.isValid(employeeId) || points <= 0) {
    return;
  }

  const users = await getUsersCollection();
  await users.updateOne(
    { _id: new ObjectId(employeeId), role: 'employee' },
    { $inc: { rewardPoints: points } }
  );
}

export async function ensureDbSetup() {
  if (isDbPrepared) {
    return;
  }

  const db = await getDb();
  const users = db.collection<DbUser>('users');
  const liveStrings = db.collection<DbLiveString>('live_strings');
  const complaints = db.collection<DbComplaint>('complaints');

  await Promise.all([
    users.createIndex({ email: 1, role: 1 }, { unique: true }),
    users.createIndex({ role: 1, department: 1 }),
    liveStrings.createIndex({ createdAt: -1 }),
    complaints.createIndex({ createdAt: -1 }),
    complaints.createIndex({ citizenId: 1, createdAt: -1 }),
    complaints.createIndex({ assignedEmployeeId: 1, createdAt: -1 }),
  ]);

  isDbPrepared = true;
}

export function serializeUser(user: DbUser) {
  return {
    id: user._id?.toHexString() ?? '',
    name: user.name,
    email: user.email,
    role: user.role,
    location: user.location,
    latitude: user.latitude,
    longitude: user.longitude,
    department: user.department,
    rewardPoints: user.rewardPoints ?? 0,
    joinedDate: user.joinedDate,
  };
}

export async function findUserByEmailAndRole(email: string, role: UserRole) {
  const users = await getUsersCollection();
  const user = await users.findOne({ email: normalizeEmail(email), role });
  return user ? serializeUser(user) : null;
}

export async function findAuthUserByEmailAndRole(email: string, role: UserRole) {
  const users = await getUsersCollection();
  return users.findOne({ email: normalizeEmail(email), role });
}

export async function createUser(input: {
  name: string;
  email: string;
  role: UserRole;
  passwordHash: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  department?: string;
}) {
  const users = await getUsersCollection();
  const email = normalizeEmail(input.email);

  const existing = await users.findOne({ email, role: input.role });
  if (existing) {
    return { user: serializeUser(existing), created: false };
  }

  const payload: DbUser = {
    name: input.name.trim(),
    email,
    role: input.role,
    joinedDate: new Date().toISOString().slice(0, 10),
    passwordHash: input.passwordHash,
    location: input.location?.trim(),
    latitude: input.latitude,
    longitude: input.longitude,
    department: input.role === 'employee' ? canonicalDepartment(input.department) : undefined,
    rewardPoints: input.role === 'employee' ? 0 : undefined,
  };

  const result = await users.insertOne(payload);
  const created = await users.findOne({ _id: result.insertedId });
  if (!created) {
    throw new Error('Failed to create user');
  }

  return { user: serializeUser(created), created: true };
}

export async function findUserById(userId: string) {
  if (!ObjectId.isValid(userId)) {
    return null;
  }

  const users = await getUsersCollection();
  const user = await users.findOne({ _id: new ObjectId(userId) });
  return user ? serializeUser(user) : null;
}

export async function listEmployees() {
  const users = await getUsersCollection();
  const items = await users.find({ role: 'employee' }).sort({ name: 1 }).toArray();
  return items.map(serializeUser);
}

export function serializeLiveString(item: LiveStringLike) {
  return {
    id: item._id?.toHexString() ?? '',
    value: item.value,
    createdAt: item.createdAt.toISOString(),
    userId: item.userId ?? null,
    userName: item.userName ?? null,
  };
}

export async function createLiveString(value: string, user?: { id: string; name: string }) {
  const db = await getDb();
  const payload = {
    value,
    createdAt: new Date(),
    userId: user?.id,
    userName: user?.name,
  };

  const result = await db.collection<DbLiveString>('live_strings').insertOne(payload);
  const created = await db.collection<DbLiveString>('live_strings').findOne({ _id: result.insertedId });

  if (!created) {
    throw new Error('Failed to create live string');
  }

  return serializeLiveString(created);
}

export async function listLiveStrings(limit = 20) {
  const db = await getDb();
  const items = await db
    .collection<DbLiveString>('live_strings')
    .find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();

  return items.map(serializeLiveString);
}

export function serializeComplaint(complaint: DbComplaint) {
  return {
    id: complaint._id?.toHexString() ?? '',
    ticketId: complaint.ticketId,
    title: complaint.title,
    description: complaint.description,
    category: complaint.category,
    priority: complaint.priority,
    location: complaint.location,
    latitude: complaint.latitude,
    longitude: complaint.longitude,
    citizenLiveLocation: complaint.citizenLiveLocation,
    employeeLiveLocation: complaint.employeeLiveLocation,
    date: complaint.date,
    status: complaint.status,
    citizenId: complaint.citizenId,
    votes: complaint.votes,
    assignedEmployeeId: complaint.assignedEmployeeId,
    assignedEmployeeName: complaint.assignedEmployeeName,
    assignedEmployeeDepartment: complaint.assignedEmployeeDepartment,
    rewardPoints: complaint.rewardPoints,
    proximityMeters: complaint.proximityMeters ?? null,
    aiRiskScore: complaint.aiRiskScore,
    images: complaint.images ?? [],
    updates: complaint.updates ?? [],
    notes: complaint.notes ?? '',
  };
}

export async function createComplaint(input: {
  title: string;
  description: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  location: string;
  latitude?: number;
  longitude?: number;
  images?: string[];
  citizenId: string;
}) {
  const complaints = await getComplaintsCollection();
  const point =
    typeof input.latitude === 'number' && typeof input.longitude === 'number'
      ? { latitude: input.latitude, longitude: input.longitude }
      : undefined;
  const department = CATEGORY_DEPARTMENT_MAP[input.category];
  const assignedEmployee = await findNearestEmployee({
    point,
    department,
    locationText: input.location,
  });
  const rewardPoints = pointsFromPriority(input.priority);
  const updates: DbComplaintUpdate[] = [];

  if (assignedEmployee) {
    updates.push({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      message: `Task auto-assigned to ${assignedEmployee.name} (${assignedEmployee.department ?? 'Operations'}) based on nearest live location.`,
      employeeId: assignedEmployee._id?.toHexString() ?? '',
      employeeName: assignedEmployee.name,
    });
  }

  const proximityMeters =
    assignedEmployee &&
    point &&
    typeof assignedEmployee.latitude === 'number' &&
    typeof assignedEmployee.longitude === 'number'
      ? Math.round(
          distanceInMeters(point, {
            latitude: assignedEmployee.latitude,
            longitude: assignedEmployee.longitude,
          })
        )
      : null;

  const payload: DbComplaint = {
    ticketId: generateTicketId(),
    title: input.title.trim(),
    description: input.description.trim(),
    category: input.category,
    priority: input.priority,
    location: input.location.trim(),
    latitude: input.latitude,
    longitude: input.longitude,
    citizenLiveLocation: point ? toLiveLocation(point) : undefined,
    date: new Date().toISOString().slice(0, 10),
    status: assignedEmployee ? 'In Progress' : 'Open',
    citizenId: input.citizenId,
    votes: 0,
    assignedEmployeeId: assignedEmployee?._id?.toHexString(),
    assignedEmployeeName: assignedEmployee?.name,
    assignedEmployeeDepartment: assignedEmployee?.department,
    rewardPoints,
    rewardGranted: false,
    proximityMeters,
    aiRiskScore: riskFromPriority(input.priority),
    images: input.images ?? [],
    updates,
    notes: assignedEmployee
      ? `Assigned to nearest ${assignedEmployee.department ?? 'operations'} employee with ${rewardPoints} reward points attached.`
      : `Awaiting assignment. This task carries ${rewardPoints} reward points.`,
    createdAt: new Date(),
  };

  const result = await complaints.insertOne(payload);
  const created = await complaints.findOne({ _id: result.insertedId });
  if (!created) {
    throw new Error('Failed to create complaint');
  }

  return serializeComplaint(created);
}

export async function listComplaints(scope: 'all' | 'mine' | 'employee', userId: string, limit = 100) {
  const complaints = await getComplaintsCollection();

  const query =
    scope === 'mine'
      ? { citizenId: userId }
      : scope === 'employee'
        ? { assignedEmployeeId: userId }
        : {};

  const items = await complaints.find(query).sort({ createdAt: -1 }).limit(limit).toArray();
  return items.map(serializeComplaint);
}

export async function listEmployeeComplaints(input: {
  userId: string;
  limit?: number;
}) {
  const complaints = await getComplaintsCollection();
  const items = await complaints
    .find({ assignedEmployeeId: input.userId })
    .sort({ createdAt: -1 })
    .limit(input.limit ?? 100)
    .toArray();

  return items.map(serializeComplaint);
}

export async function listAvailableEmployeeComplaints(input: {
  limit?: number;
}) {
  const complaints = await getComplaintsCollection();

  const items = await complaints
    .find({
      status: 'Open',
      $or: [{ assignedEmployeeId: { $exists: false } }, { assignedEmployeeId: '' }],
    })
    .sort({ createdAt: -1 })
    .limit(input.limit ?? 100)
    .toArray();

  return items.map(serializeComplaint);
}

export async function claimComplaint(input: {
  complaintId: string;
  userId: string;
  employeeName: string;
  department?: string;
}) {
  if (!ObjectId.isValid(input.complaintId)) {
    return null;
  }

  const complaints = await getComplaintsCollection();
  const categories = categoriesForDepartment(input.department);
  const department = canonicalDepartment(input.department);
  const existing = await complaints.findOne({ _id: new ObjectId(input.complaintId) });
  if (!existing) {
    return null;
  }

  if (existing.assignedEmployeeId) {
    return serializeComplaint(existing);
  }

  if (categories.length > 0 && !categories.includes(existing.category)) {
    return null;
  }

  await complaints.updateOne(
    {
      _id: new ObjectId(input.complaintId),
      $or: [{ assignedEmployeeId: { $exists: false } }, { assignedEmployeeId: '' }],
    },
    {
      $set: {
        assignedEmployeeId: input.userId,
        assignedEmployeeName: input.employeeName,
        assignedEmployeeDepartment: department,
        status: 'In Progress',
        notes: `Assigned to ${input.employeeName}${department ? ` from ${department}` : ''}.`,
      },
      $push: {
        updates: {
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          message: `Task claimed by ${input.employeeName}.`,
          employeeId: input.userId,
          employeeName: input.employeeName,
        },
      },
    }
  );

  return findComplaintById(input.complaintId);
}

export async function findComplaintById(id: string) {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  const complaints = await getComplaintsCollection();
  const complaint = await complaints.findOne({ _id: new ObjectId(id) });
  return complaint ? serializeComplaint(complaint) : null;
}

export async function updateComplaintCitizenReport(
  complaintId: string,
  input: {
    location?: string;
    latitude?: number;
    longitude?: number;
    image?: string;
  }
) {
  if (!ObjectId.isValid(complaintId)) {
    return null;
  }

  const complaints = await getComplaintsCollection();
  const updateSet: Partial<DbComplaint> = {};

  if (input.location?.trim()) {
    updateSet.location = input.location.trim();
  }

  if (typeof input.latitude === 'number' && typeof input.longitude === 'number') {
    updateSet.latitude = input.latitude;
    updateSet.longitude = input.longitude;
    updateSet.citizenLiveLocation = toLiveLocation({
      latitude: input.latitude,
      longitude: input.longitude,
    });
  }

  const updateDoc: {
    $set?: Partial<DbComplaint>;
    $push?: { images: string };
  } = {};

  if (Object.keys(updateSet).length > 0) {
    updateDoc.$set = updateSet;
  }

  if (input.image) {
    updateDoc.$push = { images: input.image };
  }

  if (!updateDoc.$set && !updateDoc.$push) {
    return findComplaintById(complaintId);
  }

  await complaints.updateOne({ _id: new ObjectId(complaintId) }, updateDoc);
  return findComplaintById(complaintId);
}

export async function updateComplaintEmployeeProgress(
  complaintId: string,
  employee: { id: string; name: string },
  input: {
    status?: ComplaintStatus;
    latitude?: number;
    longitude?: number;
    note?: string;
  }
) {
  if (!ObjectId.isValid(complaintId)) {
    return null;
  }

  const complaints = await getComplaintsCollection();
  const existing = await complaints.findOne({ _id: new ObjectId(complaintId) });
  if (!existing) {
    return null;
  }

  const updates: DbComplaintUpdate[] = [];
  const updateSet: Partial<DbComplaint> = {};

  if (input.status && input.status !== existing.status) {
    updateSet.status = input.status;
    updates.push({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      message: `Status updated to ${input.status}.`,
      employeeId: employee.id,
      employeeName: employee.name,
    });
  }

  if (typeof input.latitude === 'number' && typeof input.longitude === 'number') {
    const liveLocation = toLiveLocation({
      latitude: input.latitude,
      longitude: input.longitude,
    });
    updateSet.employeeLiveLocation = liveLocation;

    if (typeof existing.latitude === 'number' && typeof existing.longitude === 'number') {
      updateSet.proximityMeters = Math.round(
        distanceInMeters(
          {
            latitude: existing.latitude,
            longitude: existing.longitude,
          },
          liveLocation
        )
      );
    }

    updates.push({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      message: 'Employee shared a live field location update.',
      employeeId: employee.id,
      employeeName: employee.name,
    });
  }

  if (input.note?.trim()) {
    updateSet.notes = input.note.trim();
    updates.push({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      message: input.note.trim(),
      employeeId: employee.id,
      employeeName: employee.name,
    });
  }

  if (Object.keys(updateSet).length === 0 && updates.length === 0) {
    return serializeComplaint(existing);
  }

  await complaints.updateOne(
    { _id: new ObjectId(complaintId) },
    {
      ...(Object.keys(updateSet).length > 0 ? { $set: updateSet } : {}),
      ...(updates.length > 0 ? { $push: { updates: { $each: updates } } } : {}),
    }
  );

  return findComplaintById(complaintId);
}

export async function resolveComplaint(
  complaintId: string,
  employee: { id: string; name: string }
) {
  if (!ObjectId.isValid(complaintId)) {
    return null;
  }

  const complaints = await getComplaintsCollection();
  const existing = await complaints.findOne({ _id: new ObjectId(complaintId) });
  if (!existing) {
    return null;
  }

  if (existing.assignedEmployeeId !== employee.id) {
    return null;
  }

  const alreadyResolved = existing.status === 'Resolved';
  const rewardGranted = existing.rewardGranted === true;

  await complaints.updateOne(
    { _id: new ObjectId(complaintId) },
    {
      $set: {
        status: 'Resolved',
        rewardGranted: true,
        notes: `Resolved by ${employee.name}. Reward points processed.`,
      },
      $push: {
        updates: {
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          message: alreadyResolved ? 'Resolution confirmed again.' : 'Issue resolved successfully.',
          employeeId: employee.id,
          employeeName: employee.name,
        },
      },
    }
  );

  if (!rewardGranted) {
    await incrementEmployeePoints(employee.id, existing.rewardPoints);
  }

  return findComplaintById(complaintId);
}

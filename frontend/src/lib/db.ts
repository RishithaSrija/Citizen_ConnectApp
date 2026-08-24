import fs from 'fs';
import path from 'path';

// Define DB Types
export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Stored in cleartext for mock purposes, but can be hashed
  role: 'citizen' | 'admin';
  phone: string;
  status: 'active' | 'suspended';
  createdAt: string;
}

export interface AISummary {
  summary: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High';
  recommendedDepartment: string;
  keywords: string[];
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  aiSummary?: AISummary;
  category: string;
  priority: 'Low' | 'Medium' | 'High';
  department: string;
  status: 'Submitted' | 'Under Review' | 'Assigned' | 'In Progress' | 'Resolved' | 'Closed';
  location: string;
  latitude: number;
  longitude: number;
  images: string[]; // base64 or paths
  userId: string;
  userName?: string; // Joined field for easy display
  contactPhone: string;
  internalNotes?: string;
  estimatedResolutionTime?: string; // e.g., "3 days"
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  color: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'status_change' | 'assignment' | 'submission';
  readStatus: boolean;
  createdAt: string;
}

export interface DBStructure {
  users: User[];
  complaints: Complaint[];
  departments: Department[];
  notifications: Notification[];
}

const DB_PATH = path.join(process.cwd(), 'citizen_db.json');

// Initial seed data
const initialDepartments: Department[] = [
  { id: 'dept-roads', name: 'Roads Department', description: 'Handles potholes, street paving, and dividers.', color: '#3b82f6' },
  { id: 'dept-water', name: 'Water Department', description: 'Manages water supply, pipe leaks, and drainage.', color: '#06b6d4' },
  { id: 'dept-electricity', name: 'Electricity Department', description: 'Maintains streetlights, power lines, and transformers.', color: '#f59e0b' },
  { id: 'dept-sanitation', name: 'Municipal Sanitation', description: 'Deals with waste collection, public toilets, and littering.', color: '#10b981' },
  { id: 'dept-publicworks', name: 'Public Works', description: 'Maintains public parks, signage, and government facilities.', color: '#8b5cf6' },
  { id: 'dept-environment', name: 'Environment Department', description: 'Addresses air pollution, noise, tree felling, and pests.', color: '#059669' }
];

const initialUsers: User[] = [
  {
    id: 'user-admin',
    name: 'Chief Administrator',
    email: 'admin@citizenconnect.gov',
    password: 'admin123',
    role: 'admin',
    phone: '+15550100',
    status: 'active',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'user-citizen',
    name: 'Aria Sterling',
    email: 'citizen@gmail.com',
    password: 'citizen123',
    role: 'citizen',
    phone: '+15550199',
    status: 'active',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const initialComplaints = (citizenId: string): Complaint[] => [
  {
    id: 'comp-1',
    title: 'Severe Pothole on Maple Avenue',
    description: 'There is a huge pothole near the intersection of Maple Avenue and 4th Street. It has already caused damage to at least two vehicles. It fills with water when it rains, making it hard to see.',
    category: 'Roads',
    priority: 'High',
    department: 'Roads Department',
    status: 'In Progress',
    location: 'Maple Ave & 4th St',
    latitude: 37.7749,
    longitude: -122.4194,
    images: [],
    userId: citizenId,
    contactPhone: '+15550199',
    internalNotes: 'Assigned crew 4B for patching work. Expected completion by Monday.',
    estimatedResolutionTime: '3 days',
    aiSummary: {
      summary: 'A large, dangerous pothole located at Maple Avenue & 4th Street causing vehicle damage and safety hazards during rain.',
      category: 'Roads',
      priority: 'High',
      recommendedDepartment: 'Roads Department',
      keywords: ['pothole', 'road damage', 'safety hazard']
    },
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'comp-2',
    title: 'Water Pipeline Leakage',
    description: 'Water has been gushing out of a main pipe leak on the sidewalk outside 142 Pine Street. Thousands of gallons are being wasted, and it is flooding the street.',
    category: 'Water Supply',
    priority: 'High',
    department: 'Water Department',
    status: 'Assigned',
    location: '142 Pine St',
    latitude: 37.7833,
    longitude: -122.4167,
    images: [],
    userId: citizenId,
    contactPhone: '+15550199',
    estimatedResolutionTime: '1 day',
    aiSummary: {
      summary: 'Significant freshwater leakage from a damaged main pipe flooding the sidewalk at 142 Pine Street.',
      category: 'Water Supply',
      priority: 'High',
      recommendedDepartment: 'Water Department',
      keywords: ['leak', 'flooding', 'water wastage']
    },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'comp-3',
    title: 'Broken Streetlight',
    description: 'The streetlights along Oak Lane (entire block between 7th and 8th) have been completely dark for over a week. It feels very unsafe to walk at night.',
    category: 'Street Lights',
    priority: 'Medium',
    department: 'Electricity Department',
    status: 'Submitted',
    location: 'Oak Lane (7th-8th St)',
    latitude: 37.7699,
    longitude: -122.4468,
    images: [],
    userId: citizenId,
    contactPhone: '+15550199',
    aiSummary: {
      summary: 'Streetlight outages covering a full block on Oak Lane, raising local public safety concerns.',
      category: 'Street Lights',
      priority: 'Medium',
      recommendedDepartment: 'Electricity Department',
      keywords: ['streetlight', 'darkness', 'safety']
    },
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const initialNotifications = (citizenId: string): Notification[] => [
  {
    id: 'notif-1',
    userId: citizenId,
    message: 'Your complaint "Severe Pothole on Maple Avenue" status updated to "In Progress".',
    type: 'status_change',
    readStatus: false,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'notif-2',
    userId: citizenId,
    message: 'Your complaint "Water Pipeline Leakage" has been routed to the Water Department.',
    type: 'assignment',
    readStatus: false,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Helper database functions
export function readDB(): DBStructure {
  try {
    if (!fs.existsSync(DB_PATH)) {
      const dbData: DBStructure = {
        users: initialUsers,
        complaints: initialComplaints(initialUsers[1].id),
        departments: initialDepartments,
        notifications: initialNotifications(initialUsers[1].id)
      };
      fs.writeFileSync(DB_PATH, JSON.stringify(dbData, null, 2), 'utf-8');
      return dbData;
    }
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Failed to read database file:', error);
    return { users: [], complaints: [], departments: [], notifications: [] };
  }
}

export function writeDB(data: DBStructure): void {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to write database file:', error);
  }
}

// Model API Actions
export const DB = {
  // Users
  getUsers: () => readDB().users,
  getUserById: (id: string) => readDB().users.find(u => u.id === id),
  getUserByEmail: (email: string) => readDB().users.find(u => u.email.toLowerCase() === email.toLowerCase()),
  createUser: (user: Omit<User, 'id' | 'createdAt'>) => {
    const db = readDB();
    const newUser: User = {
      ...user,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    db.users.push(newUser);
    writeDB(db);
    return newUser;
  },
  updateUserStatus: (id: string, status: 'active' | 'suspended') => {
    const db = readDB();
    const idx = db.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      db.users[idx].status = status;
      writeDB(db);
      return db.users[idx];
    }
    return null;
  },

  // Complaints
  getComplaints: () => {
    const db = readDB();
    // Enrich complaints with user names for easier display
    return db.complaints.map(comp => ({
      ...comp,
      userName: db.users.find(u => u.id === comp.userId)?.name || 'Unknown User'
    }));
  },
  getComplaintById: (id: string) => {
    const db = readDB();
    const comp = db.complaints.find(c => c.id === id);
    if (!comp) return null;
    return {
      ...comp,
      userName: db.users.find(u => u.id === comp.userId)?.name || 'Unknown User'
    };
  },
  getComplaintsByUser: (userId: string) => {
    const db = readDB();
    return db.complaints.filter(c => c.userId === userId);
  },
  createComplaint: (comp: Omit<Complaint, 'id' | 'createdAt' | 'updatedAt'>) => {
    const db = readDB();
    const newComp: Complaint = {
      ...comp,
      id: `comp-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.complaints.push(newComp);
    writeDB(db);

    // Create custom notification for the submission
    DB.createNotification({
      userId: comp.userId,
      message: `Your complaint "${comp.title}" has been successfully submitted and is under review.`,
      type: 'submission'
    });

    return newComp;
  },
  updateComplaint: (id: string, updates: Partial<Omit<Complaint, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) => {
    const db = readDB();
    const idx = db.complaints.findIndex(c => c.id === id);
    if (idx !== -1) {
      const old = db.complaints[idx];
      db.complaints[idx] = {
        ...old,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      // Notify user if status or department changes
      if (updates.status && updates.status !== old.status) {
        DB.createNotification({
          userId: old.userId,
          message: `Your complaint "${old.title}" status has been updated to "${updates.status}".`,
          type: 'status_change'
        });
      }
      if (updates.department && updates.department !== old.department) {
        DB.createNotification({
          userId: old.userId,
          message: `Your complaint "${old.title}" has been assigned to the ${updates.department}.`,
          type: 'assignment'
        });
      }

      writeDB(db);
      return db.complaints[idx];
    }
    return null;
  },

  // Departments
  getDepartments: () => readDB().departments,

  // Notifications
  getNotificationsByUser: (userId: string) => {
    return readDB().notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  createNotification: (notif: Omit<Notification, 'id' | 'readStatus' | 'createdAt'>) => {
    const db = readDB();
    const newNotif: Notification = {
      ...notif,
      id: `notif-${Date.now()}`,
      readStatus: false,
      createdAt: new Date().toISOString()
    };
    db.notifications.push(newNotif);
    writeDB(db);
    return newNotif;
  },
  markNotificationRead: (id: string) => {
    const db = readDB();
    const idx = db.notifications.findIndex(n => n.id === id);
    if (idx !== -1) {
      db.notifications[idx].readStatus = true;
      writeDB(db);
      return true;
    }
    return false;
  },
  markAllNotificationsRead: (userId: string) => {
    const db = readDB();
    db.notifications.forEach(n => {
      if (n.userId === userId) n.readStatus = true;
    });
    writeDB(db);
    return true;
  }
};

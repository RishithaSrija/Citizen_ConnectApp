import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Clean existing database records
  await prisma.statusUpdate.deleteMany({});
  await prisma.complaintImage.deleteMany({});
  await prisma.complaint.deleteMany({});
  await prisma.department.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.chatHistory.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Pre-hash passwords
  const hashedAdminPassword = await bcrypt.hash('admin123', 10);
  const hashedCitizenPassword = await bcrypt.hash('citizen123', 10);
  const hashedSrijaPassword = await bcrypt.hash('2685965', 10);

  // 3. Seed Users
  const admin = await prisma.user.create({
    data: {
      id: 'user-admin',
      fullName: 'Chief Administrator',
      email: 'admin@citizenconnect.gov',
      password: hashedAdminPassword,
      role: 'admin',
      phone: '+15550100',
    },
  });

  const citizen = await prisma.user.create({
    data: {
      id: 'user-citizen',
      fullName: 'Aria Sterling',
      email: 'citizen@gmail.com',
      password: hashedCitizenPassword,
      role: 'citizen',
      phone: '+15550199',
    },
  });

  const srija = await prisma.user.create({
    data: {
      id: 'user-1781880900928',
      fullName: 'Srija',
      email: 'asani@gmail.com',
      password: hashedSrijaPassword,
      role: 'citizen',
      phone: '+919247444976',
    },
  });

  console.log('Users seeded successfully!');

  // 4. Seed Departments
  const depts = [
    { id: 'dept-roads', name: 'Roads Department', description: 'Handles potholes, street paving, and dividers.' },
    { id: 'dept-water', name: 'Water Department', description: 'Manages water supply, pipe leaks, and drainage.' },
    { id: 'dept-electricity', name: 'Electricity Department', description: 'Maintains streetlights, power lines, and transformers.' },
    { id: 'dept-sanitation', name: 'Municipal Sanitation', description: 'Deals with waste collection, public toilets, and littering.' },
    { id: 'dept-publicworks', name: 'Public Works', description: 'Maintains public parks, signage, and government facilities.' },
    { id: 'dept-environment', name: 'Environment Department', description: 'Addresses air pollution, noise, tree felling, and pests.' },
  ];

  for (const dept of depts) {
    await prisma.department.create({ data: dept });
  }

  console.log('Departments seeded successfully!');

  // 5. Seed Complaints
  const complaints = [
    {
      id: 'comp-1',
      complaintNumber: 'CIV-2026-0001',
      title: 'Severe Pothole on Maple Avenue',
      description: 'There is a huge pothole near the intersection of Maple Avenue and 4th Street. It has already caused damage to at least two vehicles. It fills with water when it rains, making it hard to see.',
      category: 'Roads',
      priority: 'High',
      status: 'In Progress',
      address: 'Maple Ave & 4th St',
      latitude: 37.7749,
      longitude: -122.4194,
      citizenId: 'user-citizen',
      departmentId: 'dept-roads',
      aiSummary: {
        summary: 'A large, dangerous pothole located at Maple Avenue & 4th Street causing vehicle damage and safety hazards during rain.',
        category: 'Roads',
        priority: 'High',
        recommendedDepartment: 'Roads Department',
        keywords: ['pothole', 'road damage', 'safety hazard']
      }
    },
    {
      id: 'comp-2',
      complaintNumber: 'CIV-2026-0002',
      title: 'Water Pipeline Leakage',
      description: 'Water has been gushing out of a main pipe leak on the sidewalk outside 142 Pine Street. Thousands of gallons are being wasted, and it is flooding the street.',
      category: 'Water Supply',
      priority: 'High',
      status: 'Assigned',
      address: '142 Pine St',
      latitude: 37.7833,
      longitude: -122.4167,
      citizenId: 'user-citizen',
      departmentId: 'dept-water',
      aiSummary: {
        summary: 'Significant freshwater leakage from a damaged main pipe flooding the sidewalk at 142 Pine Street.',
        category: 'Water Supply',
        priority: 'High',
        recommendedDepartment: 'Water Department',
        keywords: ['leak', 'flooding', 'water wastage']
      }
    },
    {
      id: 'comp-3',
      complaintNumber: 'CIV-2026-0003',
      title: 'Broken Streetlight',
      description: 'The streetlights along Oak Lane (entire block between 7th and 8th) have been completely dark for over a week. It feels very unsafe to walk at night.',
      category: 'Street Lights',
      priority: 'Medium',
      status: 'Submitted',
      address: 'Oak Lane (7th-8th St)',
      latitude: 37.7699,
      longitude: -122.4468,
      citizenId: 'user-citizen',
      departmentId: 'dept-electricity',
      aiSummary: {
        summary: 'Streetlight outages covering a full block on Oak Lane, raising local public safety concerns.',
        category: 'Street Lights',
        priority: 'Medium',
        recommendedDepartment: 'Electricity Department',
        keywords: ['streetlight', 'darkness', 'safety']
      }
    },
    {
      id: 'comp-4',
      complaintNumber: 'CIV-2026-0004',
      title: 'Water Pipe Leakage',
      description: 'There is a major pipeline leak on the sidewalk outside 142 Pine Street. Freshwater is gushing out rapidly, flooding the street and creating traffic hazards.',
      category: 'Water Supply',
      priority: 'High',
      status: 'Closed',
      address: '142 Pine Street',
      latitude: 37.79123322607334,
      longitude: -122.40085964899315,
      citizenId: 'user-citizen',
      departmentId: 'dept-water',
      aiSummary: {
        summary: 'There is a major pipeline leak on the sidewalk outside 142 Pine Street. Freshwater is gushing out rapidly, flooding t...',
        category: 'Water Supply',
        priority: 'High',
        recommendedDepartment: 'Water Department',
        keywords: ['water leakage', 'plumbing infrastructure', 'flooding', 'conservation']
      }
    }
  ];

  for (const comp of complaints) {
    const createdComplaint = await prisma.complaint.create({
      data: {
        id: comp.id,
        complaintNumber: comp.complaintNumber,
        title: comp.title,
        description: comp.description,
        category: comp.category,
        priority: comp.priority,
        status: comp.status,
        address: comp.address,
        latitude: comp.latitude,
        longitude: comp.longitude,
        citizenId: comp.citizenId,
        departmentId: comp.departmentId,
        aiSummary: comp.aiSummary
      }
    });

    // Seed initial status history updates
    await prisma.statusUpdate.create({
      data: {
        complaintId: createdComplaint.id,
        status: 'Submitted',
        remarks: 'Grievance submitted by citizen.',
        updatedBy: 'System'
      }
    });

    if (comp.status !== 'Submitted') {
      await prisma.statusUpdate.create({
        data: {
          complaintId: createdComplaint.id,
          status: 'Under Review',
          remarks: 'Complaint validation check completed.',
          updatedBy: 'Chief Administrator'
        }
      });
    }

    if (['Assigned', 'In Progress', 'Resolved', 'Closed'].includes(comp.status)) {
      await prisma.statusUpdate.create({
        data: {
          complaintId: createdComplaint.id,
          status: 'Assigned',
          remarks: `Dispatched work order request to ${comp.category} department.`,
          updatedBy: 'Chief Administrator'
        }
      });
    }

    if (['In Progress', 'Resolved', 'Closed'].includes(comp.status)) {
      await prisma.statusUpdate.create({
        data: {
          complaintId: createdComplaint.id,
          status: 'In Progress',
          remarks: 'Ground service crew has been dispatched to correct issues.',
          updatedBy: `${comp.category} Department`
        }
      });
    }

    if (['Resolved', 'Closed'].includes(comp.status)) {
      await prisma.statusUpdate.create({
        data: {
          complaintId: createdComplaint.id,
          status: 'Resolved',
          remarks: 'Maintenance task execution completed successfully.',
          updatedBy: `${comp.category} Department`
        }
      });
    }

    if (comp.status === 'Closed') {
      await prisma.statusUpdate.create({
        data: {
          complaintId: createdComplaint.id,
          status: 'Closed',
          remarks: 'Ticket archived and confirmed resolved.',
          updatedBy: 'Aria Sterling'
        }
      });
    }
  }

  // 6. Seed Notifications
  await prisma.notification.create({
    data: {
      userId: 'user-citizen',
      title: 'Status Update',
      message: 'Your complaint "Severe Pothole on Maple Avenue" status updated to "In Progress".',
      read: false
    }
  });

  await prisma.notification.create({
    data: {
      userId: 'user-citizen',
      title: 'Department Assigned',
      message: 'Your complaint "Water Pipeline Leakage" has been routed to the Water Department.',
      read: false
    }
  });

  console.log('Seed complaints and updates initialized successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

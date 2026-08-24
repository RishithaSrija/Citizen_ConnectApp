import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// Helper to auto-route category to department
function getDepartmentForCategory(category: string): string {
  switch (category) {
    case 'Roads':
      return 'Roads Department';
    case 'Water Supply':
      return 'Water Department';
    case 'Electricity':
    case 'Street Lights':
      return 'Electricity Department';
    case 'Sanitation':
      return 'Municipal Sanitation';
    case 'Public Safety':
    case 'Other':
      return 'Public Works';
    case 'Environment':
      return 'Environment Department';
    default:
      return 'Public Works';
  }
}

// Helper to determine initial priority
function getPriorityForCategory(category: string): 'Low' | 'Medium' | 'High' {
  if (['Roads', 'Water Supply', 'Electricity', 'Public Safety'].includes(category)) {
    return 'High';
  }
  if (['Sanitation', 'Street Lights', 'Environment'].includes(category)) {
    return 'Medium';
  }
  return 'Low';
}

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    let complaints = DB.getComplaints();

    // Enforce role-based access
    if (user.role === 'citizen') {
      complaints = complaints.filter(c => c.userId === user.id);
    }

    // Apply query filters
    if (category) {
      complaints = complaints.filter(c => c.category === category);
    }
    if (status) {
      complaints = complaints.filter(c => c.status === status);
    }

    // Sort by newest first
    complaints.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ complaints });
  } catch (error) {
    console.error('Fetch complaints error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching complaints' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, category, location, latitude, longitude, images, contactPhone, aiSummary } = body;

    if (!title || !description || !category || !location) {
      return NextResponse.json(
        { error: 'Title, description, category, and location are required' },
        { status: 400 }
      );
    }

    const targetDept = getDepartmentForCategory(category);
    const priority = aiSummary?.priority || getPriorityForCategory(category);

    // Fallback/Default AI summary if not generated on frontend
    const finalAISummary = aiSummary || {
      summary: description.slice(0, 100) + (description.length > 100 ? '...' : ''),
      category,
      priority,
      recommendedDepartment: targetDept,
      keywords: category.toLowerCase().split(' ')
    };

    const newComplaint = DB.createComplaint({
      title,
      description,
      category,
      priority,
      department: targetDept,
      status: 'Submitted',
      location,
      latitude: parseFloat(latitude) || 37.7749,
      longitude: parseFloat(longitude) || -122.4194,
      images: images || [],
      userId: user.id,
      contactPhone: contactPhone || user.phone,
      aiSummary: finalAISummary
    });

    return NextResponse.json({ complaint: newComplaint }, { status: 201 });
  } catch (error) {
    console.error('Create complaint error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while submitting the complaint' },
      { status: 500 }
    );
  }
}

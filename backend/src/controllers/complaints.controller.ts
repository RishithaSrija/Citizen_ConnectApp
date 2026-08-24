import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AIService } from '../services/ai.service';
import { CloudinaryService } from '../services/cloudinary.service';
import { emitToUser } from '../sockets/socket';
import { z } from 'zod';

const prisma = new PrismaClient();

const createComplaintSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  category: z.string(),
  location: z.string(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  images: z.array(z.string()).optional(),
  contactPhone: z.string().optional(),
  aiSummary: z.any().optional(),
});

export class ComplaintsController {
  // Helper to map category name to official seed department name
  private static getDepartmentNameFromCategory(category: string): string {
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

  // Serializer function to format database structure for frontend consumption
  private static serializeComplaint(comp: any) {
    return {
      id: comp.id,
      complaintNumber: comp.complaintNumber,
      title: comp.title,
      description: comp.description,
      category: comp.category,
      priority: comp.priority,
      department: comp.department?.name || 'Awaiting Routing',
      status: comp.status,
      location: comp.address,
      latitude: comp.latitude,
      longitude: comp.longitude,
      images: comp.images ? comp.images.map((img: any) => img.imageUrl) : [],
      userId: comp.citizenId,
      userName: comp.citizen?.fullName || 'Unknown User',
      contactPhone: comp.contactPhone || comp.citizen?.phone || '',
      internalNotes: comp.internalNotes || '',
      estimatedResolutionTime: comp.estimatedResolutionTime || '',
      aiSummary: comp.aiSummary,
      createdAt: comp.createdAt,
      updatedAt: comp.updatedAt,
      statusUpdates: comp.statusUpdates || [],
    };
  }

  static async create(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const validated = createComplaintSchema.parse(req.body);

      // 1. Generate formatted Complaint Number (CIV-YYYY-XXXX)
      const currentYear = new Date().getFullYear();
      const count = await prisma.complaint.count();
      const complaintNumber = `CIV-${currentYear}-${String(count + 1).padStart(4, '0')}`;

      // 2. Perform AI Text Analysis if not already analyzed on the frontend
      let aiSummary = validated.aiSummary;
      if (!aiSummary) {
        aiSummary = await AIService.analyzeDescription(validated.description);
      }

      // 3. Resolve department mapping
      const targetDeptName = aiSummary.recommendedDepartment || ComplaintsController.getDepartmentNameFromCategory(validated.category);
      const dbDept = await prisma.department.findUnique({
        where: { name: targetDeptName },
      });

      // 4. Upload base64 image items to Cloudinary
      const imageUrls: string[] = [];
      if (validated.images && validated.images.length > 0) {
        for (const base64Str of validated.images) {
          if (base64Str.trim()) {
            const url = await CloudinaryService.uploadImage(base64Str);
            imageUrls.push(url);
          }
        }
      }

      // 5. Save Complaint in Database
      const priority = aiSummary.priority || 'Medium';
      const newComp = await prisma.complaint.create({
        data: {
          complaintNumber,
          title: validated.title,
          description: validated.description,
          category: validated.category,
          latitude: validated.latitude || 37.7749,
          longitude: validated.longitude || -122.4194,
          address: validated.location,
          priority: priority,
          aiSummary: aiSummary,
          citizenId: user.id,
          departmentId: dbDept ? dbDept.id : null,
          status: 'Submitted',
          contactPhone: validated.contactPhone || user.phone,
        },
        include: {
          citizen: true,
          department: true,
        },
      });

      // Create initial images records
      if (imageUrls.length > 0) {
        await prisma.complaintImage.createMany({
          data: imageUrls.map(url => ({
            complaintId: newComp.id,
            imageUrl: url,
          })),
        });
      }

      // 6. Record status change logs in StatusUpdate
      await prisma.statusUpdate.create({
        data: {
          complaintId: newComp.id,
          status: 'Submitted',
          remarks: 'Complaint submitted by citizen.',
          updatedBy: 'System',
        },
      });

      // 7. Create notification for the user
      const notifMessage = `Your complaint "${validated.title}" has been successfully submitted and is under review.`;
      const notif = await prisma.notification.create({
        data: {
          userId: user.id,
          title: 'Grievance Submitted',
          message: notifMessage,
        },
      });

      // 8. Emit notification via socket
      emitToUser(user.id, 'notification', {
        id: notif.id,
        message: notifMessage,
        createdAt: notif.createdAt,
        readStatus: false,
      });

      // Fetch complete record with attachments and status updates to return
      const fullRecord = await prisma.complaint.findUnique({
        where: { id: newComp.id },
        include: {
          citizen: true,
          department: true,
          images: true,
          statusUpdates: { orderBy: { timestamp: 'asc' } },
        },
      });

      return res.status(201).json({
        message: 'Complaint submitted successfully.',
        complaint: ComplaintsController.serializeComplaint(fullRecord),
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error('Create complaint error:', error);
      return res.status(500).json({ error: 'Server error while submitting complaint.' });
    }
  }

  static async list(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { category, status } = req.query;

      const filterConditions: any = {};

      // Role-based scoping
      if (user.role === 'citizen') {
        filterConditions.citizenId = user.id;
      } else if (user.role === 'officer') {
        // Officer only sees complaints assigned to their department
        if (user.departmentId) {
          filterConditions.departmentId = user.departmentId;
        } else {
          return res.status(200).json({ complaints: [] }); // Officer unassigned
        }
      }

      // Query filters
      if (category && category !== 'All') {
        filterConditions.category = category as string;
      }
      if (status && status !== 'All') {
        filterConditions.status = status as string;
      }

      const list = await prisma.complaint.findMany({
        where: filterConditions,
        include: {
          citizen: true,
          department: true,
          images: true,
          statusUpdates: { orderBy: { timestamp: 'asc' } },
        },
        orderBy: { createdAt: 'desc' },
      });

      const serialized = list.map(c => ComplaintsController.serializeComplaint(c));
      return res.json({ complaints: serialized });
    } catch (error) {
      console.error('List complaints error:', error);
      return res.status(500).json({ error: 'Server error while loading complaints.' });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = (req as any).user;

      const comp = await prisma.complaint.findUnique({
        where: { id },
        include: {
          citizen: true,
          department: true,
          images: true,
          statusUpdates: { orderBy: { timestamp: 'asc' } },
        },
      });

      if (!comp) {
        return res.status(404).json({ error: 'Complaint ticket not found.' });
      }

      // Access checks
      if (user.role === 'citizen' && comp.citizenId !== user.id) {
        return res.status(403).json({ error: 'Unauthorized.' });
      }
      if (user.role === 'officer' && comp.departmentId !== user.departmentId) {
        return res.status(403).json({ error: 'Unauthorized.' });
      }

      return res.json({ complaint: ComplaintsController.serializeComplaint(comp) });
    } catch (error) {
      console.error('Get complaint details error:', error);
      return res.status(500).json({ error: 'Server error while loading complaint details.' });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const { status, department, priority, estimatedResolutionTime, internalNotes } = req.body;

      const existing = await prisma.complaint.findUnique({
        where: { id },
        include: { citizen: true },
      });

      if (!existing) {
        return res.status(404).json({ error: 'Complaint not found.' });
      }

      // Enforce status machine/access guards
      // Citizen is ONLY allowed to transition from Resolved -> Closed
      if (user.role === 'citizen') {
        if (status !== 'Closed') {
          return res.status(403).json({ error: 'Citizens are only allowed to close their own tickets.' });
        }
        if (existing.citizenId !== user.id) {
          return res.status(403).json({ error: 'Unauthorized.' });
        }
      }

      // Officer check: can only update status if assigned to their department
      if (user.role === 'officer' && existing.departmentId !== user.departmentId) {
        return res.status(403).json({ error: 'Officers can only update complaints within their department.' });
      }

      const updateData: any = {};
      const logRemarks: string[] = [];

      if (status && status !== existing.status) {
        updateData.status = status;
        logRemarks.push(`Status changed from ${existing.status} to ${status}`);
      }

      if (priority && priority !== existing.priority) {
        updateData.priority = priority;
        logRemarks.push(`Priority changed to ${priority}`);
      }

      if (estimatedResolutionTime && estimatedResolutionTime !== existing.estimatedResolutionTime) {
        updateData.estimatedResolutionTime = estimatedResolutionTime;
      }

      if (internalNotes && internalNotes !== existing.internalNotes) {
        updateData.internalNotes = internalNotes;
      }

      // If department assignment is overridden
      if (department) {
        const dbDept = await prisma.department.findUnique({
          where: { name: department },
        });
        if (dbDept && dbDept.id !== existing.departmentId) {
          updateData.departmentId = dbDept.id;
          logRemarks.push(`Grievance assigned to ${department}`);
        }
      }

      // Perform DB updates
      const updated = await prisma.complaint.update({
        where: { id },
        data: updateData,
        include: {
          citizen: true,
          department: true,
          images: true,
          statusUpdates: { orderBy: { timestamp: 'asc' } },
        },
      });

      // Write audits logs to StatusUpdates
      if (logRemarks.length > 0) {
        const remarks = logRemarks.join('. ');
        await prisma.statusUpdate.create({
          data: {
            complaintId: updated.id,
            status: updated.status,
            remarks: remarks,
            updatedBy: user.fullName || user.role,
          },
        });

        // Notify user about update
        const notifMessage = `Your complaint "${updated.title}" was updated: ${remarks}.`;
        const notif = await prisma.notification.create({
          data: {
            userId: updated.citizenId,
            title: 'Ticket Status Update',
            message: notifMessage,
          },
        });

        // Emit real-time notification
        emitToUser(updated.citizenId, 'notification', {
          id: notif.id,
          message: notifMessage,
          createdAt: notif.createdAt,
          readStatus: false,
        });
      }

      // Re-fetch complete complaint record with latest status updates
      const fullRecord = await prisma.complaint.findUnique({
        where: { id: updated.id },
        include: {
          citizen: true,
          department: true,
          images: true,
          statusUpdates: { orderBy: { timestamp: 'asc' } },
        },
      });

      return res.json({
        message: 'Complaint updated successfully.',
        complaint: ComplaintsController.serializeComplaint(fullRecord),
      });
    } catch (error) {
      console.error('Update complaint error:', error);
      return res.status(500).json({ error: 'Server error while updating complaint details.' });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = (req as any).user;

      if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Only administrators can delete complaint files.' });
      }

      await prisma.complaint.delete({
        where: { id },
      });

      return res.json({ message: 'Complaint ticket deleted successfully.' });
    } catch (error) {
      console.error('Delete complaint error:', error);
      return res.status(500).json({ error: 'Server error while deleting complaint.' });
    }
  }
}

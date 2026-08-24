import React from 'react';
import { Complaint } from '@/lib/db';

interface TimelineProps {
  complaint: Complaint;
}

interface TimelineStep {
  title: string;
  description: string;
  date?: string;
  isCompleted: boolean;
  isActive: boolean;
}

export default function Timeline({ complaint }: TimelineProps) {
  const steps: TimelineStep[] = [];
  const statusOrder = ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Closed'];
  const currentIdx = statusOrder.indexOf(complaint.status);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Step 1: Submitted
  steps.push({
    title: 'Grievance Submitted',
    description: `Complaint successfully submitted under category: ${complaint.category}. ID: ${complaint.id}`,
    date: formatDate(complaint.createdAt),
    isCompleted: currentIdx >= 0,
    isActive: complaint.status === 'Submitted'
  });

  // Step 2: Under Review
  steps.push({
    title: 'Under Review',
    description: currentIdx >= 1 
      ? 'Grievance reviewed by administrators and validated for department routing.' 
      : 'Queued for administrator review and inspection.',
    date: currentIdx >= 1 ? formatDate(complaint.createdAt) : undefined, // approximate
    isCompleted: currentIdx >= 1,
    isActive: complaint.status === 'Under Review'
  });

  // Step 3: Assigned
  steps.push({
    title: 'Assigned to Department',
    description: currentIdx >= 2 
      ? `Routed to the [${complaint.department}] for execution and staffing.`
      : 'Pending department dispatch.',
    date: currentIdx >= 2 ? formatDate(complaint.updatedAt) : undefined,
    isCompleted: currentIdx >= 2,
    isActive: complaint.status === 'Assigned'
  });

  // Step 4: In Progress
  steps.push({
    title: 'Resolution In Progress',
    description: currentIdx >= 3 
      ? (complaint.internalNotes || 'Ground crew dispatched to inspect and resolve the reported issue.') 
      : 'Awaiting ground scheduling.',
    date: currentIdx >= 3 ? formatDate(complaint.updatedAt) : undefined,
    isCompleted: currentIdx >= 3,
    isActive: complaint.status === 'In Progress'
  });

  // Step 5: Resolved
  steps.push({
    title: 'Marked Resolved',
    description: currentIdx >= 4 
      ? 'The assigned department has successfully resolved the civic issue. Awaiting citizen confirmation.' 
      : 'Pending work completion.',
    date: currentIdx >= 4 ? formatDate(complaint.updatedAt) : undefined,
    isCompleted: currentIdx >= 4,
    isActive: complaint.status === 'Resolved'
  });

  // Step 6: Closed
  steps.push({
    title: 'Ticket Closed',
    description: currentIdx >= 5 
      ? 'Complaint has been closed and archived. Thank you for helping improve the community!' 
      : 'Pending closure.',
    date: currentIdx >= 5 ? formatDate(complaint.updatedAt) : undefined,
    isCompleted: currentIdx >= 5,
    isActive: complaint.status === 'Closed'
  });

  return (
    <div className="timeline-container">
      {steps.map((step, idx) => (
        <div key={idx} className="timeline-item">
          <div className={`timeline-dot ${step.isCompleted ? 'active' : ''}`} />
          <div className="timeline-content">
            <div className="timeline-header">
              <span className="timeline-title" style={{ color: step.isActive ? 'var(--primary)' : 'inherit' }}>
                {step.title}
              </span>
              {step.date && <span className="timeline-date">{step.date}</span>}
            </div>
            <p className="timeline-desc">{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

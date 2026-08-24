import React from 'react';

type BadgeType = 'status' | 'priority';

interface StatusBadgeProps {
  value: string;
  type?: BadgeType;
}

export default function StatusBadge({ value, type = 'status' }: StatusBadgeProps) {
  let styles: React.CSSProperties = {};
  
  if (type === 'status') {
    switch (value) {
      case 'Submitted':
        styles = { color: 'var(--status-submitted)', backgroundColor: 'var(--status-submitted-bg)' };
        break;
      case 'Under Review':
        styles = { color: 'var(--status-review)', backgroundColor: 'var(--status-review-bg)' };
        break;
      case 'Assigned':
        styles = { color: 'var(--status-assigned)', backgroundColor: 'var(--status-assigned-bg)' };
        break;
      case 'In Progress':
        styles = { color: 'var(--status-progress)', backgroundColor: 'var(--status-progress-bg)' };
        break;
      case 'Resolved':
        styles = { color: 'var(--status-resolved)', backgroundColor: 'var(--status-resolved-bg)' };
        break;
      case 'Closed':
        styles = { color: 'var(--status-closed)', backgroundColor: 'var(--status-closed-bg)' };
        break;
      default:
        styles = { color: 'var(--muted)', backgroundColor: 'var(--muted-light)' };
    }
  } else {
    // Priority badge styling
    switch (value) {
      case 'Low':
        styles = { color: 'var(--priority-low)', backgroundColor: 'var(--priority-low-bg)' };
        break;
      case 'Medium':
        styles = { color: 'var(--priority-medium)', backgroundColor: 'var(--priority-medium-bg)' };
        break;
      case 'High':
        styles = { color: 'var(--priority-high)', backgroundColor: 'var(--priority-high-bg)' };
        break;
      default:
        styles = { color: 'var(--muted)', backgroundColor: 'var(--muted-light)' };
    }
  }

  const badgeStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px 12px',
    borderRadius: 'var(--radius-full)',
    fontSize: '12px',
    fontWeight: '600',
    letterSpacing: '0.02em',
    textTransform: 'uppercase',
    width: 'fit-content',
    ...styles
  };

  return <span style={badgeStyle}>{value}</span>;
}

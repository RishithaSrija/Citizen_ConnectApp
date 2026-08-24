import React from 'react';

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  accentColor?: string;
}

export default function MetricCard({ title, value, icon, subtitle, trend, accentColor = 'var(--primary)' }: MetricCardProps) {
  return (
    <div className="metric-card animate-fade-in">
      <div className="metric-card-header">
        <span className="metric-title">{title}</span>
        <div className="metric-icon-wrapper" style={{ color: accentColor, backgroundColor: `${accentColor}1a` }}>
          {icon}
        </div>
      </div>
      <div className="metric-card-body">
        <h3 className="metric-value">{value}</h3>
        <div className="metric-trend-row">
          {trend && (
            <span className={`metric-trend ${trend.isPositive ? 'trend-up' : 'trend-down'}`}>
              {trend.value}
            </span>
          )}
          {subtitle && <span className="metric-subtitle">{subtitle}</span>}
        </div>
      </div>
    </div>
  );
}

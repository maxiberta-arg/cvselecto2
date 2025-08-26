// Card visual reutilizable para dashboards
// Props: icon, title, text, color, bgColor
import React from 'react';

export default function DashboardCard({ icon, title, text, color = '#1976d2', bgColor = '#e3f2fd' }) {
  return (
    <div className="card shadow-lg border-0 h-100" style={{ background: bgColor, borderRadius: '18px' }}>
      <div className="card-body text-center">
        <div className="mb-3">
          <i className={icon} style={{ fontSize: '2.5rem', color }}></i>
        </div>
        <h5 className="card-title fw-bold" style={{ color }}>{title}</h5>
        <p className="card-text">{text}</p>
      </div>
    </div>
  );
}

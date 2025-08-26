// Título de sección para dashboards
// Props: children, color
import React from 'react';

export default function SectionTitle({ children, color = '#1976d2' }) {
  return (
    <h2 className="fw-bold mb-4" style={{ color }}>{children}</h2>
  );
}

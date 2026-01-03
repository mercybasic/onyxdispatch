import React from 'react';

const StatCard = ({ label, value, icon, color }) => (
  <div className="stat-card" style={{ '--stat-color': color }}>
    <div className="stat-label">{label}</div>
    <div className="stat-value" style={{ color }}>{value}</div>
    <div className="stat-icon">{icon}</div>
  </div>
);

export default StatCard;

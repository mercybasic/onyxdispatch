export const SERVICE_TYPES = [
  { id: 'SAR', name: 'Search & Rescue', icon: '🔍', color: '#f59e0b' },
  { id: 'CSAR', name: 'Combat SAR', icon: '⚔️', color: '#ef4444' },
  { id: 'Refueling', name: 'Refueling', icon: '⛽', color: '#3b82f6' },
  { id: 'Medical', name: 'Medical Evac', icon: '🏥', color: '#10b981' },
  { id: 'Escort', name: 'Escort', icon: '🛡️', color: '#8b5cf6' },
  { id: 'Cargo', name: 'Cargo Assist', icon: '📦', color: '#6366f1' },
];

export const STATUS_COLORS = {
  'available': '#10b981',
  'on-mission': '#f59e0b',
  'standby': '#6366f1',
  'offline': '#6b7280',
  'pending': '#f59e0b',
  'assigned': '#3b82f6',
  'in-progress': '#8b5cf6',
  'completed': '#10b981',
  'cancelled': '#ef4444',
};

export const PRIORITY_COLORS = {
  'critical': '#ef4444',
  'high': '#f97316',
  'medium': '#f59e0b',
  'low': '#10b981',
};

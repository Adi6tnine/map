import { Activity, Clock, AlertTriangle, Zap, Box } from 'lucide-react';

export function getStatusConfig(status) {
  switch (status) {
    case 'active':
      return { color: '#10B981', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: Activity, label: 'Active' };
    case 'idle':
      return { color: '#6B7280', bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200', icon: Clock, label: 'Idle' };
    case 'warning':
      return { color: '#F59E0B', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: AlertTriangle, label: 'Warning' };
    case 'critical':
      return { color: '#EF4444', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: Zap, label: 'Critical' };
    default:
      return { color: '#6B7280', bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200', icon: Box, label: 'Unknown' };
  }
}

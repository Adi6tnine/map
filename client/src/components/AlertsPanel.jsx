import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function AlertsPanel({ alerts }) {
  if (!alerts.length) return null;

  return (
    <div className="mb-6">
      <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
        System Alerts
        <span className="bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-[10px]">
          {alerts.length}
        </span>
      </h3>
      <div className="space-y-2">
        {alerts.map((alert) => {
          const isCritical = alert.status === 'critical';
          return (
            <div
              key={`alert-${alert.id}`}
              className={`flex items-start gap-3 p-3 rounded-md border ${
                isCritical ? 'bg-red-50/50 border-red-100' : 'bg-amber-50/50 border-amber-100'
              }`}
            >
              <AlertTriangle
                className={`w-4 h-4 mt-0.5 shrink-0 ${isCritical ? 'text-red-500' : 'text-amber-500'}`}
              />
              <div>
                <div className={`text-sm font-medium ${isCritical ? 'text-red-800' : 'text-amber-800'}`}>
                  {alert.id}{' '}
                  <span className="font-normal opacity-70">— {alert.type}</span>
                </div>
                <div className={`text-xs mt-0.5 ${isCritical ? 'text-red-600' : 'text-amber-600'}`}>
                  {isCritical
                    ? `Battery Critical (${alert.battery.toFixed(0)}%)`
                    : `Idle warning (>15 mins)`}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

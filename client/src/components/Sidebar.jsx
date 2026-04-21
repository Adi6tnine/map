import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import AlertsPanel from './AlertsPanel';
import DeviceCard from './DeviceCard';

export default function Sidebar({ devices, focusedDevice, setFocusedDevice }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredDevice, setHoveredDevice] = useState(null);

  const totalDevices = devices.length;
  const activeDevices = devices.filter((d) => d.status === 'active' || d.status === 'idle').length;
  const efficiency = totalDevices ? Math.round((activeDevices / totalDevices) * 100) : 0;
  const alerts = devices.filter((d) => d.status === 'critical' || d.status === 'warning');

  const filteredDevices = devices.filter(
    (d) =>
      d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className="w-[420px] bg-white border-l border-gray-200 flex flex-col shrink-0 z-10 shadow-[-4px_0_24px_rgba(0,0,0,0.02)]">
      {/* KPIs + Search */}
      <div className="p-5 border-b border-gray-100 bg-gray-50/50">
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block mb-1">Total</span>
            <span className="text-xl font-semibold text-gray-900">{totalDevices}</span>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block mb-1">Active</span>
            <span className="text-xl font-semibold text-emerald-600">{activeDevices}</span>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block mb-1">Efficiency</span>
            <span className="text-xl font-semibold text-gray-900">{efficiency}%</span>
          </div>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search equipment ID or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow"
          />
        </div>
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto p-5">
        <AlertsPanel alerts={alerts} />

        <div>
          <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Equipment Directory
          </h3>
          <div className="space-y-2">
            <AnimatePresence>
              {filteredDevices.map((device) => (
                <DeviceCard
                  key={device.id}
                  device={device}
                  isFocused={focusedDevice === device.id}
                  onSelect={(id) => setFocusedDevice(focusedDevice === id ? null : id)}
                  onHover={setHoveredDevice}
                  onHoverEnd={() => setHoveredDevice(null)}
                />
              ))}
            </AnimatePresence>

            {filteredDevices.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">
                No equipment found matching "{searchQuery}"
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}

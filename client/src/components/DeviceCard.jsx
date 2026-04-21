import React from 'react';
import { motion } from 'framer-motion';
import { Box, MapPin, Battery, BatteryMedium, BatteryWarning, Smartphone, Cpu } from 'lucide-react';
import { getStatusConfig } from '../utils/statusConfig';

function SourceBadge({ source }) {
  if (source === 'mobile')
    return <span className="text-[10px] font-medium text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-full flex items-center gap-1"><Smartphone className="w-2.5 h-2.5" />Live GPS</span>;
  if (source === 'esp32')
    return <span className="text-[10px] font-medium text-purple-600 bg-purple-50 border border-purple-100 px-1.5 py-0.5 rounded-full flex items-center gap-1"><Cpu className="w-2.5 h-2.5" />ESP32</span>;
  return null;
}

function BatteryIcon({ level }) {
  if (level > 60) return <Battery className="w-4 h-4 text-emerald-500" />;
  if (level > 20) return <BatteryMedium className="w-4 h-4 text-amber-500" />;
  return <BatteryWarning className="w-4 h-4 text-red-500" />;
}

export default function DeviceCard({ device, isFocused, onSelect, onHover, onHoverEnd }) {
  const config = getStatusConfig(device.status);
  const StatusIcon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      key={device.id}
      onClick={() => onSelect(device.id)}
      onMouseEnter={() => onHover(device.id)}
      onMouseLeave={onHoverEnd}
      className={`group relative p-4 rounded-xl border transition-all duration-200 cursor-pointer bg-white ${
        isFocused
          ? 'border-blue-500 ring-1 ring-blue-500 shadow-md'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      {/* Header row */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gray-50 border border-gray-100">
            <Box className="w-4 h-4 text-gray-500" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900">{device.id}</h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="text-xs text-gray-500">{device.type}</p>
              <SourceBadge source={device.source} />
            </div>
          </div>
        </div>

        {/* Status badge */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${config.bg} ${config.text} ${config.border}`}
        >
          <StatusIcon className="w-3 h-3" />
          {config.label}
        </div>
      </div>

      {/* Footer row */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
        <div className="flex items-center gap-1.5 text-gray-500">
          <MapPin className="w-3.5 h-3.5" />
          <span className="text-xs font-mono">
            {device.lat.toFixed(4)}, {device.lng.toFixed(4)}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <BatteryIcon level={device.battery} />
          <span className={`text-xs font-medium ${device.battery < 20 ? 'text-red-600' : 'text-gray-600'}`}>
            {device.battery.toFixed(0)}%
          </span>
        </div>
      </div>
    </motion.div>
  );
}

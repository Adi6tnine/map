import React from 'react';
import { Box, Bell, Settings, UserCircle } from 'lucide-react';

export default function Navbar({ connected }) {
  return (
    <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-6 shrink-0 z-20">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center shadow-sm">
          <Box className="text-white w-5 h-5" />
        </div>
        <span className="font-semibold text-[15px] tracking-tight">Smart Equipment Monitoring</span>
      </div>

      <div className="flex items-center gap-6">
        {/* Live / Connecting indicator */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${connected ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
          <span className={`text-xs font-medium ${connected ? 'text-emerald-700' : 'text-amber-700'}`}>
            {connected ? 'System Active' : 'Connecting…'}
          </span>
        </div>

        <div className="w-px h-6 bg-gray-200" />

        <div className="flex items-center gap-4 text-gray-500">
          <Bell className="w-5 h-5 cursor-pointer hover:text-gray-900 transition-colors" />
          <Settings className="w-5 h-5 cursor-pointer hover:text-gray-900 transition-colors" />
          <UserCircle className="w-6 h-6 cursor-pointer text-gray-400 hover:text-gray-600 transition-colors" />
        </div>
      </div>
    </header>
  );
}

import React, { useState, useEffect } from 'react';
import { useDevices } from './hooks/useDevices';
import { injectStyles } from './utils/injectStyles';
import Navbar from './components/Navbar';
import MapView from './components/MapView';
import Sidebar from './components/Sidebar';

export default function App() {
  const { devices, loading, error, connected } = useDevices();
  const [focusedDevice, setFocusedDevice] = useState(null);

  useEffect(() => {
    injectStyles();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-500 font-medium">Connecting to server…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-500 font-medium mb-1">Failed to connect</p>
          <p className="text-sm text-gray-400">{error}</p>
          <p className="text-xs text-gray-400 mt-2">Make sure the server is running on port 4000</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-white text-gray-900 font-sans overflow-hidden">
      <Navbar connected={connected} />
      <main className="flex-1 flex overflow-hidden">
        <MapView
          devices={devices}
          focusedDevice={focusedDevice}
          setFocusedDevice={setFocusedDevice}
        />
        <Sidebar
          devices={devices}
          focusedDevice={focusedDevice}
          setFocusedDevice={setFocusedDevice}
        />
      </main>
    </div>
  );
}

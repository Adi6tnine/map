import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getStatusConfig } from '../utils/statusConfig';

// Smooth marker movement using CSS transitions
function buildMarkerHtml(device, isFocused, isHovered) {
  const config = getStatusConfig(device.status);
  const scale  = isFocused ? 1.5 : isHovered ? 1.2 : 1;
  const shadow  = isFocused
    ? '0 0 0 5px rgba(37,99,235,0.3), 0 2px 8px rgba(0,0,0,0.3)'
    : '0 2px 6px rgba(0,0,0,0.25)';

  if (device.source === 'mobile' || device.source === 'esp32') {
    return `
      <div style="position:relative;width:24px;height:24px;transform:scale(${scale});transition:transform 0.2s ease;">
        <div style="
          position:absolute;inset:0;border-radius:50%;
          background:rgba(37,99,235,0.15);
          animation:ripple 2s ease-out infinite;
        "></div>
        <div style="
          position:absolute;inset:4px;border-radius:50%;
          background:#2563EB;border:2.5px solid #fff;
          box-shadow:${shadow};
        "></div>
      </div>
      <style>
        @keyframes ripple {
          0%   { transform:scale(0.8); opacity:0.8; }
          100% { transform:scale(2.2); opacity:0; }
        }
      </style>`;
  }

  return `
    <div style="
      width:14px;height:14px;border-radius:50%;
      background:${config.color};border:2.5px solid #fff;
      box-shadow:${shadow};
      transform:scale(${scale});transition:transform 0.2s ease;
    "></div>`;
}

export default function MapView({ devices, focusedDevice, setFocusedDevice }) {
  const mapRef      = useRef(null);
  const markersRef  = useRef({});
  const pathsRef    = useRef({});       // polyline trails for mobile devices
  const coordsRef   = useRef({});       // history of coords per device
  const [mapReady, setMapReady]     = useState(false);
  const [hoveredDevice, setHoveredDevice] = useState(null);
  const autoFollowRef = useRef(true);   // auto-follow mobile device until user pans

  // Load Leaflet once
  useEffect(() => {
    if (window.L) { setMapReady(true); return; }
    const link = document.createElement('link');
    link.rel  = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => setMapReady(true);
    document.head.appendChild(script);
  }, []);

  // Init map — use real OpenStreetMap tiles
  useEffect(() => {
    if (!mapReady) return;
    const container = document.getElementById('leaflet-map');
    if (container._leaflet_id) container._leaflet_id = null;

    const map = window.L.map('leaflet-map', {
      zoomControl: false,
      attributionControl: true,
    }).setView([20.5937, 78.9629], 5); // India default — will jump to real GPS on first ping

    // Real OpenStreetMap tiles
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Custom zoom control position
    window.L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Stop auto-follow when user manually pans
    map.on('dragstart', () => { autoFollowRef.current = false; });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current  = null;
      markersRef.current = {};
      pathsRef.current   = {};
      coordsRef.current  = {};
    };
  }, [mapReady]);

  // Sync markers + trails on every device update
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;

    devices.forEach((device) => {
      const isFocused = focusedDevice === device.id;
      const isHovered = hoveredDevice === device.id;
      const config    = getStatusConfig(device.status);
      const isReal    = device.source === 'mobile' || device.source === 'esp32';

      // ── Marker ──────────────────────────────────────────
      const icon = window.L.divIcon({
        className: 'custom-leaflet-icon',
        html: buildMarkerHtml(device, isFocused, isHovered),
        iconSize:   [24, 24],
        iconAnchor: [12, 12],
      });

      let marker = markersRef.current[device.id];
      if (!marker) {
        marker = window.L.marker([device.lat, device.lng], { icon, zIndexOffset: isReal ? 1000 : 0 })
          .addTo(map);
        marker.on('click',     () => setFocusedDevice(device.id));
        marker.on('mouseover', () => setHoveredDevice(device.id));
        marker.on('mouseout',  () => setHoveredDevice(null));
        markersRef.current[device.id] = marker;
      } else {
        marker.setLatLng([device.lat, device.lng]);
        marker.setIcon(icon);
      }

      // ── Popup ────────────────────────────────────────────
      if (isFocused) {
        const srcLabel = device.source === 'mobile' ? '📱 Mobile GPS'
                       : device.source === 'esp32'  ? '🔌 ESP32'
                       : '🤖 Simulated';
        marker.bindPopup(`
          <div style="font-family:system-ui,sans-serif;min-width:170px;padding:2px 0;">
            <div style="font-weight:700;font-size:14px;color:#111;">${device.id}</div>
            <div style="font-size:12px;color:#666;margin:2px 0 8px;">${device.type} · ${srcLabel}</div>
            <div style="display:flex;justify-content:space-between;border-top:1px solid #eee;padding-top:8px;">
              <span style="font-size:12px;font-weight:600;color:${config.color};">${config.label}</span>
              <span style="font-size:12px;color:#666;">🔋 ${device.battery.toFixed(0)}%</span>
            </div>
            <div style="font-size:11px;color:#999;margin-top:6px;font-family:monospace;">
              ${device.lat.toFixed(5)}, ${device.lng.toFixed(5)}
            </div>
          </div>
        `, { offset: [0, -8] }).openPopup();
      } else {
        marker.closePopup();
        marker.unbindPopup();
      }

      // ── Trail (only for real GPS devices) ───────────────
      if (isReal) {
        if (!coordsRef.current[device.id]) coordsRef.current[device.id] = [];
        const history = coordsRef.current[device.id];
        const last    = history[history.length - 1];

        // Only push if moved more than ~1m
        if (!last || Math.abs(last[0] - device.lat) > 0.00001 || Math.abs(last[1] - device.lng) > 0.00001) {
          history.push([device.lat, device.lng]);
          if (history.length > 120) history.shift(); // keep last 120 points
        }

        if (pathsRef.current[device.id]) {
          pathsRef.current[device.id].setLatLngs(history);
        } else {
          pathsRef.current[device.id] = window.L.polyline(history, {
            color: '#2563EB',
            weight: 3,
            opacity: 0.6,
            dashArray: '6, 4',
            lineJoin: 'round',
          }).addTo(map);
        }
      }
    });

    // ── Auto-follow real device ──────────────────────────
    const realDevice = devices.find(d => d.source === 'mobile' || d.source === 'esp32');
    if (realDevice && autoFollowRef.current && !focusedDevice) {
      map.setView([realDevice.lat, realDevice.lng], Math.max(map.getZoom(), 15), {
        animate: true,
        duration: 0.8,
      });
    }

    // ── Fly to focused device ────────────────────────────
    if (focusedDevice) {
      const d = devices.find(x => x.id === focusedDevice);
      if (d) map.flyTo([d.lat, d.lng], 17, { duration: 1, easeLinearity: 0.3 });
    }
  }, [devices, mapReady, focusedDevice, hoveredDevice]);

  return (
    <section className="flex-1 relative">
      <div id="leaflet-map" className="w-full h-full" />

      {/* Re-center button — appears after user pans away */}
      <button
        onClick={() => { autoFollowRef.current = true; }}
        className="absolute top-4 right-4 z-[1000] bg-white border border-gray-200 shadow-md rounded-lg px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 transition-colors"
      >
        <span>📍</span> Re-center
      </button>

      {/* Legend */}
      <div className="absolute bottom-10 left-4 z-[1000] bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl shadow-md px-3 py-2.5 flex flex-col gap-1.5 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-600 ring-2 ring-blue-200" />
          <span>Live GPS (real)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-400" />
          <span>Simulated</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 border-t-2 border-dashed border-blue-500" />
          <span>GPS trail</span>
        </div>
      </div>

      <AnimatePresence>
        {focusedDevice && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={() => setFocusedDevice(null)}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[1000] px-4 py-2 bg-white border border-gray-200 shadow-lg rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
          >
            ✕ Clear Selection
          </motion.button>
        )}
      </AnimatePresence>
    </section>
  );
}

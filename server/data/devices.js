// In-memory device store — seeded once on startup

const TYPES = ['Excavator', 'Drone', 'Transport', 'Harvester', 'Sensor Node'];
const BASE_LAT = 33.74;
const BASE_LNG = -118.26;

function createInitialDevices() {
  return Array.from({ length: 12 }, (_, i) => ({
    id: `EQ-${String(i + 1).padStart(3, '0')}`,
    type: TYPES[i % TYPES.length],
    lat: BASE_LAT + (Math.random() - 0.5) * 0.05,
    lng: BASE_LNG + (Math.random() - 0.5) * 0.05,
    battery: Math.floor(10 + Math.random() * 90),
    status: 'idle',
    isMoving: Math.random() > 0.3,
    lastActive: Date.now() - Math.floor(Math.random() * 5000),
    source: 'simulated', // 'simulated' | 'mobile' | 'esp32'
  }));
}

// Singleton store
const devices = createInitialDevices();

/**
 * Upsert a device by id.
 * If it doesn't exist yet (e.g. first ping from mobile/ESP32), create it.
 */
function upsertDevice(id, fields) {
  const idx = devices.findIndex(d => d.id === id);
  if (idx !== -1) {
    Object.assign(devices[idx], fields, { lastActive: Date.now() });
    return devices[idx];
  }
  // New device (mobile or ESP32 not in initial list)
  const newDevice = {
    id,
    type: fields.type || 'Mobile',
    lat: fields.lat || BASE_LAT,
    lng: fields.lng || BASE_LNG,
    battery: fields.battery ?? 100,
    status: 'active',
    isMoving: true,
    lastActive: Date.now(),
    source: fields.source || 'mobile',
    ...fields,
  };
  devices.push(newDevice);
  return newDevice;
}

module.exports = { devices, upsertDevice };

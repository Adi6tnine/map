// In-memory device store — starts empty, populated by real devices only

const devices = [];

/**
 * Upsert a device by id.
 * Creates it on first ping from mobile/ESP32.
 */
function upsertDevice(id, fields) {
  const idx = devices.findIndex(d => d.id === id);
  if (idx !== -1) {
    Object.assign(devices[idx], fields, { lastActive: Date.now() });
    return devices[idx];
  }
  const newDevice = {
    id,
    type: fields.type || 'Mobile',
    lat: fields.lat,
    lng: fields.lng,
    battery: fields.battery ?? null,
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

const { devices } = require('../data/devices');

function deriveStatus(battery, idleSeconds, isMoving) {
  if (battery < 20) return 'critical';
  if (idleSeconds > 15 && battery > 0) return 'warning';
  if (isMoving && battery > 0) return 'active';
  return 'idle';
}

function tick() {
  const now = Date.now();

  devices.forEach((device) => {
    // Skip real devices — mobile GPS and ESP32 manage their own state
    if (device.source === 'mobile' || device.source === 'esp32') return;

    device.battery = Math.max(0, device.battery - Math.random() * 0.15);

    if (Math.random() > 0.85) device.isMoving = !device.isMoving;

    if (device.isMoving && device.battery > 0) {
      device.lat += (Math.random() - 0.5) * 0.0003;
      device.lng += (Math.random() - 0.5) * 0.0003;
      device.lastActive = now;
    }

    const idleSeconds = (now - device.lastActive) / 1000;
    device.status = deriveStatus(device.battery, idleSeconds, device.isMoving);
  });

  return devices;
}

function startSimulation(intervalMs, onTick) {
  const timer = setInterval(() => onTick(tick()), intervalMs);
  return () => clearInterval(timer);
}

module.exports = { startSimulation };

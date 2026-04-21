const { devices } = require('../data/devices');

function deriveStatus(battery, idleSeconds) {
  if (battery !== null && battery < 20) return 'critical';
  if (idleSeconds > 30) return 'idle';
  return 'active';
}

function tick() {
  const now = Date.now();
  devices.forEach((device) => {
    const idleSeconds = (now - device.lastActive) / 1000;
    device.status = deriveStatus(device.battery, idleSeconds);
  });
  return devices;
}

function startSimulation(intervalMs, onTick) {
  const timer = setInterval(() => onTick(tick()), intervalMs);
  return () => clearInterval(timer);
}

module.exports = { startSimulation };

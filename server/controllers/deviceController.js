const { devices } = require('../data/devices');

// GET /devices
function getAllDevices(req, res) {
  res.json(devices);
}

// GET /devices/:id
function getDeviceById(req, res) {
  const device = devices.find(d => d.id === req.params.id);
  if (!device) return res.status(404).json({ error: 'Device not found' });
  res.json(device);
}

// POST /devices/update  — accepts partial updates for one device
function updateDevice(req, res) {
  const { id, ...fields } = req.body;
  if (!id) return res.status(400).json({ error: 'id is required' });

  const idx = devices.findIndex(d => d.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Device not found' });

  Object.assign(devices[idx], fields);
  res.json(devices[idx]);
}

module.exports = { getAllDevices, getDeviceById, updateDevice };

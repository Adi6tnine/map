const { upsertDevice, devices } = require('../data/devices');

// POST /location — called by mobile GPS tracker
function postLocation(req, res) {
  const { id, lat, lng, battery, accuracy, speed, source, type } = req.body;

  if (!id || lat == null || lng == null) {
    return res.status(400).json({ error: 'id, lat, lng are required' });
  }

  const device = upsertDevice(id, {
    lat:      parseFloat(lat),
    lng:      parseFloat(lng),
    battery:  battery  != null ? parseFloat(battery)  : undefined,
    accuracy: accuracy != null ? parseFloat(accuracy) : undefined,
    speed:    speed    != null ? parseFloat(speed)    : undefined,
    isMoving: true,
    status:   'active',
    source:   source || 'mobile',
    type:     type   || 'Transport',
  });

  req.io.emit('devices:update', devices);
  res.json({ ok: true, device });
}

// POST /status — called by ESP32
function postStatus(req, res) {
  const { id, battery, status, type, lat, lng } = req.body;

  if (!id) return res.status(400).json({ error: 'id is required' });

  const device = upsertDevice(id, {
    ...(battery != null && { battery: parseFloat(battery) }),
    ...(status  && { status }),
    ...(type    && { type }),
    ...(lat     != null && { lat: parseFloat(lat) }),
    ...(lng     != null && { lng: parseFloat(lng) }),
    source: 'esp32',
  });

  req.io.emit('devices:update', devices);
  res.json({ ok: true, device });
}

module.exports = { postLocation, postStatus };

const { Router } = require('express');
const { getAllDevices, getDeviceById, updateDevice } = require('../controllers/deviceController');

const router = Router();

router.get('/', getAllDevices);
router.get('/:id', getDeviceById);
router.post('/update', updateDevice);

module.exports = router;

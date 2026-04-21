const { Router } = require('express');
const { postLocation, postStatus } = require('../controllers/trackingController');

const router = Router();

router.post('/location', postLocation);
router.post('/status', postStatus);

module.exports = router;

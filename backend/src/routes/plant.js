const express = require('express');
const router = express.Router();
const multer = require('multer');
const { identifyPlant, getPlantInfo, searchPlantByName } = require('../controllers/plantController');

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Routes for plant operations
router.post('/identify', upload.single('image'), identifyPlant);
router.post('/info', getPlantInfo);
router.post('/search', searchPlantByName);

module.exports = router;
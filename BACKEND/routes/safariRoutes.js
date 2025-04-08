const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const safariController = require('../controllers/safariController');
const Safari = require('../models/Safari'); // Add this import

// Configure multer for storing safari images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads/safaris';
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const safariName = req.body.title ? req.body.title.toLowerCase().replace(/\s+/g, '-') : 'safari';
    cb(null, `safari-${safariName}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// Configure file filter for images only
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Test route to check if safari routes are working
router.get('/test', (req, res) => {
  res.status(200).json({ message: 'Safari routes are working!' });
});

// Add this specific route for fetching all safaris (make it appear before the parameterized routes)
router.get('/all', async (req, res) => {
  try {
    console.log('Fetching all safaris for admin dashboard');
    const safaris = await Safari.find()
      .populate('guideId', 'name email')
      .lean();
    
    console.log(`Found ${safaris.length} safaris`);
    res.status(200).json(safaris);
  } catch (error) {
    console.error('Error fetching all safaris:', error);
    res.status(500).json({ error: 'Failed to fetch safaris' });
  }
});

// Routes - make sure specific routes come before parameterized routes
router.post('/', auth, authorize(['guide']), upload.array('images', 5), safariController.createSafari);
router.get('/guide', auth, authorize(['guide']), safariController.getGuideSafaris);
router.get('/', safariController.getAllSafaris); // Public endpoint
router.get('/:id', safariController.getSafariById); // Public endpoint
router.put('/:id', auth, authorize(['guide']), upload.array('images', 5), safariController.updateSafari);
router.delete('/:id', auth, authorize(['guide']), safariController.deleteSafari);
router.patch('/:id/status', auth, authorize(['admin']), safariController.updateSafariStatus);

// Admin: Approve safari package
router.put('/:id/approve', auth, authorize(['admin']), safariController.approveSafari);

// Admin: Reject safari package
router.put('/:id/reject', auth, authorize(['admin']), safariController.rejectSafari);

module.exports = router;

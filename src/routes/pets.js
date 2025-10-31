const express = require('express');
const router = express.Router();

const { listPets, getPet, createPet, updatePet, deletePet, uploadPhotos } = require('../controllers/petController');
const { requireAuth } = require('../middlewares/auth');
const { allowRoles } = require('../middlewares/roles');
const { petCreateValidator } = require('../validators/validators');

const multer = require('multer');
const path = require('path');
const uploadDir = path.join(__dirname, '..', '..', 'uploads');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Public listing & details
router.get('/', listPets);
router.get('/:id', getPet);

// Admin routes
router.post('/', requireAuth, allowRoles('admin'), upload.array('photos', 6), petCreateValidator, createPet);
router.put('/:id', requireAuth, allowRoles('admin'),  upload.array('photos', 6),updatePet);
router.delete('/:id', requireAuth, allowRoles('admin'), deletePet);

// Upload photos for existing pet
router.post('/:id/photos', requireAuth, allowRoles('admin'), uploadPhotos);

module.exports = router;

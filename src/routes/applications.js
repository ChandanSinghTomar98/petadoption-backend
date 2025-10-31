const express = require('express');
const router = express.Router();
const { apply, myApplications, listAll, updateStatus } = require('../controllers/applicationController');
const { requireAuth } = require('../middlewares/auth');
const { allowRoles } = require('../middlewares/roles');
const { applyValidator } = require('../validators/validators');

// Users apply and view own
router.post('/', requireAuth, allowRoles('user','admin'), applyValidator, apply);
router.get('/me', requireAuth, allowRoles('user','admin'), myApplications);

// Admin routes
router.get('/', requireAuth, allowRoles('admin'), listAll);
router.patch('/:id/status', requireAuth, allowRoles('admin'), updateStatus);

module.exports = router;

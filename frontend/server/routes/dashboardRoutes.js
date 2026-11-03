const express = require('express');
const router = express.Router();

const { getStudentDashboardStats, getAdminDashboardStats } = require('../controllers/dashboardController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

router.use(authenticate);

// GET /api/dashboard/stats
router.get('/stats', getStudentDashboardStats);

// GET /api/dashboard/admin-stats
router.get('/admin-stats', authorizeRoles('ADMIN'), getAdminDashboardStats);

module.exports = router;

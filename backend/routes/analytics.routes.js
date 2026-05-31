import express from 'express';
import {
  getDashboardAnalytics,
  getSkillAnalytics,
  getProductivityTrends,
  getProjectAnalytics
} from '../controllers/analytics.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/dashboard', getDashboardAnalytics);
router.get('/skills', getSkillAnalytics);
router.get('/productivity', getProductivityTrends);
router.get('/projects', getProjectAnalytics);

export default router;

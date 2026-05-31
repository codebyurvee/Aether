import express from 'express';
import { updateProfile, updatePreferences } from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.put('/profile', updateProfile);
router.put('/preferences', updatePreferences);

export default router;

import express from 'express';
import {
  getBrandProfile,
  updateBrandProfile,
  addLinkedInPost,
  addTweet
} from '../controllers/brand.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getBrandProfile)
  .put(updateBrandProfile);

router.post('/linkedin/posts', addLinkedInPost);
router.post('/twitter/tweets', addTweet);

export default router;

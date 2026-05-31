import express from 'express';
import {
  getResearchEntries,
  getResearchEntry,
  createResearchEntry,
  updateResearchEntry,
  deleteResearchEntry
} from '../controllers/research.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getResearchEntries)
  .post(createResearchEntry);

router.route('/:id')
  .get(getResearchEntry)
  .put(updateResearchEntry)
  .delete(deleteResearchEntry);

export default router;

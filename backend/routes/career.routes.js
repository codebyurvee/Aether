import express from 'express';
import {
  getCareerEntries,
  getCareerEntry,
  createCareerEntry,
  updateCareerEntry,
  deleteCareerEntry
} from '../controllers/career.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getCareerEntries)
  .post(createCareerEntry);

router.route('/:id')
  .get(getCareerEntry)
  .put(updateCareerEntry)
  .delete(deleteCareerEntry);

export default router;

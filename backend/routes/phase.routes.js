import express from 'express';
import {
  getPhases,
  getPhase,
  createPhase,
  updatePhase,
  deletePhase,
  initializePhases
} from '../controllers/phase.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getPhases)
  .post(createPhase);

router.post('/initialize', initializePhases);

router.route('/:id')
  .get(getPhase)
  .put(updatePhase)
  .delete(deletePhase);

export default router;

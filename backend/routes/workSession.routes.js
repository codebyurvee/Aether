import express from 'express';
import {
  getWorkSessions,
  getWorkSession,
  createWorkSession,
  updateWorkSession,
  deleteWorkSession
} from '../controllers/workSession.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getWorkSessions)
  .post(createWorkSession);

router.route('/:id')
  .get(getWorkSession)
  .put(updateWorkSession)
  .delete(deleteWorkSession);

export default router;

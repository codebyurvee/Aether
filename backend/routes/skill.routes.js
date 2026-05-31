import express from 'express';
import {
  getSkills,
  getSkill,
  createSkill,
  updateSkill,
  deleteSkill,
  initializeSkills
} from '../controllers/skill.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getSkills)
  .post(createSkill);

router.post('/initialize', initializeSkills);

router.route('/:id')
  .get(getSkill)
  .put(updateSkill)
  .delete(deleteSkill);

export default router;

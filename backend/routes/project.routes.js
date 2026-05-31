import express from 'express';
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addSubtask,
  updateSubtask,
  deleteSubtask
} from '../controllers/project.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getProjects)
  .post(createProject);

router.route('/:id')
  .get(getProject)
  .put(updateProject)
  .delete(deleteProject);

router.route('/:id/subtasks')
  .post(addSubtask);

router.route('/:id/subtasks/:subtaskId')
  .put(updateSubtask)
  .delete(deleteSubtask);

export default router;

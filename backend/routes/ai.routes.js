import express from 'express'
import {
  chat,
  summarizePaper,
  generateProjectIdeas,
  generateStudyPlan,
  analyzeProgress,
  explainConcept
} from '../controllers/ai.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const router = express.Router()

// All AI routes are protected
router.use(protect)

router.post('/chat', chat)
router.post('/summarize-paper', summarizePaper)
router.post('/project-ideas', generateProjectIdeas)
router.post('/study-plan', generateStudyPlan)
router.post('/analyze-progress', analyzeProgress)
router.post('/explain', explainConcept)

export default router

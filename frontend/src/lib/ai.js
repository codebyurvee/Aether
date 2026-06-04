import api from './axios'

export const aiAPI = {
  chat: (message, history) =>
    api.post('/ai/chat', { message, history }),

  summarizePaper: (title, content, url) =>
    api.post('/ai/summarize-paper', { title, content, url }),

  generateProjectIdeas: (skills, phase, interests) =>
    api.post('/ai/project-ideas', { skills, phase, interests }),

  generateStudyPlan: (skills, phase, hoursPerDay, goals) =>
    api.post('/ai/study-plan', { skills, phase, hoursPerDay, goals }),

  analyzeProgress: (data) =>
    api.post('/ai/analyze-progress', data),

  explainConcept: (concept, level) =>
    api.post('/ai/explain', { concept, level })
}

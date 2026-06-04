import { getModel, AETHER_SYSTEM_PROMPT } from '../config/gemini.js'

// ─── Chat with AI Mentor ────────────────────────────────────────────────────
// @route POST /api/ai/chat
export const chat = async (req, res, next) => {
  try {
    const { message, history = [] } = req.body

    if (!message?.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' })
    }

    const model = getModel()

    // Build chat history for context
    const chatHistory = [
      {
        role: 'user',
        parts: [{ text: AETHER_SYSTEM_PROMPT + '\n\nUser message: ' + message }]
      },
      ...history.slice(-10).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }))
    ]

    const chat = model.startChat({
      history: chatHistory.slice(0, -1),
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.7,
      }
    })

    const result = await chat.sendMessage(message)
    const response = result.response.text()

    res.json({
      success: true,
      data: {
        message: response,
        role: 'assistant'
      }
    })
  } catch (error) {
    if (error.message === 'GEMINI_API_KEY is not configured') {
      return res.status(503).json({
        success: false,
        message: 'AI service not configured. Please add GEMINI_API_KEY.'
      })
    }
    next(error)
  }
}

// ─── Summarize Research Paper ────────────────────────────────────────────────
// @route POST /api/ai/summarize-paper
export const summarizePaper = async (req, res, next) => {
  try {
    const { title, content, url } = req.body

    if (!title && !content) {
      return res.status(400).json({ success: false, message: 'Paper title or content is required' })
    }

    const model = getModel()

    const prompt = `You are an expert AI researcher. Summarize this research paper for an aspiring AI Engineer.

Paper Title: ${title || 'Unknown'}
${url ? `URL: ${url}` : ''}
${content ? `Content/Abstract: ${content}` : ''}

Provide a structured summary with:
1. **What it's about** (2-3 sentences)
2. **Key Contributions** (3-5 bullet points)
3. **Main Technique/Architecture** (brief explanation)
4. **Results/Performance** (key metrics if mentioned)
5. **Why it matters** for AI Engineers
6. **Implementation tip** (how to use or implement this)
7. **Related papers** to read next (2-3 suggestions)

Keep it concise and practical. Focus on what an AI Engineer learning this field needs to know.`

    const result = await model.generateContent(prompt)
    const summary = result.response.text()

    res.json({
      success: true,
      data: { summary }
    })
  } catch (error) {
    next(error)
  }
}

// ─── Generate Project Ideas ──────────────────────────────────────────────────
// @route POST /api/ai/project-ideas
export const generateProjectIdeas = async (req, res, next) => {
  try {
    const { skills = [], phase = 1, interests = '' } = req.body

    const model = getModel()

    const prompt = `You are an expert AI Engineering mentor. Generate project ideas for an aspiring AI Engineer.

Current Learning Phase: Phase ${phase} (${
  phase === 1 ? 'Foundation - Python, ML Basics' : 
  phase === 2 ? 'Core AI - Deep Learning, NLP, LLMs' : 
  'Advanced - Research, MLOps, Production AI'
})

Known Skills: ${skills.length > 0 ? skills.join(', ') : 'Python basics, some ML knowledge'}
Interests: ${interests || 'general AI/ML'}

Generate 5 project ideas in this exact JSON format:
[
  {
    "title": "Project Name",
    "description": "What it does in 2 sentences",
    "difficulty": "beginner|intermediate|advanced",
    "category": "ml|dl|nlp|cv|mlops|other",
    "technologies": ["Python", "PyTorch"],
    "estimatedTime": "2 weeks",
    "learningOutcome": "What skills you'll gain",
    "steps": ["Step 1", "Step 2", "Step 3"]
  }
]

Return ONLY the JSON array, no other text.`

    const result = await model.generateContent(prompt)
    let text = result.response.text()

    // Clean JSON response
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    let ideas
    try {
      ideas = JSON.parse(text)
    } catch {
      ideas = [{ title: 'Parse Error', description: text, difficulty: 'intermediate', category: 'ml', technologies: [], estimatedTime: 'varies', learningOutcome: '', steps: [] }]
    }

    res.json({ success: true, data: { ideas } })
  } catch (error) {
    next(error)
  }
}

// ─── Generate Study Plan ─────────────────────────────────────────────────────
// @route POST /api/ai/study-plan
export const generateStudyPlan = async (req, res, next) => {
  try {
    const { skills = [], phase = 1, hoursPerDay = 4, goals = '' } = req.body

    const model = getModel()

    const prompt = `Create a personalized weekly study plan for an AI Engineer student.

Phase: ${phase}/3
Hours available per day: ${hoursPerDay}
Current skills: ${skills.join(', ') || 'Python basics'}
Goals: ${goals || 'Become an AI Engineer'}

Create a 7-day study plan in JSON format:
{
  "weekTheme": "Week focus topic",
  "dailyGoal": "What to achieve each day",
  "days": [
    {
      "day": "Monday",
      "focus": "Topic",
      "tasks": [
        { "time": "2h", "task": "What to do", "resource": "Resource name/link" }
      ],
      "milestone": "What you'll achieve"
    }
  ],
  "weeklyProject": "Mini project to build this week",
  "resources": ["Resource 1", "Resource 2"]
}

Return ONLY valid JSON, no other text.`

    const result = await model.generateContent(prompt)
    let text = result.response.text()
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    let plan
    try {
      plan = JSON.parse(text)
    } catch {
      plan = { weekTheme: 'Error parsing plan', days: [], resources: [] }
    }

    res.json({ success: true, data: { plan } })
  } catch (error) {
    next(error)
  }
}

// ─── Analyze Progress ────────────────────────────────────────────────────────
// @route POST /api/ai/analyze-progress
export const analyzeProgress = async (req, res, next) => {
  try {
    const { skills = [], projects = [], weeklyHours = 0, streak = 0, aiScore = 0, phase = 1 } = req.body

    const model = getModel()

    const prompt = `Analyze this AI Engineer student's progress and provide actionable feedback.

AI Readiness Score: ${aiScore}/100
Current Phase: ${phase}/3
Weekly Coding Hours: ${weeklyHours}
Current Streak: ${streak} days
Projects Built: ${projects.length}

Skills Status:
${skills.slice(0, 10).map(s => `- ${s.name}: ${s.progress}% (${s.masteryLevel})`).join('\n')}

Provide analysis in JSON format:
{
  "overallAssessment": "2-3 sentence overall assessment",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["area to improve 1", "area to improve 2"],
  "nextSteps": ["specific action 1", "specific action 2", "specific action 3"],
  "weeklyGoal": "One specific goal for this week",
  "motivationalMessage": "Encouraging message",
  "estimatedTimeToJob": "Realistic estimate like '6-8 months' based on current pace"
}

Return ONLY valid JSON.`

    const result = await model.generateContent(prompt)
    let text = result.response.text()
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    let analysis
    try {
      analysis = JSON.parse(text)
    } catch {
      analysis = {
        overallAssessment: text,
        strengths: [],
        weaknesses: [],
        nextSteps: [],
        weeklyGoal: '',
        motivationalMessage: 'Keep going!',
        estimatedTimeToJob: 'Unknown'
      }
    }

    res.json({ success: true, data: { analysis } })
  } catch (error) {
    next(error)
  }
}

// ─── Explain Concept ─────────────────────────────────────────────────────────
// @route POST /api/ai/explain
export const explainConcept = async (req, res, next) => {
  try {
    const { concept, level = 'intermediate' } = req.body

    if (!concept?.trim()) {
      return res.status(400).json({ success: false, message: 'Concept is required' })
    }

    const model = getModel()

    const prompt = `Explain "${concept}" to an AI Engineer student at ${level} level.

Include:
1. **Simple Definition** (1-2 sentences, no jargon)
2. **How it Works** (step by step, with analogy if helpful)
3. **Code Example** (Python code snippet showing usage)
4. **When to Use It** (practical use cases)
5. **Common Mistakes** (what beginners get wrong)
6. **Interview Question** (one typical interview question about this topic with answer)

Keep it practical and focused on AI/ML engineering applications.`

    const result = await model.generateContent(prompt)
    const explanation = result.response.text()

    res.json({ success: true, data: { explanation } })
  } catch (error) {
    next(error)
  }
}

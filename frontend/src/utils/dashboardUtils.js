// Get Monday of current week
export function getWeekStart() {
  const now = new Date()
  const day = now.getDay() // 0 = Sunday
  const diff = now.getDate() - day + (day === 0 ? -6 : 1) // adjust to Monday
  const monday = new Date(now.setDate(diff))
  monday.setHours(0, 0, 0, 0)
  return monday
}

// Get Sunday of current week
export function getWeekEnd() {
  const start = getWeekStart()
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return end
}

// Check if a date is in current week (Mon–Sun)
export function isThisWeek(dateStr) {
  const date = new Date(dateStr)
  const start = getWeekStart()
  const end = getWeekEnd()
  return date >= start && date <= end
}

// Check if a date is today
export function isToday(dateStr) {
  const date = new Date(dateStr)
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

// Check if a date was yesterday
export function isYesterday(dateStr) {
  const date = new Date(dateStr)
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  )
}

// Calculate streak from activity log
export function calculateStreak(activityDates) {
  if (!activityDates || activityDates.length === 0) return 0

  // Get unique dates sorted descending
  const uniqueDates = [...new Set(
    activityDates.map(d => new Date(d).toDateString())
  )].sort((a, b) => new Date(b) - new Date(a))

  // If last activity is not today or yesterday, streak is 0
  const lastDate = new Date(uniqueDates[0])
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  lastDate.setHours(0, 0, 0, 0)

  const diffFromToday = (today - lastDate) / (1000 * 60 * 60 * 24)
  if (diffFromToday > 1) return 0

  let streak = 1
  for (let i = 0; i < uniqueDates.length - 1; i++) {
    const curr = new Date(uniqueDates[i])
    const prev = new Date(uniqueDates[i + 1])
    curr.setHours(0, 0, 0, 0)
    prev.setHours(0, 0, 0, 0)
    const diff = (curr - prev) / (1000 * 60 * 60 * 24)
    if (diff === 1) {
      streak++
    } else {
      break
    }
  }

  return streak
}

// Calculate AI Readiness Score (0–100)
export function calculateAIScore({ weeklyHours, weeklyPapers, completedProjects, streak }) {
  const maxHours = 40      // 40 hrs/week = 100%
  const maxPapers = 10     // 10 papers/week = 100%
  const maxProjects = 10   // 10 completed = 100%
  const maxStreak = 30     // 30 day streak = 100%

  const hoursScore = Math.min((weeklyHours / maxHours) * 100, 100) * 0.40
  const papersScore = Math.min((weeklyPapers / maxPapers) * 100, 100) * 0.25
  const projectsScore = Math.min((completedProjects / maxProjects) * 100, 100) * 0.20
  const streakScore = Math.min((streak / maxStreak) * 100, 100) * 0.15

  return Math.round(hoursScore + papersScore + projectsScore + streakScore)
}

// Format date to readable string
export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

// Get today's date string for input default
export function todayString() {
  return new Date().toISOString().split('T')[0]
}

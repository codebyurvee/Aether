import WorkSession from '../models/WorkSession.model.js';
import Project from '../models/Project.model.js';
import Skill from '../models/Skill.model.js';
import User from '../models/User.model.js';

// @desc    Get dashboard analytics
// @route   GET /api/analytics/dashboard
// @access  Private
export const getDashboardAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get weekly work sessions
    const weeklySessions = await WorkSession.find({
      userId,
      date: { $gte: weekAgo }
    });

    // Calculate weekly stats
    const weeklyStats = {
      hoursCoded: weeklySessions.reduce((sum, s) => sum + (s.codingHours || 0), 0),
      papersRead: weeklySessions.reduce((sum, s) => sum + (s.papersRead || 0), 0),
      focusSessions: weeklySessions.reduce((sum, s) => sum + (s.focusSessions || 0), 0),
      researchHours: weeklySessions.reduce((sum, s) => sum + (s.researchHours || 0), 0)
    };

    // Get active projects
    const activeProjects = await Project.countDocuments({
      userId,
      status: { $in: ['in-progress', 'testing'] }
    });

    // Get completed projects this month
    const completedProjects = await Project.countDocuments({
      userId,
      status: 'completed',
      completedAt: { $gte: monthAgo }
    });

    // Get skill progress
    const skills = await Skill.find({ userId });
    const avgSkillProgress = skills.length > 0
      ? skills.reduce((sum, s) => sum + s.progress, 0) / skills.length
      : 0;

    // Calculate AI Readiness Score
    const aiReadinessScore = calculateAIReadinessScore({
      avgSkillProgress,
      totalHoursCoded: req.user.totalHoursCoded,
      totalPapersRead: req.user.totalPapersRead,
      completedProjects: await Project.countDocuments({ userId, status: 'completed' }),
      streak: req.user.streak.current
    });

    res.json({
      success: true,
      data: {
        weeklyStats,
        activeProjects,
        completedProjects,
        avgSkillProgress: Math.round(avgSkillProgress),
        aiReadinessScore,
        streak: req.user.streak
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get skill analytics
// @route   GET /api/analytics/skills
// @access  Private
export const getSkillAnalytics = async (req, res, next) => {
  try {
    const skills = await Skill.find({ userId: req.user._id });

    // Group by category
    const byCategory = skills.reduce((acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = [];
      }
      acc[skill.category].push({
        name: skill.name,
        progress: skill.progress,
        totalHours: skill.totalHours,
        masteryLevel: skill.masteryLevel
      });
      return acc;
    }, {});

    // Calculate category averages
    const categoryAverages = Object.keys(byCategory).map(category => ({
      category,
      avgProgress: byCategory[category].reduce((sum, s) => sum + s.progress, 0) / byCategory[category].length,
      totalHours: byCategory[category].reduce((sum, s) => sum + s.totalHours, 0)
    }));

    res.json({
      success: true,
      data: {
        byCategory,
        categoryAverages,
        totalSkills: skills.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get productivity trends
// @route   GET /api/analytics/productivity
// @access  Private
export const getProductivityTrends = async (req, res, next) => {
  try {
    const { period = '30' } = req.query;
    const daysAgo = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000);

    const sessions = await WorkSession.find({
      userId: req.user._id,
      date: { $gte: daysAgo }
    }).sort({ date: 1 });

    // Group by date
    const dailyData = sessions.reduce((acc, session) => {
      const dateKey = session.date.toISOString().split('T')[0];
      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: dateKey,
          codingHours: 0,
          researchHours: 0,
          papersRead: 0,
          focusSessions: 0
        };
      }
      acc[dateKey].codingHours += session.codingHours || 0;
      acc[dateKey].researchHours += session.researchHours || 0;
      acc[dateKey].papersRead += session.papersRead || 0;
      acc[dateKey].focusSessions += session.focusSessions || 0;
      return acc;
    }, {});

    res.json({
      success: true,
      data: Object.values(dailyData)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get project analytics
// @route   GET /api/analytics/projects
// @access  Private
export const getProjectAnalytics = async (req, res, next) => {
  try {
    const projects = await Project.find({ userId: req.user._id });

    // Status distribution
    const statusDistribution = projects.reduce((acc, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1;
      return acc;
    }, {});

    // Category distribution
    const categoryDistribution = projects.reduce((acc, project) => {
      acc[project.category] = (acc[project.category] || 0) + 1;
      return acc;
    }, {});

    // Average progress
    const avgProgress = projects.length > 0
      ? projects.reduce((sum, p) => sum + p.progress, 0) / projects.length
      : 0;

    res.json({
      success: true,
      data: {
        total: projects.length,
        statusDistribution,
        categoryDistribution,
        avgProgress: Math.round(avgProgress)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to calculate AI Readiness Score
const calculateAIReadinessScore = ({ avgSkillProgress, totalHoursCoded, totalPapersRead, completedProjects, streak }) => {
  const skillScore = avgSkillProgress * 0.3;
  const hoursScore = Math.min((totalHoursCoded / 500) * 100, 100) * 0.25;
  const papersScore = Math.min((totalPapersRead / 50) * 100, 100) * 0.15;
  const projectScore = Math.min((completedProjects / 10) * 100, 100) * 0.2;
  const streakScore = Math.min((streak / 30) * 100, 100) * 0.1;

  return Math.round(skillScore + hoursScore + papersScore + projectScore + streakScore);
};

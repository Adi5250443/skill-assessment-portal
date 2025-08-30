const express = require('express');
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get user performance reports
router.get('/my-performance', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { timeframe = 'all' } = req.query;

    let dateFilter = '';
    if (timeframe === 'week') {
      dateFilter = 'AND qa.completed_at >= DATE_SUB(NOW(), INTERVAL 1 WEEK)';
    } else if (timeframe === 'month') {
      dateFilter = 'AND qa.completed_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)';
    }

    const [reports] = await db.query(`
      SELECT 
        qa.id,
        qa.score,
        qa.total_questions,
        qa.completed_at,
        s.name as skill_name,
        s.id as skill_id,
        COUNT(qa2.id) as attempts_count
      FROM quiz_attempts qa
      JOIN skills s ON qa.skill_id = s.id
      LEFT JOIN quiz_attempts qa2 ON qa2.skill_id = qa.skill_id AND qa2.user_id = qa.user_id
      WHERE qa.user_id = ? ${dateFilter}
      GROUP BY qa.id, s.id
      ORDER BY qa.completed_at DESC
    `, [userId]);

    // Get skill-wise performance
    const [skillPerformance] = await db.query(`
      SELECT 
        s.name as skill_name,
        s.id as skill_id,
        COUNT(qa.id) as attempts,
        AVG(qa.score) as avg_score,
        MAX(qa.score) as best_score,
        MIN(qa.score) as worst_score
      FROM skills s
      LEFT JOIN quiz_attempts qa ON s.id = qa.skill_id AND qa.user_id = ?
      WHERE qa.id IS NOT NULL ${dateFilter}
      GROUP BY s.id, s.name
      ORDER BY avg_score DESC
    `, [userId]);

    res.json({
      reports,
      skillPerformance
    });
  } catch (error) {
    console.error('Error fetching performance reports:', error);
    res.status(500).json({ error: 'Failed to fetch performance reports' });
  }
});

// Get all users performance (admin only)
router.get('/all-users', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { timeframe = 'all', skillId } = req.query;

    let dateFilter = '';
    if (timeframe === 'week') {
      dateFilter = 'AND qa.completed_at >= DATE_SUB(NOW(), INTERVAL 1 WEEK)';
    } else if (timeframe === 'month') {
      dateFilter = 'AND qa.completed_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)';
    }

    let skillFilter = '';
    if (skillId) {
      skillFilter = 'AND qa.skill_id = ?';
    }

    const query = `
      SELECT 
        u.id as user_id,
        u.name as user_name,
        u.email,
        s.name as skill_name,
        COUNT(qa.id) as attempts,
        AVG(qa.score) as avg_score,
        MAX(qa.score) as best_score,
        MAX(qa.completed_at) as last_attempt
      FROM users u
      JOIN quiz_attempts qa ON u.id = qa.user_id
      JOIN skills s ON qa.skill_id = s.id
      WHERE u.role = 'user' ${dateFilter} ${skillFilter}
      GROUP BY u.id, s.id
      ORDER BY avg_score DESC
    `;

    const params = skillId ? [skillId] : [];
    const [reports] = await db.query(query, params);

    // Get skill gap analysis
    const [skillGaps] = await db.query(`
      SELECT 
        s.name as skill_name,
        s.id as skill_id,
        COUNT(DISTINCT qa.user_id) as users_attempted,
        AVG(qa.score) as avg_score,
        COUNT(qa.id) as total_attempts
      FROM skills s
      LEFT JOIN quiz_attempts qa ON s.id = qa.skill_id ${dateFilter}
      GROUP BY s.id, s.name
      HAVING users_attempted > 0
      ORDER BY avg_score ASC
    `);

    res.json({
      userReports: reports,
      skillGaps
    });
  } catch (error) {
    console.error('Error fetching admin reports:', error);
    res.status(500).json({ error: 'Failed to fetch admin reports' });
  }
});

// Get system statistics (admin only)
router.get('/statistics', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    // Get basic counts
    const [userCount] = await db.execute('SELECT COUNT(*) as count FROM users WHERE role = "user"');
    const [skillCount] = await db.execute('SELECT COUNT(*) as count FROM skills');
    const [questionCount] = await db.execute('SELECT COUNT(*) as count FROM questions');
    const [attemptCount] = await db.execute('SELECT COUNT(*) as count FROM quiz_attempts');

    // Get recent activity
    const [recentAttempts] = await db.query(`
      SELECT 
        u.name as user_name,
        s.name as skill_name,
        qa.score,
        qa.completed_at
      FROM quiz_attempts qa
      JOIN users u ON qa.user_id = u.id
      JOIN skills s ON qa.skill_id = s.id
      ORDER BY qa.completed_at DESC
      LIMIT 10
    `);

    // Get performance trends (last 30 days)
    const [trends] = await db.execute(`
      SELECT 
        DATE(qa.completed_at) as date,
        COUNT(*) as attempts,
        AVG(qa.score) as avg_score
      FROM quiz_attempts qa
      WHERE qa.completed_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(qa.completed_at)
      ORDER BY date DESC
    `);

    res.json({
      statistics: {
        totalUsers: userCount[0].count,
        totalSkills: skillCount[0].count,
        totalQuestions: questionCount[0].count,
        totalAttempts: attemptCount[0].count
      },
      recentActivity: recentAttempts,
      performanceTrends: trends
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;

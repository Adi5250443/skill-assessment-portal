const express = require('express');
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const [users] = await db.query(`
      SELECT id, name, email, role, created_at, last_login 
      FROM users 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `, [limit, offset]);

    const [countResult] = await db.execute('SELECT COUNT(*) as total FROM users');
    const total = countResult[0].total;

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [users] = await db.query(`
      SELECT id, name, email, role, created_at, last_login 
      FROM users 
      WHERE id = ?
    `, [userId]);

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user stats
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total_attempts,
        AVG(score) as avg_score,
        MAX(score) as best_score
      FROM quiz_attempts 
      WHERE user_id = ?
    `, [userId]);

    res.json({
      user: users[0],
      stats: stats[0]
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Update user role (admin only)
router.put('/:id/role', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    await db.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    res.json({ message: 'User role updated successfully' });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Delete user (admin only)
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    if (id == req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    await db.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
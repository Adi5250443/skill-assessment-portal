const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get questions by skill
router.get('/skill/:skillId', authenticateToken, async (req, res) => {
  try {
    const { skillId } = req.params;
    const [questions] = await db.execute(
      'SELECT id, question, option_a, option_b, option_c, option_d, skill_id FROM questions WHERE skill_id = ? ORDER BY RAND() LIMIT 10',
      [skillId]
    );

    const formattedQuestions = questions.map(q => ({
      id: q.id,
      question: q.question,
      options: [q.option_a, q.option_b, q.option_c, q.option_d],
      skillId: q.skill_id
    }));

    res.json(formattedQuestions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// Get all questions (admin only)
router.get('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const [questions] = await db.query(`
      SELECT q.*, s.name as skill_name 
      FROM questions q 
      JOIN skills s ON q.skill_id = s.id 
      ORDER BY q.created_at DESC 
      LIMIT ? OFFSET ?
    `, [limit, offset]);

    const [countResult] = await db.execute('SELECT COUNT(*) as total FROM questions');
    const total = countResult[0].total;

    res.json({
      questions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// Create question (admin only)
router.post('/questions', authenticateToken, requireRole(['admin']), [
  body('question').trim().isLength({ min: 10 }).withMessage('Question must be at least 10 characters'),
  body('option_a').trim().notEmpty().withMessage('Option A is required'),
  body('option_b').trim().notEmpty().withMessage('Option B is required'),
  body('option_c').trim().notEmpty().withMessage('Option C is required'),
  body('option_d').trim().notEmpty().withMessage('Option D is required'),
  body('correct_answer').isInt({ min: 0, max: 3 }).withMessage('Correct answer must be 0-3'),
  body('skill_id').isInt({ min: 1 }).withMessage('Valid skill ID required'),
  body('difficulty').isIn(['easy', 'medium', 'hard']).withMessage('Valid difficulty required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { question, option_a, option_b, option_c, option_d, correct_answer, skill_id, difficulty } = req.body;

    const [result] = await db.query(
      'INSERT INTO questions (question, option_a, option_b, option_c, option_d, correct_answer, skill_id, difficulty, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [question, option_a, option_b, option_c, option_d, correct_answer, skill_id, difficulty, req.user.id]
    );

    res.status(201).json({ id: result.insertId, message: 'Question created successfully' });
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ error: 'Failed to create question' });
  }
});

// Update question (admin only)
router.put('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { question, option_a, option_b, option_c, option_d, correct_answer, difficulty } = req.body;

    await db.query(
      'UPDATE questions SET question = ?, option_a = ?, option_b = ?, option_c = ?, option_d = ?, correct_answer = ?, difficulty = ? WHERE id = ?',
      [question, option_a, option_b, option_c, option_d, correct_answer, difficulty, id]
    );

    res.json({ message: 'Question updated successfully' });
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ error: 'Failed to update question' });
  }
});

// Delete question (admin only)
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM questions WHERE id = ?', [id]);
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

module.exports = router;
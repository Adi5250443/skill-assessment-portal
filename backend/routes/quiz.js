const express = require('express');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Submit quiz attempt
router.post('/submit', authenticateToken, async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const { skillId, answers } = req.body;
    const userId = req.user.id;

    // Get questions with correct answers
    const [questions] = await connection.execute(
      'SELECT id, correct_answer FROM questions WHERE skill_id = ? ORDER BY id',
      [skillId]
    );

    if (questions.length === 0) {
      throw new Error('No questions found for this skill');
    }

    // Calculate score
    let correctAnswers = 0;
    const totalQuestions = questions.length;

    // Create quiz attempt
    const [attemptResult] = await connection.execute(
      'INSERT INTO quiz_attempts (user_id, skill_id, score, total_questions, completed_at) VALUES (?, ?, ?, ?, NOW())',
      [userId, skillId, 0, totalQuestions] // Will update score after calculating
    );

    const attemptId = attemptResult.insertId;

    // Process each answer
    for (let i = 0; i < Math.min(answers.length, questions.length); i++) {
      const question = questions[i];
      const userAnswer = answers[i];
      const isCorrect = userAnswer === question.correct_answer;

      if (isCorrect) {
        correctAnswers++;
      }

      // Save individual answer
      await connection.execute(
        'INSERT INTO quiz_answers (attempt_id, question_id, selected_answer, is_correct) VALUES (?, ?, ?, ?)',
        [attemptId, question.id, userAnswer, isCorrect]
      );
    }

    const score = Math.round((correctAnswers / totalQuestions) * 100);

    // Update attempt with final score
    await connection.execute(
      'UPDATE quiz_attempts SET score = ? WHERE id = ?',
      [score, attemptId]
    );

    await connection.commit();

    res.json({
      attemptId,
      score,
      correctAnswers,
      totalQuestions,
      percentage: score
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error submitting quiz:', error);
    res.status(500).json({ error: 'Failed to submit quiz' });
  } finally {
    connection.release();
  }
});

// Get quiz attempt details
router.get('/attempt/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [attempts] = await db.query(`
      SELECT qa.*, s.name as skill_name 
      FROM quiz_attempts qa 
      JOIN skills s ON qa.skill_id = s.id 
      WHERE qa.id = ? AND qa.user_id = ?
    `, [id, userId]);

    if (attempts.length === 0) {
      return res.status(404).json({ error: 'Quiz attempt not found' });
    }

    const [answers] = await db.query(`
      SELECT qans.*, q.question, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_answer
      FROM quiz_answers qans 
      JOIN questions q ON qans.question_id = q.id 
      WHERE qans.attempt_id = ?
      ORDER BY q.id
    `, [id]);

    res.json({
      attempt: attempts[0],
      answers
    });
  } catch (error) {
    console.error('Error fetching quiz attempt:', error);
    res.status(500).json({ error: 'Failed to fetch quiz attempt' });
  }
});

module.exports = router;
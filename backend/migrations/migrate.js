const db = require('../config/database');



const createTables = async () => {
  try {
    // Users table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('user', 'admin') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP NULL,
        INDEX idx_email (email),
        INDEX idx_role (role)
      )
    `);

    // Skills table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS skills (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_name (name)
      )
    `);

    // Questions table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS questions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        question TEXT NOT NULL,
        option_a VARCHAR(255) NOT NULL,
        option_b VARCHAR(255) NOT NULL,
        option_c VARCHAR(255) NOT NULL,
        option_d VARCHAR(255) NOT NULL,
        correct_answer TINYINT NOT NULL CHECK (correct_answer IN (0,1,2,3)),
        skill_id INT NOT NULL,
        difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_skill_id (skill_id),
        INDEX idx_difficulty (difficulty)
      )
    `);

    // Quiz attempts table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS quiz_attempts (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        skill_id INT NOT NULL,
        score DECIMAL(5,2) NOT NULL DEFAULT 0,
        total_questions INT NOT NULL,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
        INDEX idx_user_skill (user_id, skill_id),
        INDEX idx_completed_at (completed_at)
      )
    `);

    // Quiz answers table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS quiz_answers (
        id INT PRIMARY KEY AUTO_INCREMENT,
        attempt_id INT NOT NULL,
        question_id INT NOT NULL,
        selected_answer TINYINT NOT NULL,
        is_correct BOOLEAN NOT NULL DEFAULT FALSE,
        FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE,
        FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
        INDEX idx_attempt_id (attempt_id),
        INDEX idx_question_id (question_id)
      )
    `);

    console.log('✅ All tables created successfully!');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
  } finally {
    process.exit();
  }
};

createTables();
const bcrypt = require('bcryptjs');
const db = require('../config/database');

const seedDatabase = async () => {
  try {
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    await db.execute(`
      INSERT IGNORE INTO users (name, email, password, role) 
      VALUES (?, ?, ?, ?)
    `, ['Admin User', 'admin@example.com', hashedPassword, 'admin']);

    // Create test user
    const userHashedPassword = await bcrypt.hash('user123', 12);
    await db.execute(`
      INSERT IGNORE INTO users (name, email, password, role) 
      VALUES (?, ?, ?, ?)
    `, ['John Doe', 'user@example.com', userHashedPassword, 'user']);

    // Insert skills
    const skills = [
      ['JavaScript', 'JavaScript programming fundamentals and advanced concepts'],
      ['React', 'React.js library for building user interfaces'],
      ['Node.js', 'Server-side JavaScript runtime environment'],
      ['Python', 'Python programming language basics and applications'],
      ['Database', 'Database concepts, SQL, and data management']
    ];

    for (const [name, description] of skills) {
      await db.execute(`
        INSERT IGNORE INTO skills (name, description) 
        VALUES (?, ?)
      `, [name, description]);
    }

    // Get skill IDs
    const [skillResults] = await db.execute('SELECT id, name FROM skills');
    const skillMap = {};
    skillResults.forEach(skill => {
      skillMap[skill.name] = skill.id;
    });

    // JavaScript Questions
    const jsQuestions = [
      {
        question: "What is a closure in JavaScript?",
        options: ["A function that has access to outer scope", "A loop structure", "A data type", "An object method"],
        correct: 0,
        difficulty: "medium"
      },
      {
        question: "Which method is used to add an element to the end of an array?",
        options: ["push()", "pop()", "shift()", "unshift()"],
        correct: 0,
        difficulty: "easy"
      },
      {
        question: "What does 'this' keyword refer to in JavaScript?",
        options: ["Current function", "Current object", "Global window", "Depends on context"],
        correct: 3,
        difficulty: "hard"
      },
      {
        question: "How do you declare a variable in JavaScript ES6?",
        options: ["var x = 1", "let x = 1", "const x = 1", "Both let and const"],
        correct: 3,
        difficulty: "easy"
      },
      {
        question: "What is the output of: console.log(typeof null)?",
        options: ["null", "undefined", "object", "number"],
        correct: 2,
        difficulty: "medium"
      }
    ];

    // React Questions
    const reactQuestions = [
      {
        question: "What is JSX in React?",
        options: ["JavaScript Extension", "JavaScript XML", "Java Syntax Extension", "JSON Extension"],
        correct: 1,
        difficulty: "easy"
      },
      {
        question: "Which hook is used for side effects in React?",
        options: ["useState", "useEffect", "useContext", "useReducer"],
        correct: 1,
        difficulty: "easy"
      },
      {
        question: "What is the purpose of React.Fragment?",
        options: ["Create components", "Group elements without extra DOM node", "Handle events", "Manage state"],
        correct: 1,
        difficulty: "medium"
      },
      {
        question: "How do you pass data from parent to child component?",
        options: ["State", "Props", "Context", "Refs"],
        correct: 1,
        difficulty: "easy"
      },
      {
        question: "What is the virtual DOM in React?",
        options: ["Real DOM copy", "JavaScript representation of DOM", "Browser API", "React component"],
        correct: 1,
        difficulty: "medium"
      }
    ];

    // Node.js Questions
    const nodeQuestions = [
      {
        question: "What is Node.js?",
        options: ["JavaScript framework", "JavaScript runtime", "Database", "Web browser"],
        correct: 1,
        difficulty: "easy"
      },
      {
        question: "Which module is used for file system operations in Node.js?",
        options: ["fs", "path", "os", "http"],
        correct: 0,
        difficulty: "easy"
      },
      {
        question: "What is npm?",
        options: ["Node Package Manager", "Node Programming Model", "Network Protocol Manager", "New Project Manager"],
        correct: 0,
        difficulty: "easy"
      },
      {
        question: "How do you handle asynchronous operations in Node.js?",
        options: ["Callbacks only", "Promises only", "Async/await only", "All of the above"],
        correct: 3,
        difficulty: "medium"
      },
      {
        question: "What is Express.js?",
        options: ["Database", "Web framework for Node.js", "Frontend library", "Testing framework"],
        correct: 1,
        difficulty: "easy"
      }
    ];

    // Insert questions
    const insertQuestions = async (questions, skillId) => {
      for (const q of questions) {
        await db.execute(`
          INSERT INTO questions (question, option_a, option_b, option_c, option_d, correct_answer, skill_id, difficulty)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          q.question,
          q.options[0],
          q.options[1], 
          q.options[2],
          q.options[3],
          q.correct,
          skillId,
          q.difficulty
        ]);
      }
    };

    if (skillMap['JavaScript']) {
      await insertQuestions(jsQuestions, skillMap['JavaScript']);
    }
    
    if (skillMap['React']) {
      await insertQuestions(reactQuestions, skillMap['React']);
    }
    
    if (skillMap['Node.js']) {
      await insertQuestions(nodeQuestions, skillMap['Node.js']);
    }

    console.log('✅ Database seeded successfully!');
    console.log('📧 Admin: admin@example.com / admin123');
    console.log('📧 User: user@example.com / user123');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    process.exit();
  }
};

seedDatabase();
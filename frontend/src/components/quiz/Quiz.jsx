import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import QuizCard from './QuizCard';
import QuizResult from './QuizResult';

const Quiz = () => {
  const [skills, setSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSkills = async () => {
      try {
        const skillsData = await api.getSkills();
        setSkills(skillsData);
      } catch (error) {
        console.error('Error loading skills:', error);
      } finally {
        setLoading(false);
      }
    };
    loadSkills();
  }, []);

  const startQuiz = async (skill) => {
    try {
      setSelectedSkill(skill);
      const questionsData = await api.getQuestions(skill.id);
      setQuestions(questionsData);
      setCurrentQuestion(0);
      setAnswers([]);
      setShowResult(false);
    } catch (error) {
      console.error('Error starting quiz:', error);
      alert('Failed to load quiz questions. Please try again.');
    }
  };

  const handleAnswer = (answerIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      submitQuiz(newAnswers);
    }
  };

  const submitQuiz = async (finalAnswers) => {
    try {
      const result = await api.submitQuiz({
        skillId: selectedSkill.id,
        answers: finalAnswers
      });
      setResult(result);
      setShowResult(true);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Failed to submit quiz. Please try again.');
    }
  };

  const resetQuiz = () => {
    setSelectedSkill(null);
    setQuestions([]);
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResult(false);
    setResult(null);
  };

  if (loading) {
    return <div className="text-center py-8">Loading skills...</div>;
  }

  if (showResult) {
    return <QuizResult result={result} skillName={selectedSkill.name} onReset={resetQuiz} />;
  }

  if (selectedSkill && questions.length > 0) {
    return (
      <QuizCard
        question={questions[currentQuestion]}
        currentQuestion={currentQuestion}
        totalQuestions={questions.length}
        skillName={selectedSkill.name}
        onAnswer={handleAnswer}
      />
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Choose a Skill to Test</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {skills.map((skill) => (
          <div key={skill.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition duration-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{skill.name}</h3>
            <p className="text-gray-600 mb-4">{skill.description}</p>
            <button
              onClick={() => startQuiz(skill)}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-200"
            >
              Start Quiz
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Quiz;
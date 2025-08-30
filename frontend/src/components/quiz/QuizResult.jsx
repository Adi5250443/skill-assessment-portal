import React from 'react';

const QuizResult = ({ result, skillName, onReset }) => {
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getEmoji = (score) => {
    if (score >= 80) return '🎉';
    if (score >= 60) return '👍';
    return '📚';
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">{getEmoji(result.score)}</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Quiz Complete!</h2>
          <p className="text-gray-600">You've completed the {skillName} quiz</p>
        </div>
        
        <div className="mb-6">
          <div className={`text-4xl font-bold mb-2 ${getScoreColor(result.score)}`}>
            {result.score}%
          </div>
          <p className="text-gray-600 mb-2">Your Score</p>
          <p className="text-sm text-gray-500">
            {result.correctAnswers} out of {result.totalQuestions} questions correct
          </p>
        </div>

        <div className="mb-6">
          <div className="bg-gray-200 rounded-full h-3 mb-2">
            <div 
              className={`h-3 rounded-full transition-all duration-1000 ${
                result.score >= 80 ? 'bg-green-500' : 
                result.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${result.score}%` }}
            />
          </div>
        </div>
        
        <button
          onClick={onReset}
          className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition duration-200"
        >
          Take Another Quiz
        </button>
      </div>
    </div>
  );
};

export default QuizResult;
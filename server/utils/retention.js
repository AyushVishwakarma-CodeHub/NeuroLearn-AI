/**
 * Calculates current retention score based on exponential decay
 * R = 100 * e^(-t * k / S)
 * @param {Date} lastStudyDate 
 * @param {number} stabilityFactor - Increases with reviews
 * @param {string} difficulty - 'easy', 'medium', 'hard'
 * @returns {number} Retention score (0-100)
 */
const calculateRetention = (lastStudyDate, stabilityFactor, difficulty) => {
  const now = new Date();
  const timeElapsedHours = (now - new Date(lastStudyDate)) / (1000 * 60 * 60);
  
  const difficultyMultiplier = {
    'easy': 0.5,
    'medium': 1.0,
    'hard': 1.5
  }[difficulty] || 1.0;

  const score = 100 * Math.exp(-(timeElapsedHours * difficultyMultiplier) / (stabilityFactor * 24));
  return Math.max(0, Math.min(100, Math.round(score)));
};

module.exports = { calculateRetention };

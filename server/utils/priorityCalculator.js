const calculatePriority = (task) => {
  const timeLeft = task.deadline - Date.now();
  const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));
  
  const categoryWeights = {
    'Urgent': 4,
    'Work': 3,
    'Personal': 2,
    'Other': 1
  };

  return daysLeft <= 0 ? 1000 : daysLeft * categoryWeights[task.category];
};

module.exports = calculatePriority;
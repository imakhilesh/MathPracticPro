// Squares and Cubes Game Logic
let questions = [];
let currentQuestion = null;
let score = 0;
let highScore = localStorage.getItem("squareCubeHighScore") || 0;
document.getElementById("highScore").textContent = highScore;
let timer;
let timerDuration = 15000;
let totalQuestions = 0;
let questionsAttempted = 0;

function toggleRangeInputs() {
  const mode = document.getElementById('mode').value;
  if (mode === 'square') {
    document.getElementById('squareRange').style.display = 'block';
    document.getElementById('cubeRange').style.display = 'none';
  } else if (mode === 'cube') {
    document.getElementById('squareRange').style.display = 'none';
    document.getElementById('cubeRange').style.display = 'block';
  } else {
    document.getElementById('squareRange').style.display = 'block';
    document.getElementById('cubeRange').style.display = 'block';
  }
}

function startGame() {
  const mode = document.getElementById('mode').value;
  const difficulty = document.getElementById('difficulty').value;

  if (difficulty === "easy") timerDuration = 15000;
  else if (difficulty === "medium") timerDuration = 10000;
  else if (difficulty === "hard") timerDuration = 5000;

  questions = [];

  if (mode === 'square' || mode === 'mixed') {
    const start = parseInt(document.getElementById('squareStartRange').value);
    const end = parseInt(document.getElementById('squareEndRange').value);
    for (let i = start; i <= end; i++) {
      questions.push({ type: 'square', number: i });
    }
  }

  if (mode === 'cube' || mode === 'mixed') {
    const start = parseInt(document.getElementById('cubeStartRange').value);
    const end = parseInt(document.getElementById('cubeEndRange').value);
    for (let i = start; i <= end; i++) {
      questions.push({ type: 'cube', number: i });
    }
  }

  shuffleArray(questions);

  totalQuestions = questions.length;
  questionsAttempted = 0;
  score = 0;

  document.getElementById('score').textContent = score;
  document.getElementById('progressBar').style.width = '0%';

  document.getElementById('setupScreen').style.display = 'none';
  document.getElementById('gameScreen').style.display = 'block';

  nextQuestion();
}

function nextQuestion() {
  clearTimeout(timer);

  if (questions.length === 0) {
    endGame();
    return;
  }

  currentQuestion = questions.pop();
  questionsAttempted++;

  document.getElementById('progressBar').style.width = (questionsAttempted / totalQuestions * 100) + '%';
  document.getElementById('questionProgress').textContent = `Question ${questionsAttempted} / ${totalQuestions}`;

  const symbol = currentQuestion.type === "square" ? "²" : "³";
  document.getElementById('question').textContent = `${currentQuestion.number}${symbol}`;
  document.getElementById('answerInput').value = '';
  document.getElementById('bigFeedback').textContent = '';
  document.getElementById('answerInput').focus();

  startTimer();
}

function submitAnswer() {
  clearTimeout(timer);

  const userAnswer = parseInt(document.getElementById('answerInput').value);
  const correctAnswer = currentQuestion.type === "square" ? currentQuestion.number ** 2 : currentQuestion.number ** 3;

  if (userAnswer === correctAnswer) {
    score++;
    document.getElementById('bigFeedback').textContent = "Correct!";
    correctSound.play();
    flashScreen('green');
  } else {
    score--;
    document.getElementById('bigFeedback').textContent = `Wrong! Ans: ${correctAnswer}`;
    wrongSound.play();
    flashScreen('red');
  }

  if (score > highScore) {
    highScore = score;
    localStorage.setItem("squareCubeHighScore", highScore);
    document.getElementById('highScore').textContent = highScore;
  }

  document.getElementById('score').textContent = score;
  setTimeout(nextQuestion, 1200);
}

function startTimer() {
  let left = timerDuration;
  updateTimerBar(left);
  timer = setInterval(() => {
    left -= 100;
    updateTimerBar(left);
    if (left <= 0) {
      clearInterval(timer);
      score--;
      document.getElementById('score').textContent = score;
      document.getElementById('bigFeedback').textContent = `Time's up! Ans: ${currentQuestion.type === "square" ? currentQuestion.number ** 2 : currentQuestion.number ** 3}`;
      wrongSound.play();
      flashScreen('red');
      setTimeout(nextQuestion, 1200);
    }
  }, 100);
}

function updateTimerBar(ms) {
  const pct = (ms / timerDuration) * 100;
  document.getElementById('timerBar').style.width = pct + '%';
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function endGame() {
  clearTimeout(timer);
  alert(`Game Over! Final Score: ${score}`);
  window.location.href = "../index.html";
}

function goHome() {
  window.location.href = "../index.html";
}

function flashScreen(color) {
  const overlay = document.getElementById('overlay');
  overlay.style.background = color === 'green' ? 'rgba(0,255,0,0.2)' : 'rgba(255,0,0,0.3)';
  setTimeout(() => overlay.style.background = 'transparent', 500);
}

// Enter key submit
document.addEventListener('keydown', function(event) {
  if (event.key === "Enter" && document.getElementById('gameScreen').style.display === 'block') {
    submitAnswer();
  }
});

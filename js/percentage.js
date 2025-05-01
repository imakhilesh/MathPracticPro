// Full Percentage Game Logic
const data = [
  ["1/2", 50], ["2/3", 66.66], ["3/4", 75], ["5/6", 83.33], ["7/8", 87.5],
  ["1/3", 33.33], ["1/4", 25], ["3/2", 150], ["5/2", 250], ["7/2", 350],
  ["5/4", 125], ["7/4", 175], ["9/4", 225], ["2/5", 40], ["3/5", 60],
  ["4/5", 80], ["1/6", 16.66], ["1/7", 14.28], ["2/7", 28.56], ["3/7", 42.84],
  ["4/7", 57.13], ["5/7", 71.42], ["6/7", 85.71], ["1/8", 12.5], ["3/8", 37.5],
  ["5/8", 62.5], ["7/8", 87.5], ["1/9", 11.11], ["1/10", 10], ["1/11", 9.09],
  ["1/12", 8.33], ["5/12", 41.66], ["7/12", 58.33], ["11/12", 91.66],
  ["1/13", 7.69], ["2/13", 15.38], ["5/13", 38.46], ["6/13", 46.14],
  ["7/13", 53.84], ["8/13", 61.53], ["10/13", 76.92], ["11/13", 84.61],
  ["12/13", 92.3], ["1/14", 7.14], ["3/14", 21.42], ["5/14", 35.71],
  ["1/15", 6.66], ["2/15", 13.33], ["4/15", 26.66], ["7/15", 46.66],
  ["8/15", 53.33], ["11/15", 73.33], ["14/15", 93.33], ["1/16", 6.25],
  ["3/16", 18.75], ["5/16", 31.25], ["7/16", 43.75], ["9/16", 56.25],
  ["11/16", 68.75], ["13/16", 81.25], ["15/16", 93.75], ["1/18", 5.55],
  ["5/18", 27.77], ["7/18", 38.88], ["11/18", 61.11], ["13/18", 72.22],
  ["17/18", 94.44], ["1/20", 5], ["3/20", 15], ["7/20", 35], ["9/20", 45],
  ["11/20", 55], ["13/20", 65], ["17/20", 85], ["19/20", 95],
  ["1/25", 4], ["2/25", 8], ["3/25", 12], ["4/25", 16]
];

let questions = [...data];
let current = 0;
let score = 0;
let highScore = localStorage.getItem("percentageHighScore") || 0;
let timer;

document.getElementById('highScore').textContent = highScore;

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

shuffleArray(questions);

function loadQuestion() {
  if (current >= questions.length) {
    endGame();
    return;
  }

  const [fraction, percent] = questions[current];
  document.getElementById('question').textContent = `Fraction for ${percent}%?`;
  document.getElementById('questionProgress').textContent = `Question ${current + 1} / ${questions.length}`;

  const options = generateOptions(fraction);
  const optionsDiv = document.getElementById('options');
  optionsDiv.innerHTML = '';

  options.forEach(opt => {
    const button = document.createElement('button');
    button.className = 'option';
    button.textContent = opt;
    button.onclick = () => checkAnswer(opt, fraction);
    optionsDiv.appendChild(button);
  });

  updateProgress();
  startTimer();
}

function generateOptions(correct) {
  let opts = [correct];
  while (opts.length < 4) {
    const random = data[Math.floor(Math.random() * data.length)][0];
    if (!opts.includes(random)) {
      opts.push(random);
    }
  }
  shuffleArray(opts);
  return opts;
}

function checkAnswer(selected, correct) {
  clearInterval(timer);
  if (selected === correct) {
    score++;
    correctSound.play();
    document.getElementById('overlay').style.background = 'rgba(0,255,0,0.2)';
  } else {
    score--;
    wrongSound.play();
    document.getElementById('overlay').style.background = 'rgba(255,0,0,0.2)';
  }

  if (score > highScore) {
    highScore = score;
    localStorage.setItem("percentageHighScore", highScore);
    document.getElementById('highScore').textContent = highScore;
  }

  document.getElementById('score').textContent = score;
  setTimeout(() => {
    document.getElementById('overlay').style.background = 'transparent';
    current++;
    loadQuestion();
  }, 800);
}

function updateProgress() {
  document.getElementById('progressBar').style.width = ((current + 1) / questions.length * 100) + '%';
}

function startTimer() {
  let timeLeft = 1000;
  document.getElementById('timerBar').style.width = '100%';
  clearInterval(timer);
  timer = setInterval(() => {
    timeLeft -= 1;
    document.getElementById('timerBar').style.width = timeLeft + '%';
    if (timeLeft <= 0) {
      clearInterval(timer);
      score--;
      document.getElementById('score').textContent = score;
      document.getElementById('overlay').style.background = 'rgba(255,0,0,0.2)';
      wrongSound.play();
      setTimeout(() => {
        document.getElementById('overlay').style.background = 'transparent';
        current++;
        loadQuestion();
      }, 800);
    }
  }, 100);
}

function endGame() {
  clearInterval(timer);
  alert(`Game Over! Final Score: ${score}`);
  window.location.href = "../index.html";
}

function goHome() {
  window.location.href = "../index.html";
}

loadQuestion();

// Updated main.js to Save User + Show Welcome Name 🎉 + Analytics 🚀 + Fix Coffee Button

// Check if user is logged in
firebase.auth().onAuthStateChanged(user => {
  if (user) {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('welcomeScreen').style.display = 'block';

    const userName = user.displayName || "User";
    document.getElementById('welcomeUserName').innerHTML = `Welcome, ${userName}! 🎉`;

    saveUserData(user); // Save to Firestore
  } else {
    document.getElementById('loginScreen').style.display = 'block';
    document.getElementById('welcomeScreen').style.display = 'none';
  }
});

// Login with Google
document.getElementById('loginBtn').addEventListener('click', () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider)
    .then(result => {
      console.log('Logged in');
      firebase.analytics().logEvent('login', { method: 'Google' }); // 🔥 Track login event
    })
    .catch(error => {
      console.error('Login Error:', error.message);
    });
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
  firebase.auth().signOut()
    .then(() => {
      console.log('Logged out');
      firebase.analytics().logEvent('logout'); // 🔥 Track logout event
    })
    .catch(error => {
      console.error('Logout Error:', error.message);
    });
});

// Buy Coffee Button
document.getElementById('donateButton').addEventListener('click', () => {
  window.open("https://rzp.io/r/KrFqOuM", "_blank");
  firebase.analytics().logEvent('donate_button_clicked'); // 🔥 Track Donate Click
});

// Save user info to Firestore
function saveUserData(user) {
  firebase.firestore().collection('users').doc(user.uid).set({
    name: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
    lastLogin: new Date()
  }, { merge: true })
  .then(() => console.log('User data saved'))
  .catch(error => console.error('Error saving user data:', error));
}

// Practice Setup
let selectedMode = "";

function selectMode(mode) {
  selectedMode = mode;
  document.getElementById('welcomeScreen').style.display = 'none';
  document.getElementById('setupScreen').style.display = 'block';

  firebase.analytics().logEvent('select_mode', { mode: selectedMode }); // 🔥 Track mode select

  if (['addition','subtraction','multiplication','division'].includes(mode)) {
    document.getElementById('digitRangeFields').style.display = 'block';
    document.getElementById('normalRangeFields').style.display = 'none';
  } else if (['mixed'].includes(mode)) {
    document.getElementById('digitRangeFields').style.display = 'none';
    document.getElementById('normalRangeFields').style.display = 'none';
  }
}

function backToWelcome() {
  document.getElementById('setupScreen').style.display = 'none';
  document.getElementById('endScreen').style.display = 'none';
  document.getElementById('gameScreen').style.display = 'none';
  document.getElementById('welcomeScreen').style.display = 'block';
}

function backToSetup() {
  document.getElementById('gameScreen').style.display = 'none';
  document.getElementById('setupScreen').style.display = 'block';
}

// Game Logic
let questions = [];
let currentQuestion = null;
let score = 0;
let totalQuestions = 0;
let questionsAttempted = 0;
let correctAnswers = 0;
let startTime;
let timer;
let timerDuration = 15000;

function startGame() {
  const count = parseInt(document.getElementById('questionCount').value);
  totalQuestions = count;
  score = 0;
  questionsAttempted = 0;
  correctAnswers = 0;
  startTime = new Date();

  const difficulty = document.getElementById('difficulty').value;
  if (difficulty === 'noob') timerDuration = 300000;
  else if (difficulty === 'beginner') timerDuration = 120000;
  else if (difficulty === 'pro') timerDuration = 60000;
  else if (difficulty === 'advanced') timerDuration = 30000;
  else if (difficulty === 'god') timerDuration = 10000;

  questions = [];
  for (let i = 0; i < count; i++) {
    let a = randomBetween(1, 999);
    let b = randomBetween(1, 999);
    let question, answer;

    if (selectedMode === 'addition') {
      question = `${a} + ${b}`; answer = a + b;
    } else if (selectedMode === 'subtraction') {
      question = `${a} - ${b}`; answer = a - b;
    } else if (selectedMode === 'multiplication') {
      question = `${a} × ${b}`; answer = a * b;
    } else if (selectedMode === 'division') {
      let product = a * b;
      question = `${product} ÷ ${a}`; answer = b;
    } else if (selectedMode === 'mixed') {
      const modes = ['addition', 'subtraction', 'multiplication', 'division'];
      const randomMode = modes[Math.floor(Math.random() * modes.length)];
      if (randomMode === 'addition') {
        question = `${a} + ${b}`; answer = a + b;
      } else if (randomMode === 'subtraction') {
        question = `${a} - ${b}`; answer = a - b;
      } else if (randomMode === 'multiplication') {
        question = `${a} × ${b}`; answer = a * b;
      } else if (randomMode === 'division') {
        let product = a * b;
        question = `${product} ÷ ${a}`; answer = b;
      }
    }

    questions.push({ text: question, answer });
  }

  document.getElementById('setupScreen').style.display = 'none';
  document.getElementById('gameScreen').style.display = 'block';
  nextQuestion();
}

function nextQuestion() {
  clearTimeout(timer);

  if (questions.length === 0) {
    showEndScreen();
    return;
  }

  currentQuestion = questions.pop();
  questionsAttempted++;

  document.getElementById('progressBar').style.width = (questionsAttempted / totalQuestions * 100) + '%';
  document.getElementById('question').textContent = currentQuestion.text;
  document.getElementById('questionProgress').textContent = `Question ${questionsAttempted} / ${totalQuestions}`;

  document.getElementById('answerInput').value = '';
  document.getElementById('bigFeedback').textContent = '';
  document.getElementById('answerInput').focus();
  startTimer();
}

function submitAnswer() {
  clearTimeout(timer);
  const userAnswer = parseFloat(document.getElementById('answerInput').value);
  const expected = parseFloat(currentQuestion.answer);

  if (Math.abs(userAnswer - expected) < 0.01) {
    score++;
    correctAnswers++;
    document.getElementById('bigFeedback').textContent = "Correct!";
    document.getElementById('correctSound').play();
  } else {
    score--;
    document.getElementById('bigFeedback').textContent = `Wrong! Ans: ${expected}`;
    document.getElementById('wrongSound').play();
  }

  document.getElementById('score').textContent = score;
  setTimeout(nextQuestion, 1500);
}

function startTimer() {
  let left = timerDuration;
  document.getElementById('timerBar').style.width = '100%';

  timer = setInterval(() => {
    left -= 100;
    document.getElementById('timerBar').style.width = (left / timerDuration) * 100 + '%';
    if (left <= 0) {
      clearInterval(timer);
      score--;
      document.getElementById('bigFeedback').textContent = `Time's up! Ans: ${currentQuestion.answer}`;
      document.getElementById('wrongSound').play();
      document.getElementById('score').textContent = score;
      setTimeout(nextQuestion, 1500);
    }
  }, 100);
}

function showEndScreen() {
  document.getElementById('gameScreen').style.display = 'none';
  document.getElementById('endScreen').style.display = 'block';
  document.getElementById('finalScore').textContent = score;

  const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
  document.getElementById('accuracy').textContent = accuracy;

  const totalSec = (new Date() - startTime) / 1000;
  document.getElementById('avgTime').textContent = (totalSec / totalQuestions).toFixed(1);

  firebase.analytics().logEvent('game_complete', { score, accuracy }); // 🔥 Track game complete
}

function playAgain() {
  backToWelcome();
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

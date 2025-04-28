// main.js - Fully Fixed Version (Donation Popup + Email + Game + Analytics)

// --- Firebase Authentication Handling ---
firebase.auth().onAuthStateChanged(user => {
  if (user) {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('welcomeScreen').style.display = 'block';
    const userName = user.displayName || "User";
    document.getElementById('welcomeUserName').innerHTML = `Welcome, ${userName}! 🎉`;
    saveUserData(user);
  } else {
    document.getElementById('loginScreen').style.display = 'block';
    document.getElementById('welcomeScreen').style.display = 'none';
  }
});

// --- Login with Google ---
document.getElementById('loginBtn').addEventListener('click', () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider)
    .then(() => firebase.analytics().logEvent('login', { method: 'Google' }))
    .catch(error => console.error('Login Error:', error.message));
});
// --- Login as Guest (Anonymous Sign In) ---
document.getElementById('guestLoginBtn').addEventListener('click', () => {
  firebase.auth().signInAnonymously()
    .then(() => {
      console.log('Logged in as Guest');
      firebase.analytics().logEvent('login', { method: 'Guest' });
    })
    .catch(error => {
      console.error('Guest Login Error:', error.message);
    });
});
// --- Logout ---
document.getElementById('logoutBtn').addEventListener('click', () => {
  firebase.auth().signOut()
    .then(() => firebase.analytics().logEvent('logout'))
    .catch(error => console.error('Logout Error:', error.message));
});

// --- Save User to Firestore ---
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

// --- Practice Setup ---
let selectedMode = "";

function selectMode(mode) {
  selectedMode = mode;
  document.getElementById('welcomeScreen').style.display = 'none';
  document.getElementById('setupScreen').style.display = 'block';
  firebase.analytics().logEvent('select_mode', { mode: selectedMode });
  document.getElementById('digitRangeFields').style.display = ['addition','subtraction','multiplication','division'].includes(mode) ? 'block' : 'none';
  document.getElementById('normalRangeFields').style.display = mode === 'mixed' ? 'none' : 'none';
}

function backToWelcome() {
  ['setupScreen','endScreen','gameScreen'].forEach(id => document.getElementById(id).style.display = 'none');
  document.getElementById('welcomeScreen').style.display = 'block';
}

function backToSetup() {
  document.getElementById('gameScreen').style.display = 'none';
  document.getElementById('setupScreen').style.display = 'block';
}

// --- Game Logic ---
let questions = [], currentQuestion = null, score = 0, totalQuestions = 0, questionsAttempted = 0, correctAnswers = 0, startTime, timer, timerDuration = 15000;

function startGame() {
  const count = parseInt(document.getElementById('questionCount').value);
  totalQuestions = count;
  score = 0;
  questionsAttempted = 0;
  correctAnswers = 0;
  startTime = new Date();
  timerDuration = { noob: 300000, beginner: 120000, pro: 60000, advanced: 30000, god: 10000 }[document.getElementById('difficulty').value] || 15000;

  questions = Array.from({length: count}, () => generateQuestion());

  document.getElementById('setupScreen').style.display = 'none';
  document.getElementById('gameScreen').style.display = 'block';
  nextQuestion();
}

function generateQuestion() {
  let a = randomBetween(1, 999), b = randomBetween(1, 999);
  const modes = ['addition','subtraction','multiplication','division'];
  const mode = selectedMode === 'mixed' ? modes[Math.floor(Math.random() * modes.length)] : selectedMode;
  if (mode === 'addition') return { text: `${a} + ${b}`, answer: a + b };
  if (mode === 'subtraction') return { text: `${a} - ${b}`, answer: a - b };
  if (mode === 'multiplication') return { text: `${a} × ${b}`, answer: a * b };
  if (mode === 'division') { let product = a * b; return { text: `${product} ÷ ${a}`, answer: b }; }
}

function nextQuestion() {
  clearTimeout(timer);
  if (questions.length === 0) return showEndScreen();

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
    score++; correctAnswers++;
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
  document.getElementById('accuracy').textContent = Math.round((correctAnswers / totalQuestions) * 100);
  document.getElementById('avgTime').textContent = ((new Date() - startTime) / 1000 / totalQuestions).toFixed(1);
  firebase.analytics().logEvent('game_complete', { score, accuracy: Math.round((correctAnswers / totalQuestions) * 100) });
}

function playAgain() { backToWelcome(); }
function randomBetween(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

// --- Send Thank You EmailJS ---
function sendThankYouEmail() {
  const user = firebase.auth().currentUser;
  if (user) {
    emailjs.send('service_kbtqoqh', 'template_ucsaksa', {
      name: user.displayName || "Math Practice User",
      email: user.email,
      message: "Thanks for showing coffee love! ☕️🚀"
    }, 'bwXYuKi_isO1fgwLl')
    .then(response => console.log('Email sent:', response.status))
    .catch(error => console.error('Email failed:', error));
  }
}

// --- Donation Modal Handling ---
function checkDonationPopup() {
  if (!localStorage.getItem("donationPromptShown")) {
    document.getElementById('donationModal').style.display = 'block';
    document.getElementById('setupScreen').style.display = 'none';
  } else {
    startGame();
  }
}

function continuePlaying() {
  document.getElementById('donationModal').style.display = 'none';
  localStorage.setItem("donationPromptShown", "true");
  startGame();
}

function donateNow() {
  firebase.analytics().logEvent('donate_click');
  sendThankYouEmail();
  window.open("https://rzp.io/r/KrFqOuM", "_blank");
  setTimeout(() => alert("🙏 Thank you for supporting the creator! ❤️"), 1000);
}

// Attach Donate Button after DOM Loaded
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('donateButton').addEventListener('click', donateNow);
});
function checkDonationPopup() {
  if (!localStorage.getItem("donationPromptShown")) {
    document.getElementById('donationModal').style.display = 'block';
    document.getElementById('setupScreen').style.display = 'none';
  } else {
    startGame();
  }
}

function continuePlaying() {
  document.getElementById('donationModal').style.display = 'none';
  localStorage.setItem("donationPromptShown", "true");
  startGame();
}


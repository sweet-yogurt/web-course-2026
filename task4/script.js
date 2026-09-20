

let secretNumber = '';
let attempts = 0;
let history = [];
let gameOver = false;


const guessInput = document.getElementById('guessInput');
const checkBtn = document.getElementById('checkBtn');
const newGameBtn = document.getElementById('newGameBtn');
const attemptsSpan = document.getElementById('attemptsCount');
const messageBox = document.getElementById('messageBox');
const historyList = document.getElementById('historyList');
const historyCount = document.getElementById('historyCount');
const rulesBtn = document.getElementById('rulesBtn');
const rulesModal = document.getElementById('rulesModal');
const closeModalBtn = document.getElementById('closeModalBtn');


function generateSecretNumber() {
  const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  // Перемешивание Фишера–Йетса
  for (let i = digits.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [digits[i], digits[j]] = [digits[j], digits[i]];
  }
  return digits.slice(0, 4).join('');
}

function isValidGuess(input) {
  if (!/^\d+$/.test(input)) return false;
  if (input.length !== 4) return false;
  const digitSet = new Set(input);
  return digitSet.size === 4;
}


function countBullsAndCows(secret, guess) {
  let bulls = 0;
  let cows = 0;
  for (let i = 0; i < 4; i++) {
    if (guess[i] === secret[i]) {
      bulls++;
    } else if (secret.includes(guess[i])) {
      cows++;
    }
  }
  return { bulls, cows };
}


function updateAttemptsDisplay() {
  attemptsSpan.textContent = attempts;
}


function updateHistoryCount() {
  const count = history.length;
  historyCount.textContent = count === 0 ? '0 записей' :
    count === 1 ? '1 запись' :
    count >= 2 && count <= 4 ? count + ' записи' :
    count + ' записей';
}


function renderHistory() {
  historyList.innerHTML = '';

  if (history.length === 0) {
    const emptyLi = document.createElement('li');
    emptyLi.className = 'empty-history';
    emptyLi.textContent = 'Нет попыток';
    historyList.appendChild(emptyLi);
    updateHistoryCount();
    return;
  }

  history.forEach(function(item) {
    const li = document.createElement('li');

    const guessSpan = document.createElement('span');
    guessSpan.className = 'guess-value';
    guessSpan.textContent = item.guess;

    const resultSpan = document.createElement('span');
    resultSpan.className = 'result-value';

    const bullsSpan = document.createElement('span');
    bullsSpan.className = 'result-bulls';
    bullsSpan.textContent = item.bulls + ' Б';

    const cowsSpan = document.createElement('span');
    cowsSpan.className = 'result-cows';
    cowsSpan.textContent = item.cows + ' К';

    resultSpan.appendChild(bullsSpan);
    resultSpan.appendChild(cowsSpan);

    li.appendChild(guessSpan);
    li.appendChild(resultSpan);
    historyList.appendChild(li);
  });

  updateHistoryCount();
}


function setMessage(text, type) {
  type = type || 'info';
  messageBox.textContent = text;
  messageBox.classList.remove('error', 'win');
  if (type === 'error') {
    messageBox.classList.add('error');
  } else if (type === 'win') {
    messageBox.classList.add('win');
  }
}


function updateControls() {
  if (gameOver) {
    guessInput.disabled = true;
    checkBtn.disabled = true;
  } else {
    guessInput.disabled = false;
    checkBtn.disabled = false;
    guessInput.focus();
  }
}


function resetGame() {
  secretNumber = generateSecretNumber();
  // Для отладки (можно убрать в продакшене)
  console.log('Загаданное число (для проверки):', secretNumber);

  attempts = 0;
  history = [];
  gameOver = false;

  guessInput.value = '';
  updateAttemptsDisplay();
  renderHistory();
  setMessage('Введите четыре различные цифры', 'info');
  updateControls();
}


function handleGuess() {
  if (gameOver) return;

  const rawInput = guessInput.value.trim();

  if (!isValidGuess(rawInput)) {
    setMessage('Ошибка: ровно 4 цифры, все разные, только цифры (0–9).', 'error');
    return;
  }

  const result = countBullsAndCows(secretNumber, rawInput);
  const bulls = result.bulls;
  const cows = result.cows;

  attempts++;

  history.push({
    guess: rawInput,
    bulls: bulls,
    cows: cows
  });

  updateAttemptsDisplay();
  renderHistory();

  if (bulls === 4) {
    gameOver = true;
    setMessage('Победа! Угадано за ' + attempts + ' попыток.', 'win');
    updateControls();
  } else {
    const bullsText = bulls === 1 ? 'бык' : (bulls >= 2 && bulls <= 4 ? 'быка' : 'быков');
    const cowsText = cows === 1 ? 'корова' : (cows >= 2 && cows <= 4 ? 'коровы' : 'коров');
    setMessage(rawInput + ' → ' + bulls + ' ' + bullsText + ', ' + cows + ' ' + cowsText, 'info');
    guessInput.value = '';
    guessInput.focus();
  }
}


function openModal() {
  rulesModal.classList.add('active');
}

function closeModal() {
  rulesModal.classList.remove('active');
}

function initGame() {
  resetGame();

  checkBtn.addEventListener('click', handleGuess);

  newGameBtn.addEventListener('click', function() {
    resetGame();
  });

  guessInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (!gameOver) {
        handleGuess();
      }
    }
  });

  guessInput.addEventListener('input', function() {
    this.value = this.value.replace(/\D/g, '').slice(0, 4);
  });

  rulesBtn.addEventListener('click', openModal);
  closeModalBtn.addEventListener('click', closeModal);

  rulesModal.addEventListener('click', function(e) {
    if (e.target === rulesModal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && rulesModal.classList.contains('active')) {
      closeModal();
    }
  });
}

initGame();

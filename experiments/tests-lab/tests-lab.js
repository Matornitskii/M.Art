const STORAGE_KEY = 'm-art-tests-lab';

const pollForm = document.querySelector('#poll-form');
const pollResult = document.querySelector('#poll-result');

const reactionButton = document.querySelector('#reaction-button');
const reactionResult = document.querySelector('#reaction-result');

const logicForm = document.querySelector('#logic-form');
const logicResult = document.querySelector('#logic-result');

let reactionStartTime = null;
let reactionTimer = null;
let waitingForSignal = false;
let canClickNow = false;

// Читаем сохранённые результаты из браузера. Если данных нет, возвращаем объект по умолчанию.
function readStorage() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { poll: null, bestReactionMs: null, logicSolved: false };
  }

  try {
    return JSON.parse(raw);
  } catch {
    // Если JSON повреждён, безопаснее начать с чистого состояния.
    return { poll: null, bestReactionMs: null, logicSolved: false };
  }
}

// Сохраняем состояние целиком, чтобы не потерять предыдущие результаты между перезагрузками.
function writeStorage(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function renderSavedState() {
  const state = readStorage();

  if (state.poll) {
    pollResult.textContent = `Сохранённый ответ опроса: ${state.poll}.`;
  }

  if (typeof state.bestReactionMs === 'number') {
    reactionResult.textContent = `Лучший результат реакции: ${state.bestReactionMs} мс.`;
  }

  if (state.logicSolved) {
    logicResult.textContent = 'Логический тест уже решён ранее. Отличная память!';
  }
}

pollForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const topic = new FormData(pollForm).get('topic');

  const state = readStorage();
  state.poll = topic;
  writeStorage(state);

  pollResult.textContent = `Ответ сохранён: ${topic}.`;
});

reactionButton.addEventListener('click', () => {
  if (!waitingForSignal && !canClickNow) {
    waitingForSignal = true;
    reactionButton.textContent = 'Ждите сигнал...';
    reactionButton.classList.add('waiting');
    reactionResult.textContent = '';

    // Случайная задержка делает тест честнее: пользователь не знает, когда будет сигнал.
    const delay = 1500 + Math.random() * 2500;
    reactionTimer = window.setTimeout(() => {
      waitingForSignal = false;
      canClickNow = true;
      reactionStartTime = performance.now();
      reactionButton.textContent = 'ЖМИ!';
      reactionButton.classList.remove('waiting');
      reactionButton.classList.add('go');
    }, delay);

    return;
  }

  if (waitingForSignal) {
    window.clearTimeout(reactionTimer);
    waitingForSignal = false;
    reactionButton.classList.remove('waiting');
    reactionButton.textContent = 'Слишком рано! Попробовать снова';
    reactionResult.textContent = 'Вы нажали до сигнала. Запустите тест заново.';
    return;
  }

  if (canClickNow) {
    const reactionMs = Math.round(performance.now() - reactionStartTime);
    canClickNow = false;
    reactionButton.textContent = 'Старт';
    reactionButton.classList.remove('go');

    const state = readStorage();
    const best = state.bestReactionMs;

    // Обновляем рекорд только если новый результат лучше.
    if (typeof best !== 'number' || reactionMs < best) {
      state.bestReactionMs = reactionMs;
      writeStorage(state);
      reactionResult.textContent = `Ваше время: ${reactionMs} мс. Это новый рекорд!`;
    } else {
      reactionResult.textContent = `Ваше время: ${reactionMs} мс. Личный рекорд: ${best} мс.`;
    }
  }
});

logicForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const answer = Number(new FormData(logicForm).get('answer'));

  if (answer === 32) {
    const state = readStorage();
    state.logicSolved = true;
    writeStorage(state);
    logicResult.textContent = 'Верно! Последовательность удваивается.';
  } else {
    logicResult.textContent = 'Пока неверно. Подсказка: каждое число в 2 раза больше предыдущего.';
  }
});

renderSavedState();

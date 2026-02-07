const form = document.querySelector('#life-form');
const resultSection = document.querySelector('#result');
const summary = document.querySelector('#summary');
const percentNode = document.querySelector('#percent');
const progress = document.querySelector('#progress');
const grid = document.querySelector('#grid');

const MS_IN_DAY = 1000 * 60 * 60 * 24;
const MAX_GRID_CELLS = 1200;

// Переводим миллисекунды в дни. Округление вниз нужно, чтобы считать только полностью прошедшие дни.
const toDays = (ms) => Math.floor(ms / MS_IN_DAY);

function createGrid(spentDays, totalDays) {
  grid.innerHTML = '';

  // Ограничиваем количество клеток, чтобы браузер не тормозил на очень больших значениях.
  const cells = Math.min(totalDays, MAX_GRID_CELLS);
  const spentRatio = totalDays > 0 ? spentDays / totalDays : 0;

  for (let i = 0; i < cells; i += 1) {
    const cell = document.createElement('div');
    cell.className = 'day-cell';

    // Определяем, должна ли клетка быть «прожитой» по текущей доле.
    if (i / cells < spentRatio) {
      cell.classList.add('day-cell--spent');
    }

    grid.append(cell);
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const birthDateValue = formData.get('birthDate');
  const lifeExpectancyValue = Number(formData.get('lifeExpectancy') || 80);

  // Проверяем корректность даты, иначе расчёт вернёт NaN и сломает интерфейс.
  if (!birthDateValue) {
    summary.textContent = 'Укажите дату рождения.';
    resultSection.classList.remove('hidden');
    return;
  }

  const birthDate = new Date(birthDateValue);
  const now = new Date();

  if (birthDate > now) {
    summary.textContent = 'Дата рождения не может быть в будущем.';
    resultSection.classList.remove('hidden');
    return;
  }

  const spentDays = toDays(now - birthDate);
  const totalDays = Math.max(1, Math.floor(lifeExpectancyValue * 365.25));
  const remainingDays = Math.max(0, totalDays - spentDays);
  const usedPercent = Math.min(100, (spentDays / totalDays) * 100);

  summary.textContent = `Всего условных дней: ${totalDays}. Уже прошло: ${spentDays}. Осталось: ${remainingDays}.`;
  percentNode.textContent = `Использовано: ${usedPercent.toFixed(2)}%`;
  progress.style.width = `${usedPercent}%`;

  createGrid(spentDays, totalDays);
  resultSection.classList.remove('hidden');
});

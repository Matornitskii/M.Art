const catalogContainer = document.querySelector('#catalog');
const catalogNote = document.querySelector('#catalog-note');

// Преобразуем статус в CSS-класс: пробелы заменяем на дефис для стабильного имени.
const statusToClass = (status) => `status--${status.replace(/\s+/g, '-')}`;

// Создаём карточку эксперимента из данных манифеста.
function createCard(experiment) {
  const article = document.createElement('article');
  article.className = 'card';

  const title = document.createElement('h3');
  title.textContent = experiment.title;

  const description = document.createElement('p');
  description.textContent = experiment.description;

  const status = document.createElement('span');
  status.className = `status ${statusToClass(experiment.status)}`;
  status.textContent = `Статус: ${experiment.status}`;

  const link = document.createElement('a');
  link.className = 'button-link';
  link.href = experiment.url;
  link.textContent = 'Открыть эксперимент';

  article.append(title, description, status, link);
  return article;
}

async function renderCatalog() {
  try {
    // Загружаем список экспериментов из JSON: так каталог обновляется автоматически.
    const response = await fetch('./data/experiments.json');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const experiments = await response.json();

    // Показываем только видимые элементы, чтобы черновики можно было хранить, но не публиковать.
    const visibleItems = experiments.filter((item) => item.visible !== false);

    if (visibleItems.length === 0) {
      catalogNote.textContent = 'Пока нет доступных экспериментов. Добавьте запись в data/experiments.json.';
      return;
    }

    visibleItems.forEach((experiment) => {
      catalogContainer.append(createCard(experiment));
    });

    catalogNote.textContent = `Всего активных экспериментов: ${visibleItems.length}.`;
  } catch (error) {
    // Ошибку показываем мягко, чтобы страница оставалась полезной даже при проблемах с загрузкой.
    catalogNote.textContent =
      'Не удалось загрузить каталог. Для локального запуска используйте статический сервер (например, `python -m http.server`).';
    console.error('Ошибка загрузки каталога:', error);
  }
}

renderCatalog();

function createConfig() {
  return {
    API_URL: 'https://jsonplaceholder.typicode.com/posts',
    PAGE_SIZE: 10,
    TOTAL_POSTS: 100,
    SCROLL_THRESHOLD: 200,
    DEBOUNCE_DELAY: 300,
  };
}

function createModel() {
  return {
    allPosts: [],
    loadedCount: 0,
    isLoading: false,
    hasMore: true,
    filter: '',
  };
}

function createView() {
  return {
    postsContainer: document.getElementById('posts'),
    loaderEl: document.getElementById('loader'),
    errorEl: document.getElementById('error'),
    endEl: document.getElementById('end'),
    searchInput: document.getElementById('search'),
    toTopBtn: document.getElementById('toTop'),
  };
}

function getFilteredPosts(model) {
  if (!model.filter) return model.allPosts;
  return model.allPosts.filter(post =>
    post.title.toLowerCase().includes(model.filter)
  );
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function createPostCard(post) {
  const card = document.createElement('article');
  card.className = 'post-card';
  card.dataset.id = post.id;

  card.innerHTML = `
    <h2>${escapeHtml(post.title)}</h2>
    <p>${escapeHtml(post.body)}</p>
    <span class="author">Автор #${post.userId}</span>
  `;
  return card;
}

function renderPosts(model, view) {
  const filtered = getFilteredPosts(model);
  const fragment = document.createDocumentFragment();

  if (filtered.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'end';
    empty.textContent = model.filter
      ? 'Ничего не найдено по вашему запросу.'
      : 'Постов пока нет.';
    fragment.appendChild(empty);
  } else {
    filtered.forEach(post => fragment.appendChild(createPostCard(post)));
  }

  view.postsContainer.replaceChildren(fragment);
}

function showLoader(view) { view.loaderEl.classList.remove('hidden'); }
function hideLoader(view) { view.loaderEl.classList.add('hidden'); }

function showError(view, message) {
  view.errorEl.textContent = message;
  view.errorEl.classList.remove('hidden');
}
function hideError(view) { view.errorEl.classList.add('hidden'); }

function showEnd(view) { view.endEl.classList.remove('hidden'); }
function hideEnd(view) { view.endEl.classList.add('hidden'); }

async function fetchNextPortion(model, view, config) {
  if (!model.hasMore || model.isLoading) return false;

  model.isLoading = true;
  showLoader(view);
  hideError(view);

  const start = model.loadedCount;
  const end = Math.min(start + config.PAGE_SIZE, config.TOTAL_POSTS);
  const url = `${config.API_URL}?_start=${start}&_limit=${end - start}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Сервер вернул статус ${response.status} ${response.statusText}`);
    }

    const posts = await response.json();

    if (!Array.isArray(posts)) {
      throw new Error('Некорректный формат данных от сервера.');
    }

    if (posts.length === 0) {
      model.hasMore = false;
      showEnd(view);
      return false;
    }

    model.allPosts.push(...posts);
    model.loadedCount += posts.length;

    if (model.loadedCount >= config.TOTAL_POSTS || posts.length < config.PAGE_SIZE) {
      model.hasMore = false;
      showEnd(view);
    }

    renderPosts(model, view);
    return true;
  } catch (err) {
    const message =
      err instanceof TypeError
        ? 'Не удалось подключиться к серверу. Проверьте интернет-соединение.'
        : `Ошибка загрузки: ${err.message}`;
    showError(view, message);
    return false;
  } finally {
    model.isLoading = false;
    hideLoader(view);
  }
}

function isNearBottom(config) {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const viewportHeight = window.innerHeight;
  const fullHeight = document.documentElement.scrollHeight;
  return scrollTop + viewportHeight >= fullHeight - config.SCROLL_THRESHOLD;
}

function updateToTopVisibility(view) {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  if (scrollTop > 400) {
    view.toTopBtn.classList.remove('hidden');
  } else {
    view.toTopBtn.classList.add('hidden');
  }
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function handleScroll(model, view, config) {
  updateToTopVisibility(view);

  if (model.isLoading || !model.hasMore) return;
  if (isNearBottom(config)) {
    await fetchNextPortion(model, view, config);
  }
}

function debounce(fn, delay) {
  let timerId = null;
  return function (...args) {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn.apply(this, args), delay);
  };
}

function applyFilter(value, model, view) {
  model.filter = value.trim().toLowerCase();
  renderPosts(model, view);
}

async function init(model, view, config) {
  renderPosts(model, view);
  await fetchNextPortion(model, view, config);

  const debouncedFilter = debounce(
    (value) => applyFilter(value, model, view),
    config.DEBOUNCE_DELAY
  );

  window.addEventListener('scroll', () => handleScroll(model, view, config), { passive: true });
  view.searchInput.addEventListener('input', (e) => debouncedFilter(e.target.value));
  view.toTopBtn.addEventListener('click', scrollToTop);

  updateToTopVisibility(view);
}

function main() {
  const config = createConfig();
  const model = createModel();
  const view = createView();

  document.addEventListener('DOMContentLoaded', () => init(model, view, config));
}

main();

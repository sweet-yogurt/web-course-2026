const API_URL = 'https://jsonplaceholder.typicode.com/posts';
const PAGE_SIZE = 10;
const TOTAL_POSTS = 100;
const SCROLL_THRESHOLD = 200;
const DEBOUNCE_DELAY = 300;

const state = {
  allPosts: [],
  loadedCount: 0,
  isLoading: false,
  hasMore: true,
  filter: '',
};




const postsContainer = document.getElementById('posts');
const loaderEl = document.getElementById('loader');
const errorEl = document.getElementById('error');
const endEl = document.getElementById('end');
const searchInput = document.getElementById('search');
const toTopBtn = document.getElementById('toTop');



function showLoader() { loaderEl.classList.remove('hidden'); }
function hideLoader() { loaderEl.classList.add('hidden'); }

function showError(message) {
  errorEl.textContent = message;
  errorEl.classList.remove('hidden');
}
function hideError() { errorEl.classList.add('hidden'); }

function showEnd() { endEl.classList.remove('hidden'); }
function hideEnd() { endEl.classList.add('hidden'); }

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getFilteredPosts() {
  if (!state.filter) return state.allPosts;
  return state.allPosts.filter(post =>
    post.title.toLowerCase().includes(state.filter)
  );
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


function renderPosts() {
  const filtered = getFilteredPosts();
  const fragment = document.createDocumentFragment();

  if (filtered.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'end';
    empty.textContent = state.filter
      ? 'Ничего не найдено по вашему запросу.'
      : 'Постов пока нет.';
    fragment.appendChild(empty);
  } else {
    filtered.forEach(post => fragment.appendChild(createPostCard(post)));
  }

  postsContainer.replaceChildren(fragment);
}


async function fetchNextPortion() {
  if (!state.hasMore || state.isLoading) return false;

  state.isLoading = true;
  showLoader();
  hideError();

  const start = state.loadedCount;
  const end = Math.min(start + PAGE_SIZE, TOTAL_POSTS);
  const url = `${API_URL}?_start=${start}&_limit=${end - start}`;

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

      state.hasMore = false;
      showEnd();
      return false;
    }

    state.allPosts.push(...posts);
    state.loadedCount += posts.length;

    if (state.loadedCount >= TOTAL_POSTS || posts.length < PAGE_SIZE) {
      state.hasMore = false;
      showEnd();
    }

    renderPosts();
    return true;
  } catch (err) {

    const message =
      err instanceof TypeError
        ? 'Не удалось подключиться к серверу. Проверьте интернет-соединение.'
        : `Ошибка загрузки: ${err.message}`;
    showError(message);

    return false;
  } finally {
    state.isLoading = false;
    hideLoader();
  }
}


function isNearBottom() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const viewportHeight = window.innerHeight;
  const fullHeight = document.documentElement.scrollHeight;
  return scrollTop + viewportHeight >= fullHeight - SCROLL_THRESHOLD;
}

async function handleScroll() {
  if (state.isLoading || !state.hasMore) return;
  if (isNearBottom()) {
    await fetchNextPortion();
  }
}

function updateToTopVisibility() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  if (scrollTop > 400) {
    toTopBtn.classList.remove('hidden');
  } else {
    toTopBtn.classList.add('hidden');
  }
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function debounce(fn, delay) {
  let timerId = null;
  return function (...args) {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn.apply(this, args), delay);
  };
}

const applyFilter = debounce((value) => {
  state.filter = value.trim().toLowerCase();
  renderPosts();
}, DEBOUNCE_DELAY);


async function init() {
  renderPosts();
  await fetchNextPortion();


  window.addEventListener('scroll', handleScroll, { passive: true });
  searchInput.addEventListener('input', (e) => applyFilter(e.target.value));
  toTopBtn.addEventListener('click', scrollToTop);

  updateToTopVisibility();
}

renderPosts();
document.addEventListener('DOMContentLoaded', init);

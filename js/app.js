import { getUser, getRepos, getFollowers } from './services/github.service.js';
import { getHistory, addToHistory, clearHistory } from './services/search-history.service.js';

const USUARIO_PADRAO = 'thyeris';

const form = document.getElementById('search-form');
const input = document.getElementById('username-input');
const result = document.getElementById('result');
const historyList = document.getElementById('history-list');
const clearHistoryButton = document.getElementById('clear-history');

const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

function renderTemplate(templateId, localId) {
  const divId = localId
    ? document.getElementById(localId)
    : result;
  const template = document.getElementById(templateId);
  const clone = template.content.cloneNode(true);
  divId.replaceChildren(clone);
}

function renderLoading() {
  renderTemplate('template-loading');
}

function renderNotFound() {
  renderTemplate('template-not-found');
}

function renderRateLimit(resetTimestamp) {
  renderTemplate('template-rate-limit');
  const timeEl = document.getElementById('rate-limit-time');
  if (resetTimestamp) {
    const resetDate = new Date(resetTimestamp * 1000);
    timeEl.dateTime = resetDate.toISOString();
    timeEl.textContent = dateTimeFormatter.format(resetDate);
  } else {
    timeEl.textContent = 'em alguns minutos';
  }
}

function renderGenericError() {
  result.replaceChildren();
  const message = document.createElement('p');
  message.className = 'state state--error';
  message.setAttribute('role', 'alert');
  message.textContent = 'Não foi possível completar a busca. Verifique sua conexão e tente novamente.';
  result.append(message);
}

function renderUser(user) {
  renderTemplate('template-user-card', 'loadbox_img-card');

  const article = document.getElementById('loadbox_img-card').querySelector('.user-card');
  const img = article.querySelector('img');
  img.src = user.avatar_url;
  img.alt = `Avatar de ${user.login}`;
  article.querySelector('.user-card__name').textContent = user.name || user.login;
  article.querySelector('.user-card__login').textContent = `@${user.login}`;

  //console.log(user)
  /* ------------------------------------------------------------------------------------------ */
  renderTemplate('template-user-repo', 'loadbox_repo-card');
  const article2 = document.getElementById('loadbox_repo-card').querySelector('.repo-list');
  article2.querySelector('.repo-list__count').textContent = user.public_repos;
  if (user.public_repos > 0) {
    renderRepos(user.login);
  }

  /* ------------------------------------------------------------------------------------------ */
  renderTemplate('template-user-followers', 'loadbox_followers-card');
  const article3 = document.getElementById('loadbox_followers-card').querySelector('.followers-grid');
  article3.querySelector('.followers-grid__count').textContent = user.followers;
  if (user.public_repos > 0) {
    renderFollowers(user.login);
  }
  
  /* ------------------------------------------------------------------------------------------ */
  renderTemplate('template-info-card', 'loadbox_info-card');
  const article4 = document.getElementById('loadbox_info-card').querySelector('.info-card');
  article4.querySelector('.info-card__name').textContent = user.name;
  article4.querySelector('.info-card__bio-text').textContent = user.bio;
}

async function renderRepos(user) {
  const repos = await getRepos(user);
  const article = document.getElementById('loadbox_repo-card').querySelector('.repo-list');
  for (const repo of repos) {
    article.querySelector('.repo-list__items').innerHTML += `
      <li class="repo-list__item">
        <a href="${repo.html_url}" target="_blank">
          <div class="repo-list__item-inner">
            <div class="repo-list__item-icon">
              <svg data-component="Octicon" aria-hidden="true" focusable="false" class="octicon octicon-mark-github" viewBox="0 0 24 24" width="32" height="32" fill="currentColor" display="inline-block" overflow="visible" style="vertical-align:text-bottom"><path d="M10.226 17.284c-2.965-.36-5.054-2.493-5.054-5.256 0-1.123.404-2.336 1.078-3.144-.292-.741-.247-2.314.09-2.965.898-.112 2.111.36 2.83 1.01.853-.269 1.752-.404 2.853-.404 1.1 0 1.999.135 2.807.382.696-.629 1.932-1.1 2.83-.988.315.606.36 2.179.067 2.942.72.854 1.101 2 1.101 3.167 0 2.763-2.089 4.852-5.098 5.234.763.494 1.28 1.572 1.28 2.807v2.336c0 .674.561 1.056 1.235.786 4.066-1.55 7.255-5.615 7.255-10.646C23.5 6.188 18.334 1 11.978 1 5.62 1 .5 6.188.5 12.545c0 4.986 3.167 9.12 7.435 10.669.606.225 1.19-.18 1.19-.786V20.63a2.9 2.9 0 0 1-1.078.224c-1.483 0-2.359-.808-2.987-2.313-.247-.607-.517-.966-1.034-1.033-.27-.023-.359-.135-.359-.27 0-.27.45-.471.898-.471.652 0 1.213.404 1.797 1.235.45.651.921.943 1.483.943.561 0 .92-.202 1.437-.719.382-.381.674-.718.944-.943"></path></svg>
            </div>
            <span class="repo-list__item-name">${repo.name}</span>
          </div>
        </a>
      </li>
    `;
  }
}

async function renderFollowers(user) {
  const repos = await getFollowers(user);
  const article = document.getElementById('loadbox_followers-card').querySelector('.followers-grid');
  for (const repo of repos) {
    article.querySelector('.followers-grid__items').innerHTML += `
      <a href="${repo.html_url}" target="_blank">
        <div class="followers-grid__item">
          <img class="followers-grid__item-img" src="${repo.avatar_url}" alt="Seguidor">
          <span class="followers-grid__item-name">${repo.login}</span>
        </div>
      </a>
    `;
  }
}

function renderHistory() {
  const items = getHistory();

  if (items.length === 0) {
    historyList.replaceChildren();
    const empty = document.createElement('li');
    empty.className = 'history__empty';
    empty.textContent = 'Nenhuma busca realizada.';
    historyList.append(empty);
    return;
  }

  const template = document.getElementById('template-history-item');
  const fragment = document.createDocumentFragment();

  for (const item of items) {
    const clone = template.content.cloneNode(true);
    const date = new Date(item.searchedAt);
    const linkButton = clone.querySelector('.history__item-label');
    linkButton.textContent = item.username;
    linkButton.addEventListener('click', () => {
      input.value = item.username;
      form.requestSubmit();
    });
    const time = clone.querySelector('.history__item-time');
    time.dateTime = date.toISOString();
    time.textContent = dateTimeFormatter.format(date);

    fragment.append(clone);
  }

  historyList.replaceChildren(fragment);
}

let numeroDaUltimaBusca = 0;

async function handleSearch(username, salvarNoHistorico = true) {
  numeroDaUltimaBusca++;
  const numeroDestaBusca = numeroDaUltimaBusca;
  renderLoading();

  try {
    const user = await getUser(username);
    if (numeroDestaBusca !== numeroDaUltimaBusca) {
      return;
    }
    renderUser(user);

    if (salvarNoHistorico) {
      addToHistory(user.login);
      renderHistory();
    }
    result.innerHTML = "";
  } catch (error) {
    if (numeroDestaBusca !== numeroDaUltimaBusca) {
      return;
    }

    if (error.usuarioNaoEncontrado) {
      renderNotFound();
    } else if (error.rateLimitAtingido) {
      renderRateLimit(error.resetTimestamp);
    } else {
      renderGenericError();
      console.error(error);
    }
  }
}

const ATRASO_DEBOUNCE = 400;
let debounceTimer;

input.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  const username = input.value.trim();
  if (!username) {
    handleSearch(USUARIO_PADRAO, false);
    return;
  }

  debounceTimer = setTimeout(() => {
    handleSearch(username);
  }, ATRASO_DEBOUNCE);
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  clearTimeout(debounceTimer);
  const username = input.value.trim();
  if (!username) return;
  handleSearch(username);
});

clearHistoryButton.addEventListener('click', () => {
  clearHistory();
  renderHistory();
});

renderHistory();
handleSearch(USUARIO_PADRAO, false);

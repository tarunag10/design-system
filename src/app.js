import {
  componentPatterns,
  createComponentRecipe,
  createTokenExport,
  filterComponentInventory,
  getContrastSummary,
  parseSavedShortlist,
  serializeSavedShortlist,
  tokens
} from './tokens.js';

const tokensMount = document.querySelector('#tokens');
const patternMount = document.querySelector('#patterns');
const patternFiltersMount = document.querySelector('#pattern-filters');
const contrastMount = document.querySelector('#contrast');
const shortlistStorageKey = 'open-access-uk.component-shortlist';
let savedShortlist = loadSavedShortlist();

function escapeHtml(value = '') {
  return value.replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);
}

tokensMount.innerHTML = `<div class="token-actions">
  <button type="button" class="secondary" id="copy-css-tokens">Copy CSS tokens</button>
  <button type="button" class="secondary" id="download-json-tokens">Download JSON tokens</button>
</div>
${Object.entries(tokens.color).map(([name, value]) => `
    <article class="card token-card">
      <span class="swatch" style="background:${value}"></span>
      <h2>${name}</h2>
      <p><code>${value}</code></p>
    </article>
  `).join('')}`;

contrastMount.innerHTML = getContrastSummary().map((item) => `
  <tr>
    <th scope="row">${item.name}</th>
    <td><code>${item.foreground}</code> on <code>${item.background}</code></td>
    <td>${item.ratio}:1</td>
    <td><span class="tag">${item.rating}</span></td>
  </tr>
`).join('');

function renderPatternFilters() {
  const types = ['all', ...new Set(componentPatterns.flatMap((pattern) => pattern.types))];
  patternFiltersMount.innerHTML = `<label for="pattern-type">Pattern type</label>
    <select id="pattern-type" name="pattern-type">
      ${types.map((type) => `<option value="${type}">${escapeHtml(type === 'all' ? 'All pattern types' : type)}</option>`).join('')}
    </select>`;
}

function renderPatterns() {
  const type = document.querySelector('#pattern-type')?.value || 'all';
  const filtered = filterComponentInventory(componentPatterns, { type });

  patternMount.innerHTML = filtered.map((pattern) => {
    const recipe = createComponentRecipe(pattern);
    return `
    <article class="card pattern-card${savedShortlist.includes(pattern.name) ? ' is-shortlisted' : ''}">
      <div class="card-header">
        <h2>${escapeHtml(pattern.name)}</h2>
        <span class="tag">${escapeHtml(pattern.status)}</span>
      </div>
      <p>${escapeHtml(pattern.detail)}</p>
      <p><strong>Use:</strong> ${escapeHtml(pattern.usage)}</p>
      <p class="type-list">${pattern.types.map((item) => `<span class="tag">${escapeHtml(item)}</span>`).join('')}</p>
      <pre><code>${escapeHtml(pattern.snippet)}</code></pre>
      <details>
        <summary>Implementation recipe</summary>
        ${recipe.groups.map((group) => `<section class="recipe-group" aria-label="${escapeHtml(group.heading)}">
          <h3>${escapeHtml(group.heading)}</h3>
          <ul>${group.items.map((item) => `<li>${escapeHtml(item.text)}</li>`).join('')}</ul>
        </section>`).join('')}
        <p><strong>Tokens:</strong> ${recipe.tokenReferences.map((token) => `<code>${escapeHtml(token)}</code>`).join(', ')}</p>
      </details>
      <div class="pattern-actions">
        <button type="button" class="copy-snippet" data-snippet="${escapeHtml(pattern.snippet)}" aria-label="Copy ${escapeHtml(pattern.name)} snippet">Copy snippet</button>
        <button type="button" class="secondary copy-recipe" data-pattern-name="${escapeHtml(pattern.name)}">Copy recipe</button>
        <button type="button" class="secondary toggle-shortlist" data-pattern-name="${escapeHtml(pattern.name)}" aria-pressed="${savedShortlist.includes(pattern.name)}">${savedShortlist.includes(pattern.name) ? 'Saved' : 'Save'}</button>
      </div>
    </article>
  `;
  }).join('');
}

function loadSavedShortlist() {
  try {
    return parseSavedShortlist(localStorage.getItem(shortlistStorageKey), componentPatterns);
  } catch {
    return [];
  }
}

function saveShortlist() {
  try {
    localStorage.setItem(shortlistStorageKey, serializeSavedShortlist(savedShortlist));
  } catch {
    // Component shortlists are best-effort when localStorage is unavailable.
  }
}

function downloadJson(filename, json) {
  const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

async function copyText(value) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const field = document.createElement('textarea');
  field.value = value;
  field.setAttribute('readonly', '');
  field.style.position = 'fixed';
  field.style.left = '-9999px';
  document.body.append(field);
  field.select();
  document.execCommand('copy');
  field.remove();
}

renderPatternFilters();
renderPatterns();
patternFiltersMount.addEventListener('change', renderPatterns);
tokensMount.addEventListener('click', async (event) => {
  const exported = createTokenExport(tokens);

  if (event.target.closest('#copy-css-tokens')) {
    await copyText(exported.css);
    event.target.textContent = 'Copied';
  }

  if (event.target.closest('#download-json-tokens')) {
    downloadJson(exported.filename, exported.json);
  }
});

patternMount.addEventListener('click', async (event) => {
  const button = event.target.closest('.copy-snippet');
  const recipeButton = event.target.closest('.copy-recipe');
  const shortlistButton = event.target.closest('.toggle-shortlist');

  if (shortlistButton) {
    const patternName = shortlistButton.dataset.patternName;
    savedShortlist = savedShortlist.includes(patternName)
      ? savedShortlist.filter((name) => name !== patternName)
      : [...savedShortlist, patternName];
    saveShortlist();
    renderPatterns();
    return;
  }

  if (recipeButton) {
    const pattern = componentPatterns.find((item) => item.name === recipeButton.dataset.patternName);
    if (!pattern) return;
    await copyText(createComponentRecipe(pattern).markdown);
    recipeButton.textContent = 'Copied';
    return;
  }

  if (!button) return;

  await copyText(button.dataset.snippet);
  button.textContent = 'Copied';
});

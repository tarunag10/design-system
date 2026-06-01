import { componentPatterns, filterComponentInventory, getContrastSummary, tokens } from './tokens.js';

const tokensMount = document.querySelector('#tokens');
const patternMount = document.querySelector('#patterns');
const patternFiltersMount = document.querySelector('#pattern-filters');
const contrastMount = document.querySelector('#contrast');

function escapeHtml(value = '') {
  return value.replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);
}

tokensMount.innerHTML = Object.entries(tokens.color).map(([name, value]) => `
  <article class="card token-card">
    <span class="swatch" style="background:${value}"></span>
    <h2>${name}</h2>
    <p><code>${value}</code></p>
  </article>
`).join('');

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

  patternMount.innerHTML = filtered.map((pattern) => `
    <article class="card pattern-card">
      <div class="card-header">
        <h2>${escapeHtml(pattern.name)}</h2>
        <span class="tag">${escapeHtml(pattern.status)}</span>
      </div>
      <p>${escapeHtml(pattern.detail)}</p>
      <p><strong>Use:</strong> ${escapeHtml(pattern.usage)}</p>
      <p class="type-list">${pattern.types.map((item) => `<span class="tag">${escapeHtml(item)}</span>`).join('')}</p>
      <pre><code>${escapeHtml(pattern.snippet)}</code></pre>
      <button type="button" class="copy-snippet" data-snippet="${escapeHtml(pattern.snippet)}" aria-label="Copy ${escapeHtml(pattern.name)} snippet">Copy snippet</button>
    </article>
  `).join('');
}

renderPatternFilters();
renderPatterns();
patternFiltersMount.addEventListener('change', renderPatterns);
patternMount.addEventListener('click', async (event) => {
  const button = event.target.closest('.copy-snippet');
  if (!button) return;

  await navigator.clipboard?.writeText(button.dataset.snippet);
  button.textContent = 'Copied';
});

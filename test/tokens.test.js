import test from 'node:test';
import assert from 'node:assert/strict';
import {
  componentPatterns,
  contrastPair,
  createComponentRecipe,
  createDesignSystemHandoff,
  createLocalActionPack,
  createTokenExport,
  currentGuidance,
  filterComponentInventory,
  getContrastSummary,
  parseSavedShortlist,
  serializeSavedShortlist,
  tokens
} from '../src/tokens.js';

test('defines high contrast civic design tokens', () => {
  assert.equal(tokens.radius.card, '8px');
  assert.ok(contrastPair(tokens.color.text, tokens.color.background) >= 7);
});

test('exposes civic LegalTech component patterns', () => {
  assert.deepEqual(componentPatterns.map((pattern) => pattern.name), [
    'Risk card',
    'Client intake',
    'Document upload',
    'Complaint timeline',
    'Escalation panel'
  ]);
});

test('summarises token contrast checks for demos', () => {
  const summaries = getContrastSummary();
  assert.ok(summaries.some((item) => item.name === 'Primary action' && item.rating === 'AAA'));
  assert.ok(summaries.every((item) => typeof item.ratio === 'number'));
});

test('adds reusable component inventory metadata and usage notes', () => {
  const intake = componentPatterns.find((pattern) => pattern.name === 'Client intake');

  assert.deepEqual(intake.types, ['intake']);
  assert.ok(intake.snippet.includes('<fieldset'));
  assert.ok(intake.usage.includes('safe-contact'));
});

test('filters component inventory by pattern type', () => {
  assert.deepEqual(filterComponentInventory(componentPatterns, { type: 'risk' }).map((pattern) => pattern.name), [
    'Risk card'
  ]);
  assert.deepEqual(filterComponentInventory(componentPatterns, { type: 'document' }).map((pattern) => pattern.name), [
    'Document upload'
  ]);
  assert.deepEqual(filterComponentInventory(componentPatterns, { type: 'timeline' }).map((pattern) => pattern.name), [
    'Complaint timeline'
  ]);
  assert.equal(filterComponentInventory(componentPatterns, { type: 'all' }).length, componentPatterns.length);
});

test('exports design tokens as CSS custom properties and JSON', () => {
  const exported = createTokenExport(tokens);

  assert.equal(exported.filename, 'open-access-uk-tokens.json');
  assert.ok(exported.css.includes(':root {'));
  assert.ok(exported.css.includes('  --color-blue: #003078;'));
  assert.ok(exported.css.includes('  --space-md: 16px;'));
  assert.equal(JSON.parse(exported.json).color.blue, '#003078');
});

test('serializes component shortlist safely for localStorage', () => {
  const saved = serializeSavedShortlist(['Risk card', 'Risk card', 'Document upload', 123, '']);

  assert.deepEqual(JSON.parse(saved), ['Risk card', 'Document upload']);
  assert.deepEqual(parseSavedShortlist(saved, componentPatterns), ['Risk card', 'Document upload']);
  assert.deepEqual(parseSavedShortlist('["Missing pattern"]', componentPatterns), []);
  assert.deepEqual(parseSavedShortlist('{broken', componentPatterns), []);
});

test('creates implementation recipes with accessibility, retention, and token guidance', () => {
  const recipe = createComponentRecipe(componentPatterns.find((pattern) => pattern.name === 'Document upload'));

  assert.equal(recipe.title, 'Document upload implementation recipe');
  assert.ok(recipe.checklist.some((item) => item.category === 'Accessibility' && item.text.includes('label')));
  assert.ok(recipe.checklist.some((item) => item.category === 'Evidence and retention' && item.text.includes('retention')));
  assert.ok(recipe.tokenReferences.includes('--color-blue'));
  assert.ok(recipe.tokenReferences.includes('--focus-outline'));
});

test('formats component recipes as copyable markdown and plain text', () => {
  const recipe = createComponentRecipe(componentPatterns.find((pattern) => pattern.name === 'Risk card'));

  assert.ok(recipe.markdown.startsWith('# Risk card implementation recipe'));
  assert.ok(recipe.markdown.includes('## Accessibility requirements'));
  assert.ok(recipe.markdown.includes('- [ ] Do not rely on colour alone'));
  assert.ok(recipe.markdown.includes('Token references:'));
  assert.ok(recipe.plain.includes('Risk card implementation recipe'));
  assert.ok(recipe.plain.includes('Evidence and retention'));
});

test('creates a design system handoff with tokens and component recipes', () => {
  const handoff = createDesignSystemHandoff(componentPatterns.slice(0, 2), tokens);

  assert.equal(handoff.title, 'Open Access design system handoff');
  assert.match(handoff.markdown, /^# Open Access design system handoff/m);
  assert.match(handoff.markdown, /## Release checks/);
  assert.match(handoff.markdown, /Current source notes/);
  assert.match(handoff.markdown, /WCAG 2\.2 AA/);
  assert.match(handoff.markdown, /```css/);
  assert.match(handoff.markdown, /--color-blue/);
  assert.match(handoff.markdown, /### Risk card/);
  assert.match(handoff.markdown, /### Client intake/);
});

test('creates local action packs for shortlisted design patterns', () => {
  const pack = createLocalActionPack(
    componentPatterns,
    ['Document upload', 'Escalation panel'],
    { service: 'Housing repairs triage' }
  );

  assert.equal(pack.title, 'Housing repairs triage local action pack');
  assert.deepEqual(pack.patternNames, ['Document upload', 'Escalation panel']);
  assert.deepEqual(pack.sections.map((section) => section.heading), [
    'Pattern decisions',
    'Local handoff',
    'Review evidence'
  ]);
  assert.ok(pack.sections[0].items.some((item) => item.includes('Document upload')));
  assert.ok(pack.sections[1].items.some((item) => item.includes('Service owner')));
  assert.ok(pack.tokenReferences.includes('--color-blue'));
  assert.ok(pack.tokenReferences.includes('--focus-outline'));
  assert.match(pack.markdown, /^# Housing repairs triage local action pack/m);
  assert.match(pack.markdown, /Generated locally in the browser/);
  assert.match(pack.markdown, /Keyboard and focus evidence/);
});

test('exposes current design and accessibility guidance sources', () => {
  assert.equal(currentGuidance.length, 4);
  assert.ok(currentGuidance.some((item) => item.detail.includes('v6.1.0')));
  assert.ok(currentGuidance.some((item) => item.detail.includes('WCAG 2.2')));
  assert.ok(currentGuidance.every((item) => item.url.startsWith('https://')));
});

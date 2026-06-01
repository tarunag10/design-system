import test from 'node:test';
import assert from 'node:assert/strict';
import {
  componentPatterns,
  contrastPair,
  createComponentRecipe,
  createTokenExport,
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

export const tokens = {
  color: {
    background: '#ffffff',
    text: '#18212f',
    muted: '#526071',
    line: '#cfd8e3',
    surface: '#f3f7fb',
    blue: '#003078',
    green: '#0b6b3a',
    amber: '#8a5a00',
    red: '#b42318',
    focus: '#ffdd00'
  },
  radius: { card: '8px', control: '6px', chip: '999px' },
  space: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '36px' },
  type: { body: '1rem', small: '0.9rem', h2: '1.45rem' },
  focus: { outline: '4px solid #ffdd00', offset: '2px' }
};

export const currentGuidance = [
  {
    title: 'WCAG 2.2 AA is the current public-sector target',
    detail: 'GOV.UK accessibility guidance says public sector websites and apps should meet WCAG 2.2 level AA unless a valid exception applies.',
    source: 'GOV.UK accessibility requirements',
    url: 'https://www.gov.uk/guidance/accessibility-requirements-for-public-sector-websites-and-apps'
  },
  {
    title: 'Design systems still need service testing',
    detail: 'The GOV.UK Design System accessibility strategy says compliant components help, but the full service still needs accessible research, design, development and testing.',
    source: 'GOV.UK Design System accessibility strategy',
    url: 'https://design-system.service.gov.uk/accessibility/accessibility-strategy/'
  },
  {
    title: 'GOV.UK Frontend is actively maintained',
    detail: 'The GOV.UK Design System homepage notes GOV.UK Frontend v6.1.0 was released on 2 March 2026, useful context for teams checking dependency freshness.',
    source: 'GOV.UK Design System',
    url: 'https://design-system.service.gov.uk/'
  },
  {
    title: 'Contrast remains a named WCAG check',
    detail: 'GOV.UK colour guidance ties text and interactive element contrast to WCAG 2.2 success criterion 1.4.3 Contrast (Minimum), level AA.',
    source: 'GOV.UK Design System colour',
    url: 'https://design-system.service.gov.uk/styles/colour/'
  }
];

function luminance(hex) {
  const rgb = hex.match(/[a-f0-9]{2}/gi)
    .map((value) => parseInt(value, 16) / 255)
    .map((value) => (value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4)));
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

export function contrastPair(a, b) {
  const x = luminance(a);
  const y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

export function getContrastSummary() {
  return [
    { name: 'Body text', foreground: tokens.color.text, background: tokens.color.background },
    { name: 'Primary action', foreground: '#ffffff', background: tokens.color.blue },
    { name: 'Error text', foreground: tokens.color.red, background: tokens.color.background },
    { name: 'Success text', foreground: tokens.color.green, background: tokens.color.background },
    { name: 'Focus indicator', foreground: tokens.color.text, background: tokens.color.focus }
  ].map((item) => {
    const ratio = Number(contrastPair(item.foreground, item.background).toFixed(2));
    return { ...item, ratio, rating: ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : 'Review' };
  });
}

export const componentPatterns = [
  {
    name: 'Risk card',
    status: 'High priority',
    types: ['risk', 'escalation'],
    detail: 'Summarises deadline, vulnerability, evidence gap, and next action without relying on colour alone.',
    usage: 'Use when a case or service journey needs a visible risk label, deadline, evidence gap, and next action.',
    snippet: '<article class="risk-card" aria-labelledby="risk-title"><h2 id="risk-title">High risk deadline</h2><p>Appeal by 14 June and upload medical evidence.</p></article>'
  },
  {
    name: 'Client intake',
    status: 'Form pattern',
    types: ['intake'],
    detail: 'Uses visible labels, optional communication needs, interpreter support, and safe-contact preferences.',
    usage: 'Capture only the minimum data needed, then ask safe-contact and accessibility questions before any free-text details.',
    snippet: '<fieldset><legend>Safe-contact preference</legend><label><input type="radio" name="safe-contact"> Phone is safe</label><label><input type="radio" name="safe-contact"> Email only</label></fieldset>'
  },
  {
    name: 'Document upload',
    status: 'Evidence flow',
    types: ['document'],
    detail: 'Shows file type, size, retention notice, upload state, and a non-digital fallback route.',
    usage: 'Pair upload controls with accepted formats, file size, retention wording, and a non-digital fallback.',
    snippet: '<label for="evidence-file">Upload evidence</label><p id="evidence-hint">PDF, JPG, PNG, or DOCX. Maximum 10 MB.</p><input id="evidence-file" type="file" aria-describedby="evidence-hint">'
  },
  {
    name: 'Complaint timeline',
    status: 'Case history',
    types: ['timeline'],
    detail: 'Presents dates, responsible organisation, current stage, and overdue markers in a keyboard-readable list.',
    usage: 'Use ordered lists for case history so dates, owners, stages, and overdue markers remain keyboard-readable.',
    snippet: '<ol class="timeline"><li><time datetime="2026-06-01">1 June 2026</time><strong>Complaint sent</strong><p>Council housing team received repair evidence.</p></li></ol>'
  },
  {
    name: 'Escalation panel',
    status: 'Advice handoff',
    types: ['escalation'],
    detail: 'Highlights review rights, deadlines, adviser notes, and safe signposting to emergency or regulated help.',
    usage: 'Show review rights, deadlines, and signposting together when the next step may require regulated or emergency help.',
    snippet: '<aside class="escalation-panel"><h2>Escalate this case</h2><p>Check review rights, deadline, and emergency support before sending.</p></aside>'
  }
];

export function filterComponentInventory(components, filters = {}) {
  const type = filters.type && filters.type !== 'all' ? filters.type : null;
  return components.filter((component) => !type || (component.types || []).includes(type));
}

function flattenTokenEntries(tokenSet, prefix = []) {
  return Object.entries(tokenSet).flatMap(([key, value]) => {
    const path = [...prefix, key];
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return flattenTokenEntries(value, path);
    }

    return [{ name: `--${path.join('-')}`, value }];
  });
}

export function createTokenExport(tokenSet = tokens) {
  const declarations = flattenTokenEntries(tokenSet)
    .map((item) => `  ${item.name}: ${item.value};`)
    .join('\n');

  return {
    filename: 'open-access-uk-tokens.json',
    css: `:root {\n${declarations}\n}\n`,
    json: `${JSON.stringify(tokenSet, null, 2)}\n`
  };
}

const baseAccessibilityRequirements = [
  'Use semantic HTML before adding ARIA.',
  'Keep visible labels, instructions, and error recovery next to the control or component.',
  'Preserve keyboard order and the visible focus indicator.'
];

const recipeRequirementsByName = {
  'Risk card': [
    'Do not rely on colour alone for risk level or deadline state.',
    'Use a heading that names the risk and include the next action in text.'
  ],
  'Client intake': [
    'Use fieldsets and legends for grouped safe-contact and consent questions.',
    'Ask communication needs before long free-text sections.'
  ],
  'Document upload': [
    'Connect the file input label, accepted formats, size limit, and error text with aria-describedby.',
    'Provide a non-digital fallback route before upload failure states.'
  ],
  'Complaint timeline': [
    'Use an ordered list and machine-readable time elements for dated events.',
    'Include responsible organisation and current stage in text.'
  ],
  'Escalation panel': [
    'Use an aside only when the panel supports the surrounding task.',
    'Include emergency or regulated-help signposting as plain text.'
  ]
};

function tokenNamesForRecipe(pattern = {}) {
  const shared = ['--color-text', '--color-background', '--color-line', '--focus-outline', '--focus-offset'];
  const byType = {
    risk: ['--color-red', '--color-amber'],
    escalation: ['--color-blue', '--color-red'],
    intake: ['--color-blue', '--space-md'],
    document: ['--color-blue', '--space-md'],
    timeline: ['--color-muted', '--space-lg']
  };
  const typed = (pattern.types || []).flatMap((type) => byType[type] || []);

  return [...new Set([...shared, ...typed, '--radius-card', '--radius-control'])];
}

function checklistForPattern(pattern = {}) {
  return [
    ...baseAccessibilityRequirements.map((text) => ({ category: 'Accessibility', text })),
    ...(recipeRequirementsByName[pattern.name] || []).map((text) => ({ category: 'Accessibility', text })),
    {
      category: 'Evidence and retention',
      text: 'Record keyboard, screen-reader, colour-contrast, and error-state evidence before release.'
    },
    {
      category: 'Evidence and retention',
      text: 'Name the retention policy for user evidence, how long it is kept, and the fallback route when digital evidence is unavailable.'
    },
    {
      category: 'Tokens',
      text: `Use token references ${tokenNamesForRecipe(pattern).join(', ')} instead of one-off component values.`
    }
  ];
}

function recipeSectionTitle(category) {
  if (category === 'Accessibility') return 'Accessibility requirements';
  if (category === 'Evidence and retention') return 'Evidence and retention';
  return 'Token references';
}

function groupChecklist(checklist) {
  return ['Accessibility', 'Evidence and retention', 'Tokens']
    .map((category) => ({
      category,
      heading: recipeSectionTitle(category),
      items: checklist.filter((item) => item.category === category)
    }))
    .filter((group) => group.items.length);
}

function formatRecipeMarkdown(title, pattern, groups, tokenReferences) {
  const lines = [
    `# ${title}`,
    '',
    pattern.usage || pattern.detail || '',
    ''
  ];

  for (const group of groups) {
    lines.push(`## ${group.heading}`);
    for (const item of group.items) {
      lines.push(`- [ ] ${item.text}`);
    }
    lines.push('');
  }

  lines.push('Token references:');
  tokenReferences.forEach((token) => lines.push(`- \`${token}\``));
  lines.push('', 'Starter snippet:', '```html', pattern.snippet || '', '```');

  return `${lines.join('\n').trimEnd()}\n`;
}

function formatRecipePlain(title, pattern, groups, tokenReferences) {
  const lines = [title, pattern.usage || pattern.detail || '', ''];

  for (const group of groups) {
    lines.push(group.heading);
    group.items.forEach((item, index) => lines.push(`${index + 1}. ${item.text}`));
    lines.push('');
  }

  lines.push(`Token references: ${tokenReferences.join(', ')}`);
  lines.push(`Starter snippet: ${pattern.snippet || ''}`);

  return `${lines.join('\n').trimEnd()}\n`;
}

export function createComponentRecipe(pattern = {}) {
  const title = `${pattern.name || 'Component'} implementation recipe`;
  const checklist = checklistForPattern(pattern);
  const groups = groupChecklist(checklist);
  const tokenReferences = tokenNamesForRecipe(pattern);

  return {
    title,
    patternName: pattern.name || 'Component',
    checklist,
    groups,
    tokenReferences,
    markdown: formatRecipeMarkdown(title, pattern, groups, tokenReferences),
    plain: formatRecipePlain(title, pattern, groups, tokenReferences)
  };
}

export function createDesignSystemHandoff(patterns = componentPatterns, tokenSet = tokens) {
  const exported = createTokenExport(tokenSet);
  const recipes = patterns.map((pattern) => createComponentRecipe(pattern));

  return {
    title: 'Open Access design system handoff',
    markdown: [
      '# Open Access design system handoff',
      '',
      'Generated locally in the browser. Nothing was sent to a server.',
      '',
      '## Release checks',
      '- [ ] Use semantic HTML before ARIA.',
      '- [ ] Verify keyboard focus, contrast, labels, errors, and reduced-motion behaviour.',
      '- [ ] Record evidence and retention notes for user-submitted documents.',
      '- [ ] Check current WCAG 2.2 AA expectations and publish/update an accessibility statement where required.',
      '',
      '## Current source notes',
      ...currentGuidance.map((item) => `- ${item.title}: ${item.detail} Source: ${item.url}`),
      '',
      '## CSS tokens',
      '```css',
      exported.css.trim(),
      '```',
      '',
      '## Component recipes',
      ...recipes.flatMap((recipe) => [
        `### ${recipe.patternName}`,
        ...recipe.groups.flatMap((group) => [
          `#### ${group.heading}`,
          ...group.items.map((item) => `- [ ] ${item.text}`)
        ]),
        `Tokens: ${recipe.tokenReferences.join(', ')}`,
        ''
      ])
    ].join('\n')
  };
}

export function serializeSavedShortlist(names = []) {
  const uniqueNames = [...new Set(names.filter((name) => typeof name === 'string' && name.trim()))];
  return JSON.stringify(uniqueNames);
}

export function parseSavedShortlist(value, components = componentPatterns) {
  try {
    const parsed = JSON.parse(value || '[]');
    if (!Array.isArray(parsed)) return [];

    const allowedNames = new Set(components.map((component) => component.name));
    return [...new Set(parsed.filter((name) => typeof name === 'string' && allowedNames.has(name)))];
  } catch {
    return [];
  }
}

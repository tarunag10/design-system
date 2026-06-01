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

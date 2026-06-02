# Open Access Design System

Accessible components, tokens, and public-service UI patterns for LegalTech and civic products.

## Included details

- Colour, spacing, radius, type, and focus tokens in `src/tokens.js`
- Contrast helper output for common foreground/background pairs
- Component inventory metadata for risk cards, client intake, document upload, complaint timelines, and escalation panels
- Copyable HTML snippets and usage notes for each component pattern
- `filterComponentInventory(components, { type })` for filtering by `intake`, `document`, `timeline`, `escalation`, or `risk`
- `createTokenExport(tokens)` for CSS custom properties and formatted JSON token exports
- `createLocalActionPack(patterns, selectedNames, options)` for turning shortlisted patterns into a service-team review and handoff pack
- `serializeSavedShortlist(names)` and `parseSavedShortlist(value, components)` for localStorage-safe component favourites
- Demo controls for copying CSS tokens, copying a local action pack, downloading JSON tokens, and saving component shortlist items locally
- Static demo rendering in `src/app.js`, with no backend or analytics dependency

## Design principles

- Keep cards at 8px radius or less.
- Use visible focus outlines and semantic HTML before custom ARIA.
- Pair colour with text labels for risk, urgency, and status.
- Show evidence requirements, retention/fallback notes, and next actions in plain English.

## Demo

Open `index.html` in a browser. This repository is intentionally no-backend and keeps user data local to the browser.

## Open-source basics

- Code: MIT licence
- Content/templates: use with attribution under CC BY 4.0 where marked
- Accessibility target: WCAG 2.2 AA
- Contributions: start with issues labelled `good first issue`

## Safety note

This project provides information and drafting support, not legal advice. Users should check deadlines, local rules, and professional advice where needed.

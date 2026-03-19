import { div, a, span } from '../../scripts/dom-helpers.js';

function getTextFromSelector(block, selector) {
  const el = block.querySelector(selector);
  if (!el) return '';
  const text = (el.textContent || '').trim();
  return text;
}

export default function decorate(block) {
  /* Read from AUE props first (author/live), then fallback to index-based for sheet content */
  const linkEl = block.querySelector('a[href]');
  const buttonLink = linkEl?.getAttribute('href')?.trim() || '#';

  const buttonLabel = getTextFromSelector(block, '[data-aue-prop="label"]')
    || getTextFromSelector(block, '[data-aue-prop="title"]')
    || getTextFromSelector(block, 'p')
    || 'Button';

  const buttonTitle = getTextFromSelector(block, '[data-aue-prop="title"]') || '';

  const buttonStyle = (getTextFromSelector(block, '[data-aue-prop="style"]') || 'default-button').trim()
    || 'default-button';

  const buttonElement = div({ class: `button-container ${buttonStyle}` },
    a({
      href: buttonLink,
      class: 'button',
      title: buttonTitle || buttonLabel
    },
      span({ class: 'button-text' }, buttonLabel)
    )
  );

  /* Replace all block content with the single button so AUE metadata never shows (author + live) */
  block.replaceChildren(buttonElement);
}
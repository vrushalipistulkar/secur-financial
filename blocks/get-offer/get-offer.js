/**
 * Get Offer block – email input and "Get offer" button.
 * No click handler on the button for now.
 */

export default async function decorate(block) {
  const rows = [...block.children];
  const placeholder = rows[0]?.textContent?.trim() || 'me@adobetest.com';
  const buttonLabel = rows[1]?.textContent?.trim() || 'Get offer';

  block.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'get-offer-wrapper';

  const input = document.createElement('input');
  input.type = 'email';
  input.name = 'email';
  input.placeholder = placeholder;
  input.className = 'get-offer-input';
  input.setAttribute('aria-label', 'Email address');

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'get-offer-button button';
  button.textContent = buttonLabel;
  // No click handler for now

  wrapper.append(input, button);
  block.append(wrapper);
}

import { createOptimizedPicture } from '../../scripts/aem.js';
import { isAuthorEnvironment } from '../../scripts/scripts.js';

const FALLBACK_PRODUCT = {
  id: 'f0I76hY77',
  name: 'Checking Account',
  category: 'Accounts',
  description: '<p>Easy, anytime access.</p><ul><li>Convenient ways to pay</li><li>24/7 security</li><li>Smart money management tools</li><li>Fraud protection</li></ul>',
  sku: 'f0I76hY77',
  image: 'https://main--demo-boilerplate--lamontacrook.hlx.page/en/media_1f909a9ffb576222b96b4fdf875def856037efc95.png',
};

const AUTHOR_PRODUCT_ENDPOINT = 'https://author-p159983-e1710854.adobeaemcloud.com/graphql/execute.json/secur-financial/product-card-information';
const PUBLISH_PRODUCT_ENDPOINT = 'https://275323-918sangriatortoise.adobeioruntime.net/api/v1/web/dx-excshell-1/secure-financial-product-card-information';
const PUBLISH_ENVIRONMENT = 'p159983-e1710854';

function resolvePath(obj, path) {
  if (!obj || !path) return undefined;
  const tokens = path.split('.');
  let current = obj;
  for (let token of tokens) {
    if (token === '') continue;
    const arrayMatch = token.match(/^(.+?)\[(\d+)\]$/);
    if (arrayMatch) {
      const [, key, idx] = arrayMatch;
      current = current?.[key];
      if (!Array.isArray(current)) return undefined;
      current = current[Number(idx)];
    } else {
      current = current?.[token];
    }
    if (current === undefined || current === null) return current;
  }
  return current;
}

function normalizeImageUrl(value) {
  if (!value) return undefined;
  let url = typeof value === 'string' ? value : value?._publishUrl || value?._authorUrl || value?._dynamicUrl || value?.url;
  if (!url) return undefined;
  try {
    return new URL(url, window.location.href).href;
  } catch (error) {
    return url;
  }
}

function pickProductFromResponse(payload) {
  if (!payload) return undefined;

  const fallbackPaths = [
    'data.productCardByPath.item',
    'data.productByPath.item',
    'data.productCard.item',
    'data.productCard',
    'data.product',
    'product',
    'item',
    'items[0]',
  ];

  for (const path of fallbackPaths) {
    const resolved = resolvePath(payload, path);
    if (resolved) {
      if (Array.isArray(resolved)) {
        if (resolved.length) return resolved[0];
        continue;
      }
      return resolved;
    }
  }

  if (Array.isArray(payload)) return payload[0];
  return payload;
}

async function fetchProductData() {
  const isAuthor = isAuthorEnvironment();
  const requestUrl = isAuthor
    ? `${AUTHOR_PRODUCT_ENDPOINT};ts=${Date.now()}`
    : `${PUBLISH_PRODUCT_ENDPOINT}?environment=${PUBLISH_ENVIRONMENT}&time=${Date.now()}`;

  try {
    const response = await fetch(requestUrl, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
    const payload = await response.json();
    const rawProduct = pickProductFromResponse(payload);
    if (!rawProduct) return FALLBACK_PRODUCT;
    return {
      id: rawProduct?.id || rawProduct?.sku || FALLBACK_PRODUCT.id,
      name: rawProduct?.name || rawProduct?.title || FALLBACK_PRODUCT.name,
      category: rawProduct?.category || FALLBACK_PRODUCT.category,
      description: rawProduct?.description || FALLBACK_PRODUCT.description,
      sku: rawProduct?.sku || rawProduct?.id || FALLBACK_PRODUCT.sku,
      image: normalizeImageUrl(rawProduct?.image) || normalizeImageUrl(rawProduct?.bannerimage) || FALLBACK_PRODUCT.image,
    };
  } catch (error) {
    /* eslint-disable-next-line no-console */
    console.error('Product card API fetch failed', error);
    return FALLBACK_PRODUCT;
  }
}

function appendProductIdToButton(buttonConfig, product) {
  if (!buttonConfig?.node || !product?.sku) return buttonConfig;
  const anchor = buttonConfig.node.querySelector('a');
  if (!anchor) return buttonConfig;
  const productId = String(product.sku || product.id || '').trim();
  if (!productId) return buttonConfig;
  try {
    const url = new URL(anchor.href || window.location.href);
    url.searchParams.set('productId', productId);
    anchor.href = url.href;
  } catch (error) {
    const encodedId = encodeURIComponent(productId);
    const href = anchor.href || '';
    const separator = href.includes('?') ? '&' : '?';
    anchor.href = `${href}${separator}productId=${encodedId}`;
  }
  return buttonConfig;
}

function createCard(product, buttonConfig) {
  const photo = document.createElement('div');
  photo.className = 'product-card-image';
  const imageUrl = normalizeImageUrl(product.image);
  if (imageUrl) {
    const picture = createOptimizedPicture(imageUrl, product.name || '', false, [{ width: '1200' }, { width: '750' }]);
    photo.appendChild(picture);
  } else {
    photo.classList.add('product-card-image--hidden');
  }

  const body = document.createElement('div');
  body.className = 'product-card-body';
  const category = document.createElement('p');
  category.className = 'product-card-category';
  category.textContent = product.category || '';

  const name = document.createElement('h3');
  name.textContent = product.name || 'Product';

  const description = document.createElement('div');
  description.className = 'product-card-description';
  if (product.description) description.innerHTML = product.description;

  body.append(category, name, description);

  const li = document.createElement('li');
  li.append(photo, body);
  if (buttonConfig?.node) body.appendChild(buttonConfig.node);
  return li;
}

function createButtonFromConfig(config) {
  if (!config || (!config.text && !config.link)) return null;
  const container = document.createElement('p');
  container.className = 'button-container';
  if (config.style) container.classList.add(config.style);
  if (config.customStyles) {
    config.customStyles.split(/[\s,]+/).forEach((part) => {
      const cls = part.trim();
      if (cls) container.classList.add(cls);
    });
  }
  const anchor = document.createElement('a');
  anchor.textContent = config.text || 'Learn more';
  if (config.link) anchor.href = config.link;
  if (config.eventType) anchor.dataset.buttonEventType = config.eventType;
  if (config.webhook) anchor.dataset.buttonWebhookUrl = config.webhook;
  if (config.formId) anchor.dataset.buttonFormId = config.formId;
  if (config.buttonData) anchor.dataset.buttonData = config.buttonData;
  if (config.openInNewTab) anchor.rel = 'noreferrer noopener';
  if (config.customAttributes) {
    Object.entries(config.customAttributes).forEach(([key, value]) => {
      anchor.dataset[key] = value;
    });
  }
  container.appendChild(anchor);
  return { node: container };
}

export default async function decorate(block) {
  const rowValue = (n) => {
    const row = block.querySelector(`:scope > div:nth-child(${n})`);
    if (!row?.children?.length) return undefined;
    const cell = row.children[1] ?? row.children[0];
    if (!cell) return undefined;
    const anchors = [...cell.querySelectorAll('a')];
    if (anchors.length === 1) {
      return anchors[0].href || anchors[0].textContent?.trim();
    }
    if (anchors.length > 1) {
      return anchors.map((anchor) => anchor.href || anchor.textContent?.trim());
    }
    const paragraphs = [...cell.querySelectorAll('p')];
    if (paragraphs.length === 1) return paragraphs[0].textContent?.trim();
    if (paragraphs.length) return paragraphs.map((p) => p.textContent?.trim());
    return cell.textContent?.trim();
  };
  const rowLabel = (n) => block.querySelector(`:scope > div:nth-child(${n})`)?.children?.[0]?.textContent?.trim()?.toLowerCase();
  const firstRowIsContentFragment = rowLabel(1)?.includes('content fragment');
  const offset = firstRowIsContentFragment ? 1 : 0;
  const buttonText = rowValue(offset + 1);
  const buttonStyle = rowValue(offset + 2) || 'default';
  const buttonLinkValue = rowValue(offset + 3);
  const buttonEventType = rowValue(offset + 6);
  const buttonWebhookUrl = rowValue(offset + 7);
  const buttonFormId = rowValue(offset + 8);
  const buttonData = rowValue(offset + 9);
  const buttonCustomStyles = rowValue(offset + 10);
  const linkRow = block.querySelector(`:scope > div:nth-child(${offset + 3})`);
  const ctaLink = linkRow?.querySelector('a.cta, a') || block.querySelector('a.cta, a');
  const buttonConfig = createButtonFromConfig({
    text: buttonText ?? ctaLink?.textContent?.trim(),
    link: buttonLinkValue ?? ctaLink?.href,
    eventType: buttonEventType ?? ctaLink?.dataset?.buttonEventType,
    webhook: buttonWebhookUrl ?? ctaLink?.dataset?.buttonWebhookUrl,
    formId: buttonFormId ?? ctaLink?.dataset?.buttonFormId,
    buttonData: buttonData ?? ctaLink?.dataset?.buttonData,
    style: buttonStyle,
    customStyles: buttonCustomStyles,
    customAttributes: ctaLink ? { ...ctaLink.dataset } : null,
  });
  [...block.children].forEach((row) => row.remove());
  block.classList.add('product-card-block');
  block.innerHTML = '';

  const product = await fetchProductData();

  const wrapper = document.createElement('div');
  wrapper.className = 'cards product-card-block';
  const list = document.createElement('ul');
  const productButtonConfig = appendProductIdToButton(buttonConfig, product);
  list.append(createCard(product, productButtonConfig));
  wrapper.append(list);
  block.append(wrapper);
}

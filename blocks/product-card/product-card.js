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

function createCard(product) {
  const photo = document.createElement('div');
  photo.className = 'product-card-image';
  const imageUrl = normalizeImageUrl(product.image) || FALLBACK_PRODUCT.image;
  const picture = createOptimizedPicture(imageUrl, product.name || '', false, [{ width: '1200' }, { width: '750' }]);
  photo.appendChild(picture);

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

  const sku = document.createElement('p');
  sku.className = 'product-card-sku';
  sku.textContent = `SKU: ${product.sku || product.id || ''}`;

  body.append(category, name, description, sku);

  const li = document.createElement('li');
  li.append(photo, body);
  return li;
}

export default async function decorate(block) {
  [...block.children].forEach((row) => row.remove());
  block.classList.add('product-card-block');
  block.innerHTML = '';

  const product = await fetchProductData();

  const wrapper = document.createElement('div');
  wrapper.className = 'cards product-card-block';
  const list = document.createElement('ul');
  list.append(createCard(product));
  wrapper.append(list);
  block.append(wrapper);
}

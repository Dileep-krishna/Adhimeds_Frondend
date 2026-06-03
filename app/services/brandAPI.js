import SERVERURL from './serverURL';

async function handleResponse(res, endpoint) {
  console.log(`🌐 ${endpoint} - Response status: ${res.status}`);
  const text = await res.text();
  console.log(`📄 ${endpoint} - Response body preview:`, text.substring(0, 300));
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error(`❌ ${endpoint} - Failed to parse JSON. Raw response:`, text);
    throw new Error('Server returned invalid JSON');
  }
}

// Get all brands
export const getAllBrands = async () => {
  const url = `${SERVERURL}/brands`;
  console.log(`📡 GET ${url}`);
  const res = await fetch(url);
  return handleResponse(res, 'GET /brands');
};

// Get single brand
export const getBrandById = async (brandId) => {
  const url = `${SERVERURL}/brands/${brandId}`;
  console.log(`📡 GET ${url}`);
  const res = await fetch(url);
  return handleResponse(res, `GET /brands/${brandId}`);
};

// Create brand
export const createBrand = async (brandData) => {
  const url = `${SERVERURL}/brands`;
  console.log(`📡 POST ${url}`);

  let body = brandData;
  let headers = {};

  if (!(brandData instanceof FormData)) {
    // If for some reason it's not FormData, convert to JSON
    body = JSON.stringify(brandData);
    headers = { 'Content-Type': 'application/json' };
  }

  const res = await fetch(url, {
    method: 'POST',
    body,
    headers,
  });
  return handleResponse(res, 'POST /brands');
};

// Update brand
export const updateBrand = async (brandId, brandData) => {
  const url = `${SERVERURL}/brands/${brandId}`;
  console.log(`📡 PUT ${url}`);

  let body = brandData;
  let headers = {};

  if (!(brandData instanceof FormData)) {
    body = JSON.stringify(brandData);
    headers = { 'Content-Type': 'application/json' };
  }

  const res = await fetch(url, {
    method: 'PUT',
    body,
    headers,
  });
  return handleResponse(res, `PUT /brands/${brandId}`);
};

// Delete brand
export const deleteBrand = async (brandId) => {
  const url = `${SERVERURL}/brands/${brandId}`;
  console.log(`📡 DELETE ${url}`);
  const res = await fetch(url, { method: 'DELETE' });
  return handleResponse(res, `DELETE /brands/${brandId}`);
};
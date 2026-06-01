import SERVERURL from './serverURL';

// Helper to log and parse responses
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

// ========== BRAND CRUD ==========

// Get all brands
export const getAllBrands = async () => {
  const url = `${SERVERURL}/brands`;
  console.log(`📡 GET ${url}`);
  const res = await fetch(url);
  return handleResponse(res, 'GET /brands');
};

// Get a single brand by ID
export const getBrandById = async (brandId) => {
  const url = `${SERVERURL}/brands/${brandId}`;
  console.log(`📡 GET ${url}`);
  const res = await fetch(url);
  return handleResponse(res, `GET /brands/${brandId}`);
};

// Create a new brand (with logo file)
export const createBrand = async (brandData) => {
  const url = `${SERVERURL}/brands`;
  console.log(`📡 POST ${url} (FormData)`);

  const formData = new FormData();
  formData.append('name', brandData.name);
  if (brandData.logo) formData.append('logo', brandData.logo);
  if (brandData.category) formData.append('category', brandData.category);
  if (brandData.metaTitle) formData.append('metaTitle', brandData.metaTitle);
  if (brandData.metaDescription) formData.append('metaDescription', brandData.metaDescription);
  if (brandData.metaKeywords) formData.append('metaKeywords', brandData.metaKeywords);

  const res = await fetch(url, {
    method: 'POST',
    body: formData, // do NOT set Content-Type – browser sets it with boundary
  });
  return handleResponse(res, 'POST /brands');
};

// Update an existing brand (with optional logo file)
export const updateBrand = async (brandId, brandData) => {
  const url = `${SERVERURL}/brands/${brandId}`;
  console.log(`📡 PUT ${url} (FormData)`);

  const formData = new FormData();
  if (brandData.name) formData.append('name', brandData.name);
  if (brandData.logo) formData.append('logo', brandData.logo);
  if (brandData.category) formData.append('category', brandData.category);
  if (brandData.metaTitle) formData.append('metaTitle', brandData.metaTitle);
  if (brandData.metaDescription) formData.append('metaDescription', brandData.metaDescription);
  if (brandData.metaKeywords) formData.append('metaKeywords', brandData.metaKeywords);

  const res = await fetch(url, {
    method: 'PUT',
    body: formData,
  });
  return handleResponse(res, `PUT /brands/${brandId}`);
};

// Delete a brand
export const deleteBrand = async (brandId) => {
  const url = `${SERVERURL}/brands/${brandId}`;
  console.log(`📡 DELETE ${url}`);
  const res = await fetch(url, { method: 'DELETE' });
  return handleResponse(res, `DELETE /brands/${brandId}`);
};
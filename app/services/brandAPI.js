// services/brandService.js
import SERVERURL from './serverURL';

async function handleResponse(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Invalid JSON response');
  }
}

// Get all brands
export const getAllBrands = async () => {
  const res = await fetch(`${SERVERURL}/api/brands`);
  return handleResponse(res);
};

// Get single brand
export const getBrandById = async (brandId) => {
  const res = await fetch(`${SERVERURL}/api/brands/${brandId}`);
  return handleResponse(res);
};

// Create brand – supports FormData (for logo upload) or plain object
export const createBrand = async (brandData) => {
  const isFormData = brandData instanceof FormData;
  const options = {
    method: 'POST',
    body: isFormData ? brandData : JSON.stringify(brandData),
  };
  if (!isFormData) {
    options.headers = { 'Content-Type': 'application/json' };
  }
  const res = await fetch(`${SERVERURL}/api/brands`, options);
  return handleResponse(res);
};

// Update brand – supports FormData or plain object
export const updateBrand = async (brandId, brandData) => {
  const isFormData = brandData instanceof FormData;
  const options = {
    method: 'PUT',
    body: isFormData ? brandData : JSON.stringify(brandData),
  };
  if (!isFormData) {
    options.headers = { 'Content-Type': 'application/json' };
  }
  const res = await fetch(`${SERVERURL}/api/brands/${brandId}`, options);
  return handleResponse(res);
};

// Delete brand
export const deleteBrand = async (brandId) => {
  const res = await fetch(`${SERVERURL}/api/brands/${brandId}`, {
    method: 'DELETE',
  });
  return handleResponse(res);
};
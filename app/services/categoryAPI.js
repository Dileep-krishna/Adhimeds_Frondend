// services/categoryService.js
import SERVERURL from './serverURL';

// Minimal JSON parser – throws if invalid
async function handleResponse(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Invalid JSON response');
  }
}

// CREATE CATEGORY (FormData)
export const createCategoryAPI = async (formData) => {
  const res = await fetch(`${SERVERURL}/api/category`, {
    method: "POST",
    body: formData,
  });
  return handleResponse(res);
};

// GET ALL CATEGORIES
export const getCategoriesAPI = async () => {
  const res = await fetch(`${SERVERURL}/api/category`);
  return handleResponse(res);
};

// GET SINGLE CATEGORY
export const getCategoryByIdAPI = async (id) => {
  const res = await fetch(`${SERVERURL}/api/category/${id}`);
  return handleResponse(res);
};

// UPDATE CATEGORY (FormData)
export const updateCategoryAPI = async (id, formData) => {
  const res = await fetch(`${SERVERURL}/api/category/${id}`, {
    method: "PUT",
    body: formData,
  });
  return handleResponse(res);
};

// DELETE CATEGORY
export const deleteCategoryAPI = async (id) => {
  const res = await fetch(`${SERVERURL}/api/category/${id}`, {
    method: "DELETE",
  });
  return handleResponse(res);
};
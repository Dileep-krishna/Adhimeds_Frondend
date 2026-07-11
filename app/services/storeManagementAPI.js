// storeManagementAPI.js
import SERVERURL from "./serverURL";

// Helper to parse JSON response; throws raw text if not JSON
async function handleResponse(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Server returned non‑JSON: ${text.substring(0, 200)}`);
  }
}

// CREATE STORE – accepts FormData (for file uploads) or plain object
export const createStoreAPI = async (storeData) => {
  const url = `${SERVERURL}/api/store`;
  const isFormData = storeData instanceof FormData;
  const options = {
    method: "POST",
    body: storeData,
  };
  if (!isFormData) {
    options.headers = { "Content-Type": "application/json" };
    options.body = JSON.stringify(storeData);
  }
  const res = await fetch(url, options);
  return handleResponse(res);
};

// GET ALL STORES – optional query parameters
export const getStoresAPI = async (queryParams = "") => {
  const url = queryParams
    ? `${SERVERURL}/api/store?${queryParams}`
    : `${SERVERURL}/api/store`;
  const res = await fetch(url);
  return handleResponse(res);
};

// GET SINGLE STORE BY ID
export const getStoreByIdAPI = async (id) => {
  const url = `${SERVERURL}/api/store/${id}`;
  const res = await fetch(url);
  return handleResponse(res);
};

// UPDATE STORE – accepts FormData or plain object
export const updateStoreAPI = async (id, storeData) => {
  const url = `${SERVERURL}/api/store/${id}`;
  const isFormData = storeData instanceof FormData;
  const options = {
    method: "PUT",
    body: storeData,
  };
  if (!isFormData) {
    options.headers = { "Content-Type": "application/json" };
    options.body = JSON.stringify(storeData);
  }
  const res = await fetch(url, options);
  return handleResponse(res);
};

// DELETE STORE
export const deleteStoreAPI = async (id) => {
  const url = `${SERVERURL}/api/store/${id}`;
  const res = await fetch(url, { method: "DELETE" });
  return handleResponse(res);
};
// storeManagementAPI.js
import SERVERURL from "./serverURL";

// Helper to parse JSON response; throws raw text if not JSON
async function handleResponse(res) {
  const text = await res.text();
  console.log('📡 Raw response text:', text);
  try {
    const json = JSON.parse(text);
    console.log('✅ Parsed JSON response:', json);
    return json;
  } catch (e) {
    console.error('❌ Failed to parse JSON:', e);
    throw new Error(`Server returned non‑JSON: ${text.substring(0, 200)}`);
  }
}

// CREATE STORE – accepts FormData (for file uploads) or plain object
export const createStoreAPI = async (storeData) => {
  const url = `${SERVERURL}/api/store`;
  const isFormData = storeData instanceof FormData;
  
  console.log('📤 createStoreAPI called with data type:', isFormData ? 'FormData' : 'JSON');
  
  if (isFormData) {
    console.log('📦 FormData entries:');
    for (let [key, value] of storeData.entries()) {
      console.log(`   ${key}:`, value instanceof File ? `File(${value.name}, ${value.size} bytes)` : value);
    }
  } else {
    console.log('📦 JSON payload:', storeData);
  }

  const options = {
    method: "POST",
    body: storeData,
  };
  if (!isFormData) {
    options.headers = { "Content-Type": "application/json" };
    options.body = JSON.stringify(storeData);
    console.log('📨 Sending JSON to backend:', options.body);
  } else {
    console.log('📨 Sending FormData to backend');
  }

  try {
    const res = await fetch(url, options);
    console.log('📥 Response status:', res.status, res.statusText);
    return handleResponse(res);
  } catch (error) {
    console.error('🔥 Fetch error:', error);
    throw error;
  }
};

// GET ALL STORES – optional query parameters (unchanged)
export const getStoresAPI = async (queryParams = "") => {
  const url = queryParams
    ? `${SERVERURL}/api/store?${queryParams}`
    : `${SERVERURL}/api/store`;
  console.log('🔍 GET stores URL:', url);
  const res = await fetch(url);
  return handleResponse(res);
};

// GET SINGLE STORE BY ID (unchanged)
export const getStoreByIdAPI = async (id) => {
  const url = `${SERVERURL}/api/store/${id}`;
  console.log('🔍 GET store by ID URL:', url);
  const res = await fetch(url);
  return handleResponse(res);
};

// UPDATE STORE – accepts FormData or plain object (unchanged)
export const updateStoreAPI = async (id, storeData) => {
  const url = `${SERVERURL}/api/store/${id}`;
  const isFormData = storeData instanceof FormData;
  
  console.log('📤 updateStoreAPI called for ID:', id, 'data type:', isFormData ? 'FormData' : 'JSON');
  
  if (isFormData) {
    console.log('📦 FormData entries:');
    for (let [key, value] of storeData.entries()) {
      console.log(`   ${key}:`, value instanceof File ? `File(${value.name}, ${value.size} bytes)` : value);
    }
  } else {
    console.log('📦 JSON payload:', storeData);
  }

  const options = {
    method: "PUT",
    body: storeData,
  };
  if (!isFormData) {
    options.headers = { "Content-Type": "application/json" };
    options.body = JSON.stringify(storeData);
    console.log('📨 Sending JSON to backend:', options.body);
  } else {
    console.log('📨 Sending FormData to backend');
  }

  try {
    const res = await fetch(url, options);
    console.log('📥 Response status:', res.status, res.statusText);
    return handleResponse(res);
  } catch (error) {
    console.error('🔥 Fetch error:', error);
    throw error;
  }
};

// DELETE STORE (unchanged)
export const deleteStoreAPI = async (id) => {
  const url = `${SERVERURL}/api/store/${id}`;
  console.log('🗑️ DELETE store URL:', url);
  const res = await fetch(url, { method: "DELETE" });
  return handleResponse(res);
};

// ---------------------------
// ✅ NEW: GET shops for order routing (includes district & status)
// ---------------------------
export const getShopsForOrderAPI = async () => {
  const url = `${SERVERURL}/api/medisoft/shops`;
  console.log('🔍 GET shops for order URL:', url);
  const res = await fetch(url);
  return handleResponse(res);
};
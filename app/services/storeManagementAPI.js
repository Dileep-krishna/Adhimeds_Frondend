// storeManagementAPI.js
import SERVERURL from "./serverURL";

console.log('🔧 SERVERURL loaded as:', SERVERURL);

// Helper to log and handle responses
async function handleResponse(res, endpoint) {
  console.log(`📡 ${endpoint} - Response status:`, res.status);
  console.log(`📡 ${endpoint} - Content-Type:`, res.headers.get('content-type'));

  const text = await res.text();
  console.log(`📄 ${endpoint} - Response body preview (first 300 chars):`, text.substring(0, 300));

  // Try to parse JSON
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error(`❌ ${endpoint} - Failed to parse JSON. Response is not valid JSON.`);
    console.error(`   Full response:`, text);
    throw new Error(`Server returned HTML instead of JSON. Check if backend route exists at ${SERVERURL}/store`);
  }
}

// ✅ CREATE STORE
export const createStoreAPI = async (storeData) => {
  const url = `${SERVERURL}/store`;
  console.log(`🚀 POST ${url}`, storeData);
  
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(storeData),
  });
  
  return handleResponse(res, 'POST /store');
};

// ✅ GET ALL STORES
export const getStoresAPI = async (queryParams = "") => {
  const url = queryParams ? `${SERVERURL}/store?${queryParams}` : `${SERVERURL}/store`;
  console.log(`🔍 GET ${url}`);
  
  const res = await fetch(url);
  return handleResponse(res, 'GET /store');
};

// ✅ GET SINGLE STORE BY ID
export const getStoreByIdAPI = async (id) => {
  const url = `${SERVERURL}/store/${id}`;
  console.log(`🔍 GET ${url}`);
  
  const res = await fetch(url);
  return handleResponse(res, `GET /store/${id}`);
};

// ✅ UPDATE STORE
export const updateStoreAPI = async (id, storeData) => {
  const url = `${SERVERURL}/store/${id}`;
  console.log(`✏️ PUT ${url}`, storeData);
  
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(storeData),
  });
  
  return handleResponse(res, `PUT /store/${id}`);
};

// ✅ DELETE STORE
export const deleteStoreAPI = async (id) => {
  const url = `${SERVERURL}/store/${id}`;
  console.log(`🗑️ DELETE ${url}`);
  
  const res = await fetch(url, { method: "DELETE" });
  return handleResponse(res, `DELETE /store/${id}`);
};
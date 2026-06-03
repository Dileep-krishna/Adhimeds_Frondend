// warrantyAPI.js
import SERVERURL from "./serverURL";

console.log('🔧 SERVERURL loaded as:', SERVERURL);

// Helper to log and handle responses (reuse same logic)
async function handleResponse(res, endpoint) {
  console.log(`📡 ${endpoint} - Response status:`, res.status);
  console.log(`📡 ${endpoint} - Content-Type:`, res.headers.get('content-type'));

  const text = await res.text();
  console.log(`📄 ${endpoint} - Response body preview (first 300 chars):`, text.substring(0, 300));

  try {
    return JSON.parse(text);
  } catch (e) {
    console.error(`❌ ${endpoint} - Failed to parse JSON. Response is not valid JSON.`);
    console.error(`   Full response:`, text);
    throw new Error(`Server returned HTML instead of JSON. Check if backend route exists at ${SERVERURL}/warranties`);
  }
}

// ✅ GET ALL WARRANTIES
export const getWarrantiesAPI = async (queryParams = "") => {
  const url = queryParams ? `${SERVERURL}/warranties?${queryParams}` : `${SERVERURL}/warranties`;
  console.log(`🔍 GET ${url}`);
  
  const res = await fetch(url);
  return handleResponse(res, 'GET /warranties');
};

// ✅ GET SINGLE WARRANTY BY ID
export const getWarrantyByIdAPI = async (id) => {
  const url = `${SERVERURL}/warranties/${id}`;
  console.log(`🔍 GET ${url}`);
  
  const res = await fetch(url);
  return handleResponse(res, `GET /warranties/${id}`);
};

// ✅ CREATE WARRANTY – supports both JSON and FormData (for logo file upload)
export const createWarrantyAPI = async (warrantyData) => {
  const url = `${SERVERURL}/warranties`;
  console.log(`🚀 POST ${url}`, warrantyData instanceof FormData ? 'FormData with logo file' : warrantyData);

  const isFormData = warrantyData instanceof FormData;
  const options = {
    method: "POST",
    body: warrantyData,
  };
  if (!isFormData) {
    options.headers = { "Content-Type": "application/json" };
    options.body = JSON.stringify(warrantyData);
  }
  // If FormData, browser sets correct multipart boundary automatically – do NOT set Content-Type header.

  const res = await fetch(url, options);
  return handleResponse(res, 'POST /warranties');
};

// ✅ UPDATE WARRANTY – supports both JSON and FormData (for optional logo file)
export const updateWarrantyAPI = async (id, warrantyData) => {
  const url = `${SERVERURL}/warranties/${id}`;
  console.log(`✏️ PUT ${url}`, warrantyData instanceof FormData ? 'FormData with logo file' : warrantyData);

  const isFormData = warrantyData instanceof FormData;
  const options = {
    method: "PUT",
    body: warrantyData,
  };
  if (!isFormData) {
    options.headers = { "Content-Type": "application/json" };
    options.body = JSON.stringify(warrantyData);
  }

  const res = await fetch(url, options);
  return handleResponse(res, `PUT /warranties/${id}`);
};

// ✅ DELETE WARRANTY
export const deleteWarrantyAPI = async (id) => {
  const url = `${SERVERURL}/warranties/${id}`;
  console.log(`🗑️ DELETE ${url}`);
  
  const res = await fetch(url, { method: "DELETE" });
  return handleResponse(res, `DELETE /warranties/${id}`);
};
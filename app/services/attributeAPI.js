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
    throw new Error(`Server returned HTML instead of JSON. Check if backend route exists at ${SERVERURL}/attributes`);
  }
}

// ✅ GET ALL ATTRIBUTES
export const getAttributesAPI = async (queryParams = "") => {
  const url = queryParams ? `${SERVERURL}/attributes?${queryParams}` : `${SERVERURL}/attributes`;
  console.log(`🔍 GET ${url}`);
  
  const res = await fetch(url);
  return handleResponse(res, 'GET /attributes');
};

// ✅ GET SINGLE ATTRIBUTE BY ID
export const getAttributeByIdAPI = async (id) => {
  const url = `${SERVERURL}/attributes/${id}`;
  console.log(`🔍 GET ${url}`);
  
  const res = await fetch(url);
  return handleResponse(res, `GET /attributes/${id}`);
};

// ✅ CREATE ATTRIBUTE – supports JSON (for now) – no file upload needed
export const createAttributeAPI = async (attributeData) => {
  const url = `${SERVERURL}/attributes`;
  console.log(`🚀 POST ${url}`, attributeData);

  const options = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(attributeData),
  };

  const res = await fetch(url, options);
  return handleResponse(res, 'POST /attributes');
};

// ✅ UPDATE ATTRIBUTE – supports JSON (for now)
export const updateAttributeAPI = async (id, attributeData) => {
  const url = `${SERVERURL}/attributes/${id}`;
  console.log(`✏️ PUT ${url}`, attributeData);

  const options = {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(attributeData),
  };

  const res = await fetch(url, options);
  return handleResponse(res, `PUT /attributes/${id}`);
};

// ✅ DELETE ATTRIBUTE
export const deleteAttributeAPI = async (id) => {
  const url = `${SERVERURL}/attributes/${id}`;
  console.log(`🗑️ DELETE ${url}`);
  
  const res = await fetch(url, { method: "DELETE" });
  return handleResponse(res, `DELETE /attributes/${id}`);
};
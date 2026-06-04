import SERVERURL from "./serverURL";

async function handleResponse(res, endpoint) {
  const text = await res.text();
  console.log(`📡 ${endpoint} - Status: ${res.status}`);
  console.log(`📄 ${endpoint} - Raw response:`, text.substring(0, 500));

  if (!text || text.trim() === '') {
    throw new Error(`Empty response from ${endpoint}`);
  }

  try {
    const json = JSON.parse(text);
    if (!res.ok) {
      throw new Error(json.message || `HTTP ${res.status}`);
    }
    return json;
  } catch (e) {
    console.error(`❌ Invalid JSON from ${endpoint}`, e.message);
    throw new Error(`Server returned invalid response (not JSON). Check backend logs.`);
  }
}

// ------------------- CREATE -------------------
export const createCustomReviewAPI = async (formData) => {
  const url = `${SERVERURL}/custom-reviews`;
  const res = await fetch(url, {
    method: 'POST',
    body: formData,
  });
  return handleResponse(res, 'POST /custom-reviews');
};

// ------------------- GET ALL (with optional filters) -------------------
export const getAllCustomReviewsAPI = async (filters = {}) => {
  const queryParams = new URLSearchParams(filters).toString();
  const url = queryParams 
    ? `${SERVERURL}/custom-reviews?${queryParams}`
    : `${SERVERURL}/custom-reviews`;
  const res = await fetch(url);
  return handleResponse(res, 'GET /custom-reviews');
};

// ------------------- GET SINGLE -------------------
export const getCustomReviewById = async (id) => {
  const url = `${SERVERURL}/custom-reviews/${id}`;
  const res = await fetch(url);
  return handleResponse(res, `GET /custom-reviews/${id}`);
};

// ------------------- UPDATE -------------------
export const updateCustomReviewAPI = async (id, formData) => {
  const url = `${SERVERURL}/custom-reviews/${id}`;
  const res = await fetch(url, {
    method: 'PUT',
    body: formData,
  });
  return handleResponse(res, `PUT /custom-reviews/${id}`);
};

// ------------------- DELETE -------------------
export const deleteCustomReviewAPI = async (id) => {
  const url = `${SERVERURL}/custom-reviews/${id}`;
  const res = await fetch(url, {
    method: 'DELETE',
  });
  return handleResponse(res, `DELETE /custom-reviews/${id}`);
};
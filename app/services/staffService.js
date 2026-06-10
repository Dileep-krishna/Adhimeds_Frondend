// services/staffService.js
import SERVERURL from "./serverURL";

console.log('🔧 SERVERURL loaded as:', SERVERURL);

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
    throw new Error(`Server returned HTML instead of JSON. Check if backend route exists at ${SERVERURL}/staff`);
  }
}

// ✅ CREATE STAFF MEMBER
export const createStaffAPI = async (staffData) => {
  const url = `${SERVERURL}/staff`;
  console.log(`🚀 POST ${url}`, staffData);

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(staffData),
  });

  return handleResponse(res, 'POST /staff');
};

// ✅ GET ALL STAFF MEMBERS (with query params)
export const getStaffAPI = async (queryParams = "") => {
  const url = queryParams ? `${SERVERURL}/staff?${queryParams}` : `${SERVERURL}/staff`;
  console.log(`🔍 GET ${url}`);

  const res = await fetch(url);
  return handleResponse(res, 'GET /staff');
};

// ✅ GET SINGLE STAFF BY ID
export const getStaffByIdAPI = async (id) => {
  const url = `${SERVERURL}/staff/${id}`;
  console.log(`🔍 GET ${url}`);

  const res = await fetch(url);
  return handleResponse(res, `GET /staff/${id}`);
};

// ✅ UPDATE STAFF MEMBER
export const updateStaffAPI = async (id, staffData) => {
  const url = `${SERVERURL}/staff/${id}`;
  console.log(`✏️ PUT ${url}`, staffData);

  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(staffData),
  });

  return handleResponse(res, `PUT /staff/${id}`);
};

// ✅ DELETE STAFF MEMBER
export const deleteStaffAPI = async (id) => {
  const url = `${SERVERURL}/staff/${id}`;
  console.log(`🗑️ DELETE ${url}`);

  const res = await fetch(url, { method: "DELETE" });
  return handleResponse(res, `DELETE /staff/${id}`);
};


async function handleDistrictResponse(res, endpoint) {
  console.log(`📡 ${endpoint} - Response status:`, res.status);
  console.log(`📡 ${endpoint} - Content-Type:`, res.headers.get('content-type'));

  const text = await res.text();
  console.log(`📄 ${endpoint} - Response body preview (first 300 chars):`, text.substring(0, 300));

  try {
    return JSON.parse(text);
  } catch (e) {
    console.error(`❌ ${endpoint} - Failed to parse JSON. Response is not valid JSON.`);
    console.error(`   Full response:`, text);
    throw new Error(`Server returned HTML instead of JSON. Check if backend route exists at ${SERVERURL}/districts`);
  }
}

// ✅ GET ALL DISTRICTS
export const getAllDistricts = async (queryParams = "") => {
  const url = queryParams ? `${SERVERURL}/districts?${queryParams}` : `${SERVERURL}/districts`;
  console.log(`🔍 GET ${url}`);

  const res = await fetch(url);
  return handleDistrictResponse(res, 'GET /districts');
}

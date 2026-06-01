// services/medicalProductService.js
import SERVERURL from "./serverURL";

console.log('🔧 MEDICAL PRODUCT SERVICE - SERVERURL:', SERVERURL);

// 🔥 Common response handler (same as yours)
async function handleResponse(res, endpoint) {
  console.log(`📡 ${endpoint} - Status:`, res.status);

  const text = await res.text();
  console.log(`📄 ${endpoint} - Preview:`, text.substring(0, 400));

  if (!text || text.trim() === "") {
    throw new Error("Empty response from server");
  }

  try {
    return JSON.parse(text);
  } catch (err) {
    console.error(`❌ JSON Parse Error:`, err.message);
    throw new Error("Invalid JSON response (maybe backend error)");
  }
}

//
// ✅ CREATE MEDICAL PRODUCT (FormData)
//
export const createMedicalProductAPI = async (formData) => {
  const url = `${SERVERURL}/medical-products`;
  console.log(`🚀 POST ${url}`);

  try {
    const res = await fetch(url, {
      method: "POST",
      body: formData, // ⚠️ no JSON header (file upload)
    });

    return await handleResponse(res, "POST /medical-products");
  } catch (error) {
    console.error("❌ createMedicalProductAPI Error:", error.message);
    throw error;
  }
};

//
// ✅ GET ALL (Pagination)
//
export const getMedicalProductsAPI = async (query = "") => {
  const url = query
    ? `${SERVERURL}/medical-products?${query}`
    : `${SERVERURL}/medical-products`;

  console.log(`🔍 GET ${url}`);

  try {
    const res = await fetch(url);
    return await handleResponse(res, "GET /medical-products");
  } catch (error) {
    console.error("❌ getMedicalProductsAPI Error:", error.message);
    throw error;
  }
};

//
// ✅ GET BY ID
//
export const getMedicalProductByIdAPI = async (id) => {
  if (!id) throw new Error("ID is required");

  const url = `${SERVERURL}/medical-products/${id}`;
  console.log(`🔍 GET ${url}`);

  try {
    const res = await fetch(url);
    return await handleResponse(res, `GET /medical-products/${id}`);
  } catch (error) {
    console.error("❌ getMedicalProductByIdAPI Error:", error.message);
    throw error;
  }
};

//
// ✅ UPDATE (FormData)
//
export const updateMedicalProductAPI = async (id, formData) => {
  const url = `${SERVERURL}/medical-products/${id}`;
  console.log(`✏️ PUT ${url}`);

  try {
    const res = await fetch(url, {
      method: "PUT",
      body: formData, // ⚠️ multipart
    });

    return await handleResponse(res, `PUT /medical-products/${id}`);
  } catch (error) {
    console.error("❌ updateMedicalProductAPI Error:", error.message);
    throw error;
  }
};

//
// ✅ DELETE
//
export const deleteMedicalProductAPI = async (id) => {
  if (!id) throw new Error("ID is required");

  const url = `${SERVERURL}/medical-products/${id}`;
  console.log(`🗑️ DELETE ${url}`);

  try {
    const res = await fetch(url, { method: "DELETE" });
    return await handleResponse(res, `DELETE /medical-products/${id}`);
  } catch (error) {
    console.error("❌ deleteMedicalProductAPI Error:", error.message);
    throw error;
  }
};

//
// ✅ TOGGLE (published / featured / todayDeal)
//
export const toggleMedicalProductAPI = async (id, field) => {
  const url = `${SERVERURL}/medical-products/${id}/toggle`;

  console.log(`🔄 PATCH ${url}`);
  console.log("   Field:", field);

  try {
    const res = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ field }),
    });

    return await handleResponse(res, `PATCH /medical-products/${id}/toggle`);
  } catch (error) {
    console.error("❌ toggleMedicalProductAPI Error:", error.message);
    throw error;
  }
};
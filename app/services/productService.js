// services/productService.js
import SERVERURL from "./serverURL";

console.log('🔧 PRODUCT SERVICE - SERVERURL loaded as:', SERVERURL);

// Helper function to handle fetch responses with full logging
async function handleResponse(res, endpoint) {
  console.log(`📡 ${endpoint} - Response status:`, res.status);
  console.log(`📡 ${endpoint} - Content-Type:`, res.headers.get('content-type'));

  const text = await res.text();
  console.log(`📄 ${endpoint} - Response body preview (first 400 chars):`, text.substring(0, 400));

  if (!text || text.trim() === '') {
    console.error(`❌ ${endpoint} - Empty response body`);
    throw new Error('Server returned empty response');
  }

  try {
    const json = JSON.parse(text);
    console.log(`✅ ${endpoint} - Successfully parsed JSON`);
    return json;
  } catch (e) {
    console.error(`❌ ${endpoint} - Failed to parse JSON. Error:`, e.message);
    console.error(`   Raw response (first 500 chars):`, text.substring(0, 500));
    throw new Error(`Server returned invalid JSON (maybe HTML error page). Check if backend route exists at ${SERVERURL}/products`);
  }
}

// ✅ CREATE PRODUCT – now works with both JSON and FormData
export const createProductAPI = async (productData) => {
  const url = `${SERVERURL}/products`;
  const isFormData = productData instanceof FormData;
  console.log(`🚀 POST ${url}`);
  if (isFormData) {
    console.log('   Payload: FormData (cannot stringify)');
  } else {
    console.log('   Payload:', JSON.stringify(productData, null, 2));
  }

  try {
    const headers = isFormData ? {} : { "Content-Type": "application/json" };
    const body = isFormData ? productData : JSON.stringify(productData);
    const res = await fetch(url, {
      method: "POST",
      headers,
      body,
    });
    return await handleResponse(res, 'POST /products');
  } catch (error) {
    console.error(`❌ Network or fetch error in createProductAPI:`, error.message);
    throw error;
  }
};

// ✅ GET ALL PRODUCTS (with optional query params)
export const getProductsAPI = async (queryParams = "") => {
  const url = queryParams ? `${SERVERURL}/products?${queryParams}` : `${SERVERURL}/products`;
  console.log(`🔍 GET ${url}`);

  try {
    const res = await fetch(url);
    return await handleResponse(res, 'GET /products');
  } catch (error) {
    console.error(`❌ Network error in getProductsAPI:`, error.message);
    throw error;
  }
};

// ✅ GET SINGLE PRODUCT BY ID
export const getProductByIdAPI = async (id) => {
  if (!id) {
    console.error('❌ getProductByIdAPI called with no ID');
    throw new Error('Product ID is required');
  }
  const url = `${SERVERURL}/products/${id}`;
  console.log(`🔍 GET ${url}`);

  try {
    const res = await fetch(url);
    return await handleResponse(res, `GET /products/${id}`);
  } catch (error) {
    console.error(`❌ Network error in getProductByIdAPI:`, error.message);
    throw error;
  }
};

// ✅ UPDATE PRODUCT – now works with both JSON and FormData
export const updateProductAPI = async (id, productData) => {
  const url = `${SERVERURL}/products/${id}`;
  const isFormData = productData instanceof FormData;
  console.log(`🔄 PUT ${url}`);
  if (isFormData) {
    console.log('   Payload: FormData (cannot stringify)');
  } else {
    console.log('   Payload:', JSON.stringify(productData, null, 2));
  }

  const headers = isFormData ? {} : { "Content-Type": "application/json" };
  const body = isFormData ? productData : JSON.stringify(productData);
  const res = await fetch(url, {
    method: "PUT",
    headers,
    body,
  });
  return handleResponse(res, `PUT /products/${id}`);
};

// ✅ DELETE PRODUCT
export const deleteProductAPI = async (id) => {
  if (!id) {
    console.error('❌ deleteProductAPI called with no ID');
    throw new Error('Product ID is required');
  }
  const url = `${SERVERURL}/products/${id}`;
  console.log(`🗑️ DELETE ${url}`);

  try {
    const res = await fetch(url, { method: "DELETE" });
    return await handleResponse(res, `DELETE /products/${id}`);
  } catch (error) {
    console.error(`❌ Network error in deleteProductAPI:`, error.message);
    throw error;
  }
};
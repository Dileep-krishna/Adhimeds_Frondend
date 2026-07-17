// services/deliveryBoyService.js
import SERVERURL from "./serverURL";

// Helper: parse JSON and check for success flag
async function handleResponse(res) {
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error('Invalid JSON response');
  }
  // If the response indicates failure, throw an error with the message
  if (json.success === false) {
    throw new Error(json.message || 'Request failed');
  }
  // Otherwise, return the parsed JSON
  return json;
}

// ---------- DELIVERY BOY CRUD ----------

export const addDeliveryBoyAPI = async (data) => {
  const res = await fetch(`${SERVERURL}/api/add`, {
    method: "POST",
    body: data, // FormData
  });
  return handleResponse(res);
};

export const getDeliveryBoysAPI = async () => {
  const res = await fetch(`${SERVERURL}/api/all`);
  return handleResponse(res);
};

export const updateDeliveryBoyAPI = async (id, data) => {
  const res = await fetch(`${SERVERURL}/api/${id}`, {
    method: "PUT",
    body: data, // FormData
  });
  return handleResponse(res);
};

export const deleteDeliveryBoyAPI = async (id) => {
  const res = await fetch(`${SERVERURL}/api/${id}`, {
    method: "DELETE",
  });
  return handleResponse(res);
};

export const assignOrdersToBoyAPI = async (boyId, orderIds) => {
  const res = await fetch(`${SERVERURL}/api/assign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ boyId, orderIds }),
  });
  return handleResponse(res);
};

// ---------- (Optional) MEDICAL PRODUCT TOGGLES ----------
export const togglePublishedAPI = async (id) => {
  const res = await fetch(`${SERVERURL}/api/medical-products/${id}/toggle-published`, {
    method: "PATCH",
  });
  return handleResponse(res);
};

export const toggleFeaturedAPI = async (id) => {
  const res = await fetch(`${SERVERURL}/api/medical-products/${id}/toggle-featured`, {
    method: "PATCH",
  });
  return handleResponse(res);
};

export const toggleTodayDealAPI = async (id) => {
  const res = await fetch(`${SERVERURL}/api/medical-products/${id}/toggle-todaydeal`, {
    method: "PATCH",
  });
  return handleResponse(res);
};
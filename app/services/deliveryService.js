// services/deliveryBoyService.js
import SERVERURL from "./serverURL";

// Minimal JSON parser – throws if invalid
async function handleResponse(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Invalid JSON response');
  }
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

// ---------- (Optional) MEDICAL PRODUCT TOGGLES – remove if not needed ----------
// If you still need these, they now point to /api/medical-products/...
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
import SERVERURL from './serverURL';

async function handleResponse(res, endpoint) {
  console.log(`🌐 ${endpoint} - Response status: ${res.status}`);
  const text = await res.text();
  console.log(`📄 ${endpoint} - Response body preview:`, text.substring(0, 300));
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error(`❌ ${endpoint} - Failed to parse JSON. Raw response:`, text);
    throw new Error('Server returned invalid JSON');
  }
}

// ---------- ORDER API FUNCTIONS ----------

export const placeOrder = async (items) => {
  const url = `${SERVERURL}/orders`;
  console.log(`📡 POST ${url}`);
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  });
  return handleResponse(res, 'POST /orders');
};

export const getAllOrders = async () => {
  const url = `${SERVERURL}/orders`;
  console.log(`📡 GET ${url}`);
  const res = await fetch(url);
  return handleResponse(res, 'GET /orders');
};

export const getOrderById = async (orderId) => {
  const url = `${SERVERURL}/orders/${orderId}`;
  console.log(`📡 GET ${url}`);
  const res = await fetch(url);
  return handleResponse(res, `GET /orders/${orderId}`);
};

export const updateItemStatus = async (orderId, itemId, status) => {
  const url = `${SERVERURL}/orders/${orderId}/items/${itemId}`;
  console.log(`📡 PUT ${url}`);
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return handleResponse(res, `PUT /orders/${orderId}/items/${itemId}`);
};

// ✅ New: Delete a single item from an order
export const deleteItem = async (orderId, itemId) => {
  const url = `${SERVERURL}/orders/${orderId}/items/${itemId}`;
  console.log(`📡 DELETE ${url}`);
  const res = await fetch(url, { method: 'DELETE' });
  return handleResponse(res, `DELETE /orders/${orderId}/items/${itemId}`);
};

// ---------- NOTIFICATION API FUNCTIONS ----------

// Get all notifications
export const getNotifications = async () => {
  const url = `${SERVERURL}/notifications`;
  console.log(`📡 GET ${url}`);
  const res = await fetch(url);
  return handleResponse(res, 'GET /notifications');
};

// Create a new notification
export const createNotification = async (orderId, message) => {
  const url = `${SERVERURL}/notifications`;
  console.log(`📡 POST ${url}`);
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId, message }),
  });
  return handleResponse(res, 'POST /notifications');
};

// Mark a notification as read
export const markNotificationRead = async (notificationId) => {
  const url = `${SERVERURL}/notifications/${notificationId}`;
  console.log(`📡 PUT ${url}`);
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ read: true }),
  });
  return handleResponse(res, `PUT /notifications/${notificationId}`);
};

// Clear all notifications
export const clearAllNotifications = async () => {
  const url = `${SERVERURL}/notifications`;
  console.log(`📡 DELETE ${url}`);
  const res = await fetch(url, { method: 'DELETE' });
  return handleResponse(res, 'DELETE /notifications');
};
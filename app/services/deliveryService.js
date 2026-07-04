import commonAPI from "./commonAPI";
import SERVERURL from "./serverURL";

// ➕ Add Delivery Boy
export const addDeliveryBoyAPI = async (data) => {
  return await commonAPI(
    "POST",
    `${SERVERURL}/add`,
    data,
    {
      "Content-Type": "multipart/form-data"
    }
  );
};

// 📥 Get all delivery boys
export const getDeliveryBoysAPI = async () => {
  return await commonAPI(
    "GET",
    `${SERVERURL}/all`,
    {}
  );
};

// 🔄 Update Status
export const updateDeliveryBoyAPI     = async (id, data) => {
  return await commonAPI(
    "PUT",
    `${SERVERURL}/${id}`, // 👈 different from /status
    data,
    {
      "Content-Type": "multipart/form-data"
    }
  );
};

// ❌ Delete Delivery Boy
export const deleteDeliveryBoyAPI = async (id) => {
  return await commonAPI(
    "DELETE",
    `${SERVERURL}/${id}`,
    {}
  );
};
//
// ✅ TOGGLE PUBLISHED
//
export const togglePublishedAPI = async (id) => {
  const url = `${SERVERURL}/medical-products/${id}/toggle-published`;
  console.log(`🔄 PATCH ${url}`);

  try {
    const res = await fetch(url, { method: "PATCH" });
    return await handleResponse(res, `PATCH /medical-products/${id}/toggle-published`);
  } catch (error) {
    console.error("❌ togglePublishedAPI Error:", error.message);
    throw error;
  }
};

//
// ✅ TOGGLE FEATURED
//
export const toggleFeaturedAPI = async (id) => {
  const url = `${SERVERURL}/medical-products/${id}/toggle-featured`;
  console.log(`🔄 PATCH ${url}`);

  try {
    const res = await fetch(url, { method: "PATCH" });
    return await handleResponse(res, `PATCH /medical-products/${id}/toggle-featured`);
  } catch (error) {
    console.error("❌ toggleFeaturedAPI Error:", error.message);
    throw error;
  }
};

//
// ✅ TOGGLE TODAY'S DEAL
//
export const toggleTodayDealAPI = async (id) => {
  const url = `${SERVERURL}/medical-products/${id}/toggle-todaydeal`;
  console.log(`🔄 PATCH ${url}`);

  try {
    const res = await fetch(url, { method: "PATCH" });
    return await handleResponse(res, `PATCH /medical-products/${id}/toggle-todaydeal`);
  } catch (error) {
    console.error("❌ toggleTodayDealAPI Error:", error.message);
    throw error;
  }
};

// (Optional) assignment API – add when backend is ready
export const assignOrdersToBoyAPI = async (boyId, orderIds) => {
  return await commonAPI("POST", `${SERVERURL}/assign`, { boyId, orderIds });
};
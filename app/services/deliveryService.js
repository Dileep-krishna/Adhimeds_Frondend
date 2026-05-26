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
export const updateDeliveryBoyAPI = async (id, data) => {
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
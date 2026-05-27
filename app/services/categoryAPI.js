// ✅ CREATE CATEGORY
export const createCategoryAPI = async (formData) => {
  const res = await fetch(`${SERVERURL}/category`, {  // ADDED "/category"
    method: "POST",
    body: formData,
  });
  return res.json();
};

// ✅ GET ALL CATEGORIES
export const getCategoriesAPI = async () => {
  const res = await fetch(`${SERVERURL}/category`);   // ADDED "/category"
  return res.json();
};

// ✅ GET SINGLE CATEGORY
export const getCategoryByIdAPI = async (id) => {
  const res = await fetch(`${SERVERURL}/category/${id}`);
  return res.json();
};

// ✅ UPDATE CATEGORY
export const updateCategoryAPI = async (id, formData) => {
  const res = await fetch(`${SERVERURL}/category/${id}`, {
    method: "PUT",
    body: formData,
  });
  return res.json();
};

// ✅ DELETE CATEGORY
export const deleteCategoryAPI = async (id) => {
  const res = await fetch(`${SERVERURL}/category/${id}`, {
    method: "DELETE",
  });
  return res.json();
};
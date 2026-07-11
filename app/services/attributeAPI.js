// services/attributeService.js
import SERVERURL from "./serverURL";

async function handleResponse(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Invalid JSON response');
  }
}

// GET ALL ATTRIBUTES (with optional query params)
export const getAttributesAPI = async (queryParams = "") => {
  const url = queryParams
    ? `${SERVERURL}/api/attributes?${queryParams}`
    : `${SERVERURL}/api/attributes`;
  const res = await fetch(url);
  return handleResponse(res);
};

// GET SINGLE ATTRIBUTE BY ID
export const getAttributeByIdAPI = async (id) => {
  const res = await fetch(`${SERVERURL}/api/attributes/${id}`);
  return handleResponse(res);
};

// CREATE ATTRIBUTE (JSON)
export const createAttributeAPI = async (attributeData) => {
  const res = await fetch(`${SERVERURL}/api/attributes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(attributeData),
  });
  return handleResponse(res);
};

// UPDATE ATTRIBUTE (JSON)
export const updateAttributeAPI = async (id, attributeData) => {
  const res = await fetch(`${SERVERURL}/api/attributes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(attributeData),
  });
  return handleResponse(res);
};

// DELETE ATTRIBUTE
export const deleteAttributeAPI = async (id) => {
  const res = await fetch(`${SERVERURL}/api/attributes/${id}`, {
    method: "DELETE",
  });
  return handleResponse(res);
};
// notesAPI.js
import SERVERURL from "./serverURL";

console.log('🔧 SERVERURL loaded as:', SERVERURL);

// Helper to log and handle responses
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
    throw new Error(`Server returned HTML instead of JSON. Check if backend route exists at ${SERVERURL}/notes`);
  }
}

// ✅ GET ALL NOTES (with optional filters)
export const getNotesAPI = async (queryParams = "") => {
  const url = queryParams ? `${SERVERURL}/notes?${queryParams}` : `${SERVERURL}/notes`;
  console.log(`🔍 GET ${url}`);
  
  const res = await fetch(url);
  return handleResponse(res, 'GET /notes');
};

// ✅ GET SINGLE NOTE BY ID
export const getNoteByIdAPI = async (id) => {
  const url = `${SERVERURL}/notes/${id}`;
  console.log(`🔍 GET ${url}`);
  
  const res = await fetch(url);
  return handleResponse(res, `GET /notes/${id}`);
};

// ✅ CREATE NOTE – supports both JSON and FormData (for image file upload)
export const createNoteAPI = async (noteData) => {
  const url = `${SERVERURL}/notes`;
  console.log(`🚀 POST ${url}`, noteData instanceof FormData ? 'FormData with image file' : noteData);

  const isFormData = noteData instanceof FormData;
  const options = {
    method: "POST",
    body: noteData,
  };
  if (!isFormData) {
    options.headers = { "Content-Type": "application/json" };
    options.body = JSON.stringify(noteData);
  }
  // If FormData, browser sets correct multipart boundary automatically – do NOT set Content-Type header.

  const res = await fetch(url, options);
  return handleResponse(res, 'POST /notes');
};

// ✅ UPDATE NOTE – supports both JSON and FormData (for optional image file)
export const updateNoteAPI = async (id, noteData) => {
  const url = `${SERVERURL}/notes/${id}`;
  console.log(`✏️ PUT ${url}`, noteData instanceof FormData ? 'FormData with image file' : noteData);

  const isFormData = noteData instanceof FormData;
  const options = {
    method: "PUT",
    body: noteData,
  };
  if (!isFormData) {
    options.headers = { "Content-Type": "application/json" };
    options.body = JSON.stringify(noteData);
  }

  const res = await fetch(url, options);
  return handleResponse(res, `PUT /notes/${id}`);
};

// ✅ DELETE NOTE
export const deleteNoteAPI = async (id) => {
  const url = `${SERVERURL}/notes/${id}`;
  console.log(`🗑️ DELETE ${url}`);
  
  const res = await fetch(url, { method: "DELETE" });
  return handleResponse(res, `DELETE /notes/${id}`);
};
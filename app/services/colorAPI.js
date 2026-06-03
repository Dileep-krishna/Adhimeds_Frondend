import SERVERURL from './serverURL';

async function handleResponse(res, endpoint) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error(`❌ ${endpoint} - Invalid JSON`, text);
    throw new Error('Server returned invalid JSON');
  }
}

export const getColorsAPI = async () => {
  const res = await fetch(`${SERVERURL}/colors`);
  return handleResponse(res, 'GET /colors');
};

export const createColorAPI = async (colorData) => {
  const res = await fetch(`${SERVERURL}/colors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(colorData),
  });
  return handleResponse(res, 'POST /colors');
};

export const updateColorAPI = async (id, colorData) => {
  const res = await fetch(`${SERVERURL}/colors/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(colorData),
  });
  return handleResponse(res, `PUT /colors/${id}`);
};

export const deleteColorAPI = async (id) => {
  const res = await fetch(`${SERVERURL}/colors/${id}`, { method: 'DELETE' });
  return handleResponse(res, `DELETE /colors/${id}`);
};
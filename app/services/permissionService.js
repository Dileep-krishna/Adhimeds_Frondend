import SERVERURL from './serverURL';

// Helper to log and parse responses
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

// ========== Role CRUD ==========

// Get all roles
export const getAllRoles = async () => {
  const url = `${SERVERURL}/roles`;
  console.log(`📡 GET ${url}`);
  const res = await fetch(url);
  return handleResponse(res, 'GET /roles');
};

// Get a single role by ID
export const getRoleById = async (roleId) => {
  const url = `${SERVERURL}/roles/${roleId}`;
  console.log(`📡 GET ${url}`);
  const res = await fetch(url);
  return handleResponse(res, `GET /roles/${roleId}`);
};

// Create a new role
export const createRole = async (roleData) => {
  const url = `${SERVERURL}/roles`;
  console.log(`📡 POST ${url}`, roleData);
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(roleData),
  });
  return handleResponse(res, 'POST /roles');
};

// Update an existing role (rename)
export const updateRole = async (roleId, roleData) => {
  const url = `${SERVERURL}/roles/${roleId}`;
  console.log(`📡 PUT ${url}`, roleData);
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(roleData),
  });
  return handleResponse(res, `PUT /roles/${roleId}`);
};

// Delete a role
export const deleteRole = async (roleId) => {
  const url = `${SERVERURL}/roles/${roleId}`;
  console.log(`📡 DELETE ${url}`);
  const res = await fetch(url, { method: 'DELETE' });
  return handleResponse(res, `DELETE /roles/${roleId}`);
};

// ========== Role Permission CRUD (new) ==========

// Get permissions for a role by roleName
export const getRolePermissions = async (roleName) => {
  const url = `${SERVERURL}/role-permissions/${encodeURIComponent(roleName)}`;
  console.log(`📡 GET ${url}`);
  const res = await fetch(url);
  return handleResponse(res, `GET /role-permissions/${roleName}`);
};

// Set (replace) permissions for a role
export const setRolePermissions = async (roleName, permissions) => {
  const url = `${SERVERURL}/role-permissions/${encodeURIComponent(roleName)}`;
  console.log(`📡 PUT ${url}`, permissions);
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ permissions }),
  });
  return handleResponse(res, `PUT /role-permissions/${roleName}`);
};

// Delete all permissions for a role (used when role is deleted)
export const deleteRolePermissions = async (roleName) => {
  const url = `${SERVERURL}/role-permissions/${encodeURIComponent(roleName)}`;
  console.log(`📡 DELETE ${url}`);
  const res = await fetch(url, { method: 'DELETE' });
  return handleResponse(res, `DELETE /role-permissions/${roleName}`);
};
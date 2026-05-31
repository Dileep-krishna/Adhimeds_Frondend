import SERVERURL from './serverURL';

async function handleResponse(res, endpoint) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error(`❌ ${endpoint} - Invalid JSON response:`, text.substring(0, 200));
    throw new Error('Server returned invalid response');
  }
}

// Get all roles (list of role names/objects)
export const getAllRoles = async () => {
  const url = `${SERVERURL}/roles`;
  const res = await fetch(url);
  return handleResponse(res, 'GET /roles');
};

// Get permissions for a specific role (by role name or ID)
export const getRolePermissions = async (roleName) => {
  const url = `${SERVERURL}/roles/${encodeURIComponent(roleName)}/permissions`;
  const res = await fetch(url);
  return handleResponse(res, `GET /roles/${roleName}/permissions`);
};

// Update permissions for a role (send full permissions object)
export const updateRolePermissions = async (roleName, permissions) => {
  const url = `${SERVERURL}/roles/${encodeURIComponent(roleName)}/permissions`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ permissions }),
  });
  return handleResponse(res, `PUT /roles/${roleName}/permissions`);
};
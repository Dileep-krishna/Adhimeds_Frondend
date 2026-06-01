'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import 'bootstrap/dist/css/bootstrap.min.css';

import './roles-custom.css';
import { getRoleById, getRolePermissions, setRolePermissions } from '../../../../services/permissionService';



export default function RolesPermissionsPage() {
  const router = useRouter();
  const params = useParams();
  const roleId = params?.id; // if present, we are in edit mode

  const [roleName, setRoleName] = useState('');
  const [originalRoleName, setOriginalRoleName] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!roleId);
  const [permissionsData, setPermissionsData] = useState({});

  // Permission modules (same as before)
  const permissionModules = {
    Products: ['View Products', 'Add Product', 'Edit Product', 'Delete Product'],
    Inventory: ['View Stock', 'Adjust Stock', 'Transfer Stock', 'Manage Batches'],
    Orders: ['View Orders', 'Create Order', 'Edit Order', 'Cancel Order'],
    Customers: ['View Customers', 'Add Customer', 'Edit Customer', 'Delete Customer'],
    Staff: ['View Staff', 'Add Staff', 'Edit Staff', 'Delete Staff', 'Manage Roles'],
    Reports: ['View Reports', 'Export Reports', 'Schedule Reports'],
    Settings: ['View Settings', 'Edit Settings', 'Manage Integrations'],
  };

  // Load role & permissions when editing
  useEffect(() => {
    if (!roleId) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Get role details
        const roleRes = await getRoleById(roleId);
        if (roleRes.success) {
          const role = roleRes.data;
          setRoleName(role.name);
          setOriginalRoleName(role.name);
        } else {
          toast.error('Role not found');
          router.push('/super-admin/staff/permissions');
          return;
        }

        // 2. Get permissions for this role
        const permRes = await getRolePermissions(roleName || roleRes.data.name);
        if (permRes.success && permRes.data) {
          const permsObj = {};
          permRes.data.forEach(({ module, actions }) => {
            permsObj[module] = actions;
          });
          setPermissionsData(permsObj);
        }
      } catch (error) {
        console.error(error);
        toast.error('Error loading role data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [roleId, router, roleName]);

  // Toggle permission (add/remove)
  const togglePermission = (module, action) => {
    setPermissionsData((prev) => {
      const current = prev[module] || [];
      const updated = current.includes(action)
        ? current.filter((a) => a !== action)
        : [...current, action];

      const newData = { ...prev };
      if (updated.length === 0) delete newData[module];
      else newData[module] = updated;
      return newData;
    });
  };

  const hasPermission = (module, action) =>
    permissionsData[module]?.includes(action) || false;

  const handleSave = async () => {
    if (!roleName.trim()) {
      toast.error('Role name is required');
      return;
    }

    setSaving(true);
    try {
      // Step 1: Create or update role
      let roleResult;
      if (roleId) {
        // Update existing role (only if name changed)
        if (roleName.trim() !== originalRoleName) {
          roleResult = await updateRole(roleId, { name: roleName.trim() });
          if (!roleResult.success) {
            toast.error(roleResult.message || 'Failed to update role');
            setSaving(false);
            return;
          }
        }
      } else {
        // Create new role
        roleResult = await createRole({ name: roleName.trim() });
        if (!roleResult.success) {
          toast.error(roleResult.message || 'Failed to create role');
          setSaving(false);
          return;
        }
      }

      // Step 2: Save permissions (using the role name as key)
      const finalRoleName = roleName.trim();
      const permissionsArray = Object.entries(permissionsData).map(
        ([module, actions]) => ({ module, actions })
      );
      const permResult = await setRolePermissions(finalRoleName, permissionsArray);
      if (permResult.success) {
        toast.success(
          roleId
            ? 'Role and permissions updated successfully'
            : `Role "${finalRoleName}" created with permissions`
        );
        router.push('/super-admin/staff/permissions');
      } else {
        toast.error(permResult.message || 'Permissions not saved, but role was saved');
      }
    } catch (error) {
      console.error(error);
      toast.error('Server error while saving');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="roles-design-page">
        <div className="container-fluid py-4 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="roles-design-page">
      <Toaster position="top-right" />
      <div className="container-fluid py-4">
        {/* Role Information Card */}
        <div className="role-info-card">
          <h3 className="card-title">
            <i className="bi bi-info-circle-fill"></i> Role Information
          </h3>
          <div className="form-group">
            <label htmlFor="roleName">Name</label>
            <input
              type="text"
              id="roleName"
              className="form-control"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="Enter role name (e.g., Goas, Gias, Admin User)"
            />
          </div>
        </div>

        {/* Permissions Section (fully functional) */}
        <div className="permissions-section">
          <h3 className="section-title">
            <i className="bi bi-grid-3x3-gap-fill"></i> Permissions for{' '}
            <span className="role-highlight">{roleName || '(new role)'}</span>
          </h3>
          <div className="permissions-grid">
            {Object.entries(permissionModules).map(([module, actions]) => (
              <div className="permission-card" key={module}>
                <div className="permission-header">
                  <i className="bi bi-folder2-open"></i> {module}
                </div>
                <div className="permission-body">
                  {actions.map((action) => (
                    <label key={`${module}-${action}`} className="permission-item">
                      <input
                        type="checkbox"
                        checked={hasPermission(module, action)}
                        onChange={() => togglePermission(module, action)}
                      />
                      <span>{action}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="permission-hint">
          <i className="bi bi-info-circle"></i> Check/uncheck permissions to grant or revoke access.
        </div>

        {/* Save Button */}
        <div className="save-footer">
          <button
            className="btn-save-all"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Saving...
              </>
            ) : (
              <>
                <i className="bi bi-check-lg"></i> {roleId ? 'Update Role & Permissions' : 'Create Role & Save'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';

import './roles-permissions.css';
import { getAllRoles, getRolePermissions, updateRolePermissions } from '../../../services/permissionService';

export default function RolesPermissionsPage() {
  const router = useRouter();

  const [roles, setRoles] = useState([]);        // array of { _id, name }
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [selectedRoleName, setSelectedRoleName] = useState('');
  const [permissionsData, setPermissionsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  const permissionModules = {
    Products: ['View Products', 'Add Product', 'Edit Product', 'Delete Product'],
    Inventory: ['View Stock', 'Adjust Stock', 'Transfer Stock', 'Manage Batches'],
    Orders: ['View Orders', 'Create Order', 'Edit Order', 'Cancel Order'],
    Customers: ['View Customers', 'Add Customer', 'Edit Customer', 'Delete Customer'],
    Staff: ['View Staff', 'Add Staff', 'Edit Staff', 'Delete Staff', 'Manage Roles'],
    Reports: ['View Reports', 'Export Reports', 'Schedule Reports'],
    Settings: ['View Settings', 'Edit Settings', 'Manage Integrations']
  };

  // Load roles from backend
  useEffect(() => {
    const fetchRoles = async () => {
      console.log('🔍 Fetching roles...');
      try {
        const res = await getAllRoles();
        console.log('✅ Roles response:', res);
        if (res.success) {
          // Ensure unique roles (backend should return unique, but just in case)
          const uniqueRoles = Array.from(new Map(res.data.map(r => [r.name, r])).values());
          setRoles(uniqueRoles);
          if (uniqueRoles.length > 0) {
            setSelectedRoleId(uniqueRoles[0]._id);
            setSelectedRoleName(uniqueRoles[0].name);
          }
        } else {
          toast.error('Failed to load roles');
        }
      } catch (error) {
        console.error('❌ Error fetching roles:', error);
        toast.error('Server error while loading roles');
      } finally {
        setLoading(false);
      }
    };
    fetchRoles();
  }, []);

  // Load permissions when selected role changes
  useEffect(() => {
    if (!selectedRoleName) return;
    const loadPermissions = async () => {
      setLoading(true);
      console.log(`🔍 Loading permissions for role: ${selectedRoleName}`);
      try {
        const res = await getRolePermissions(selectedRoleName);
        console.log(`✅ Permissions for ${selectedRoleName}:`, res);
        if (res.success) {
          const permsObj = {};
          res.data.forEach(perm => {
            permsObj[perm.module] = perm.actions;
          });
          setPermissionsData(permsObj);
        } else {
          toast.error(res.message || 'Failed to load permissions');
        }
      } catch (error) {
        console.error(`❌ Error loading permissions for ${selectedRoleName}:`, error);
        toast.error('Error loading permissions');
      } finally {
        setLoading(false);
      }
    };
    loadPermissions();
  }, [selectedRoleName]);

  const togglePermission = (module, action) => {
    setPermissionsData(prev => {
      const moduleActions = prev[module] ? [...prev[module]] : [];
      if (moduleActions.includes(action)) {
        const filtered = moduleActions.filter(a => a !== action);
        const newData = { ...prev };
        if (filtered.length === 0) delete newData[module];
        else newData[module] = filtered;
        console.log(`🔘 Toggled OFF: ${module} → ${action}`);
        return newData;
      } else {
        console.log(`🔘 Toggled ON: ${module} → ${action}`);
        return { ...prev, [module]: [...moduleActions, action] };
      }
    });
  };

  const hasPermission = (module, action) => {
    return permissionsData[module]?.includes(action) || false;
  };

  const savePermissions = async () => {
    setSaving(true);
    try {
      const permissionsArray = Object.entries(permissionsData).map(([module, actions]) => ({
        module,
        actions
      }));
      console.log(`💾 Saving permissions for ${selectedRoleName}:`, permissionsArray);
      const res = await updateRolePermissions(selectedRoleName, permissionsArray);
      console.log('✅ Save response:', res);
      if (res.success) {
        toast.success('Permissions saved successfully');
        setShowSaveSuccess(true);
        setTimeout(() => setShowSaveSuccess(false), 3000);
      } else {
        toast.error(res.message || 'Save failed');
      }
    } catch (error) {
      console.error('❌ Error saving permissions:', error);
      toast.error('Server error while saving');
    } finally {
      setSaving(false);
    }
  };

  const resetPermissions = () => {
    if (confirm(`Reset all permissions for ${selectedRoleName}?`)) {
      console.log(`🔄 Resetting permissions for ${selectedRoleName}`);
      setPermissionsData({});
    }
  };

  const handleRoleChange = (e) => {
    const selectedId = e.target.value;
    const role = roles.find(r => r._id === selectedId);
    if (role) {
      setSelectedRoleId(role._id);
      setSelectedRoleName(role.name);
      console.log(`📌 Selected role changed to: ${role.name} (ID: ${role._id})`);
    }
  };

  if (loading && roles.length === 0) {
    return <div className="roles-page"><div className="loading-spinner">Loading roles...</div></div>;
  }

  return (
    <div className="roles-page">
      <Toaster position="top-right" />
      <div className="hero-section roles-hero">
        <div>
          <h1 className="hero-title"><i className="bi bi-shield-lock-fill"></i> Roles & Permissions</h1>
          <p className="hero-subtitle">Define what each role can access and manage.</p>
        </div>
        <div className="hero-buttons">
          <button className="btn-glow" onClick={() => router.push('/super-admin/staff')}>
            <i className="bi bi-arrow-left"></i> Back to Staff
          </button>
        </div>
      </div>

      <div className="role-selector-container">
        <div className="role-dropdown">
          <label><i className="bi bi-person-badge"></i> Select Role:</label>
<select value={selectedRoleId} onChange={handleRoleChange}>
  {roles.map(role => (
    <option key={role._id} value={role._id}>
      {role.name}
    </option>
  ))}
</select>
        </div>
        <div className="role-actions">
          <button className="btn-outline" onClick={resetPermissions} disabled={loading}>
            <i className="bi bi-arrow-repeat"></i> Reset Permissions
          </button>
          <button className="btn-primary-glow" onClick={savePermissions} disabled={saving || loading}>
            {saving ? 'Saving...' : <><i className="bi bi-check-lg"></i> Save Changes</>}
          </button>
        </div>
      </div>

      {showSaveSuccess && (
        <div className="success-toast">
          <i className="bi bi-check-circle-fill"></i> Permissions saved successfully!
        </div>
      )}

      <div className="permissions-container">
        <h3><i className="bi bi-grid-3x3-gap-fill"></i> Permissions for <span className="role-highlight">{selectedRoleName}</span></h3>
        {loading ? (
          <div className="loading-spinner">Loading permissions...</div>
        ) : (
          <div className="permissions-grid">
            {Object.entries(permissionModules).map(([module, actions]) => (
              <div className="permission-card" key={module}>
                <div className="permission-header">
                  <i className="bi bi-folder2-open"></i> {module}
                </div>
                <div className="permission-body">
                  {actions.map(action => (
                    <label key={`${module}-${action}`} className="permission-item">  {/* ✅ unique key */}
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
        )}
      </div>

      <div className="permission-hint">
        <i className="bi bi-info-circle"></i> Check/uncheck permissions to grant or revoke access. Changes affect only the selected role.
      </div>
    </div>
  );
}
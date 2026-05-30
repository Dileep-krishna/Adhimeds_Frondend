'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import './roles-permissions.css';

export default function RolesPermissionsPage() {
  const router = useRouter();

  // Predefined roles (same as staff roles)
  const roles = [
    'Pharmacist',
    'Store Manager',
    'Delivery Coordinator',
    'Customer Support',
    'Accountant',
    'Admin'
  ];

  // Permission structure: module -> list of actions
  const permissionModules = {
    Products: ['View Products', 'Add Product', 'Edit Product', 'Delete Product'],
    Inventory: ['View Stock', 'Adjust Stock', 'Transfer Stock', 'Manage Batches'],
    Orders: ['View Orders', 'Create Order', 'Edit Order', 'Cancel Order'],
    Customers: ['View Customers', 'Add Customer', 'Edit Customer', 'Delete Customer'],
    Staff: ['View Staff', 'Add Staff', 'Edit Staff', 'Delete Staff', 'Manage Roles'],
    Reports: ['View Reports', 'Export Reports', 'Schedule Reports'],
    Settings: ['View Settings', 'Edit Settings', 'Manage Integrations']
  };

  // State for permissions per role (initially empty)
  const [rolePermissions, setRolePermissions] = useState({});
  const [selectedRole, setSelectedRole] = useState('Pharmacist');
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // Get current permissions for selected role
  const currentPermissions = rolePermissions[selectedRole] || {};

  // Toggle a specific permission for current role
  const togglePermission = (module, action) => {
    setRolePermissions(prev => {
      const roleData = { ...(prev[selectedRole] || {}) };
      if (!roleData[module]) roleData[module] = [];
      if (roleData[module].includes(action)) {
        roleData[module] = roleData[module].filter(a => a !== action);
        if (roleData[module].length === 0) delete roleData[module];
      } else {
        roleData[module] = [...(roleData[module] || []), action];
      }
      const newData = { ...prev, [selectedRole]: roleData };
      return newData;
    });
  };

  // Check if permission is enabled
  const hasPermission = (module, action) => {
    return currentPermissions[module]?.includes(action) || false;
  };

  // Save permissions (simulate API call)
  const savePermissions = () => {
    // In real app, send rolePermissions to backend
    console.log('Saved permissions:', rolePermissions);
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  // Reset permissions for selected role
  const resetPermissions = () => {
    if (confirm(`Reset all permissions for ${selectedRole}?`)) {
      setRolePermissions(prev => {
        const newData = { ...prev };
        delete newData[selectedRole];
        return newData;
      });
    }
  };

  // Pre-fill some demo permissions for Admin (optional – you can remove this)
  const loadDemoPermissions = () => {
    const demo = {
      Admin: {
        Products: ['View Products', 'Add Product', 'Edit Product', 'Delete Product'],
        Inventory: ['View Stock', 'Adjust Stock', 'Transfer Stock', 'Manage Batches'],
        Orders: ['View Orders', 'Create Order', 'Edit Order', 'Cancel Order'],
        Customers: ['View Customers', 'Add Customer', 'Edit Customer', 'Delete Customer'],
        Staff: ['View Staff', 'Add Staff', 'Edit Staff', 'Delete Staff', 'Manage Roles'],
        Reports: ['View Reports', 'Export Reports', 'Schedule Reports'],
        Settings: ['View Settings', 'Edit Settings', 'Manage Integrations']
      },
      Pharmacist: {
        Products: ['View Products', 'Add Product', 'Edit Product'],
        Inventory: ['View Stock', 'Adjust Stock'],
        Orders: ['View Orders', 'Create Order', 'Edit Order'],
        Customers: ['View Customers', 'Add Customer', 'Edit Customer'],
        Reports: ['View Reports']
      },
      'Store Manager': {
        Products: ['View Products', 'Add Product', 'Edit Product'],
        Inventory: ['View Stock', 'Adjust Stock', 'Transfer Stock'],
        Orders: ['View Orders', 'Create Order', 'Edit Order', 'Cancel Order'],
        Customers: ['View Customers', 'Add Customer', 'Edit Customer'],
        Staff: ['View Staff'],
        Reports: ['View Reports', 'Export Reports']
      }
    };
    setRolePermissions(demo);
  };

  return (
    <div className="roles-page">
      {/* Hero Header */}
      <div className="hero-section roles-hero">
        <div>
          <h1 className="hero-title"><i className="bi bi-shield-lock-fill"></i> Roles & Permissions</h1>
          <p className="hero-subtitle">Define what each role can access and manage.</p>
        </div>
        <div className="hero-buttons">
          <button className="btn-glow demo-btn" onClick={loadDemoPermissions}>
            <i className="bi bi-database"></i> Load Demo
          </button>
          <button className="btn-glow" onClick={() => router.push('/super-admin/staff')}>
            <i className="bi bi-arrow-left"></i> Back to Staff
          </button>
        </div>
      </div>

      {/* Role Selector + Actions */}
      <div className="role-selector-container">
        <div className="role-dropdown">
          <label><i className="bi bi-person-badge"></i> Select Role:</label>
          <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
            {roles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>
        <div className="role-actions">
          <button className="btn-outline" onClick={resetPermissions}>
            <i className="bi bi-arrow-repeat"></i> Reset Permissions
          </button>
          <button className="btn-primary-glow" onClick={savePermissions}>
            <i className="bi bi-check-lg"></i> Save Changes
          </button>
        </div>
      </div>

      {/* Success Toast */}
      {showSaveSuccess && (
        <div className="success-toast">
          <i className="bi bi-check-circle-fill"></i> Permissions saved successfully!
        </div>
      )}

      {/* Permissions Matrix */}
      <div className="permissions-container">
        <h3><i className="bi bi-grid-3x3-gap-fill"></i> Permissions for <span className="role-highlight">{selectedRole}</span></h3>
        <div className="permissions-grid">
          {Object.entries(permissionModules).map(([module, actions]) => (
            <div className="permission-card" key={module}>
              <div className="permission-header">
                <i className="bi bi-folder2-open"></i> {module}
              </div>
              <div className="permission-body">
                {actions.map(action => (
                  <label key={action} className="permission-item">
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

      {/* Hint */}
      <div className="permission-hint">
        <i className="bi bi-info-circle"></i> Check/uncheck permissions to grant or revoke access. Changes affect only the selected role.
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';

import './staff.css';
import { createStaffAPI, deleteStaffAPI, getStaffAPI, updateStaffAPI } from '../../services/staffService';
import { getAllRoles } from '../../services/permissionService';

export default function StaffManagement() {
  const router = useRouter();

  // State
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [viewingStaff, setViewingStaff] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Dynamic roles from API
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);

  // Form data – only relevant fields
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    password: '',
    confirmPassword: '',
    email: '',
    phone: '',
    status: 'active',
    joinDate: new Date().toISOString().split('T')[0],
  });

  // Fetch roles from API
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await getAllRoles();
        if (res.success && res.data) {
          const roleNames = res.data.map(r => r.name);
          setRoles(roleNames);
          if (roleNames.length > 0) {
            setFormData(prev => ({ ...prev, role: roleNames[0] }));
          }
        } else {
          toast.error('Failed to load roles');
        }
      } catch (error) {
        console.error('Error fetching roles:', error);
        toast.error('Server error while loading roles');
      } finally {
        setLoadingRoles(false);
      }
    };
    fetchRoles();
  }, []);

  // Fetch staff
  const fetchStaff = async () => {
    setLoading(true);
    try {
      const response = await getStaffAPI();
      if (response.success) {
        setStaff(response.data);
      } else {
        toast.error(response.message || 'Failed to load staff');
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error('Server error while loading staff');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // Filter staff
  const filteredStaff = staff.filter(member => {
    const matchesSearch =
      member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.role?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || member.role?.name === roleFilter;
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Open modal for add/edit
  const openModal = (member = null) => {
    if (member) {
      setEditingStaff(member);
      setFormData({
        name: member.fullName,
        role: member.role?.name || (roles.length ? roles[0] : ''),
        password: '',
        confirmPassword: '',
        email: member.email,
        phone: member.phone,
        status: member.status,
        joinDate: member.joiningDate
          ? new Date(member.joiningDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
      });
    } else {
      setEditingStaff(null);
      setFormData({
        name: '',
        role: roles.length ? roles[0] : '',
        password: '',
        confirmPassword: '',
        email: '',
        phone: '',
        status: 'active',
        joinDate: new Date().toISOString().split('T')[0],
      });
    }
    setShowModal(true);
  };

  // Save staff (create or update)
  const saveStaff = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('Name, email, and phone are required');
      return;
    }
    if (!editingStaff && !formData.password) {
      toast.error('Password is required for new staff');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        fullName: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        status: formData.status,
        joiningDate: formData.joinDate,
      };
      if (formData.password) {
        payload.password = formData.password;
      }

      let response;
      if (editingStaff) {
        response = await updateStaffAPI(editingStaff._id, payload);
      } else {
        response = await createStaffAPI(payload);
      }

      if (response.success) {
        toast.success(editingStaff ? 'Staff updated successfully' : 'Staff added successfully');
        fetchStaff();
        setShowModal(false);
      } else {
        toast.error(response.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving staff:', error);
      toast.error('Server error while saving staff');
    } finally {
      setSaving(false);
    }
  };

  const deleteStaff = async (id) => {
    setDeleting(true);
    try {
      const response = await deleteStaffAPI(id);
      if (response.success) {
        toast.success('Staff deleted successfully');
        fetchStaff();
      } else {
        toast.error(response.message || 'Deletion failed');
      }
    } catch (error) {
      console.error('Error deleting staff:', error);
      toast.error('Server error while deleting staff');
    } finally {
      setDeleting(false);
      setDeleteConfirm(null);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      const response = await updateStaffAPI(id, { status: newStatus });
      if (response.success) {
        toast.success(`Staff marked as ${newStatus}`);
        fetchStaff();
      } else {
        toast.error(response.message || 'Status update failed');
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Server error while updating status');
    }
  };

  if (loadingRoles) return <div className="staff-page"><div className="loading-spinner">Loading roles...</div></div>;

  return (
    <div className="staff-page">
      <Toaster position="top-right" />

      <div className="hero-section staff-hero">
        <div>
          <h1 className="hero-title"><i className="bi bi-people-fill"></i> Staff Management</h1>
          <p className="hero-subtitle">Manage your team members, roles, and assignments.</p>
        </div>
        <div className="hero-buttons">
          <button className="btn-glow roles-perms" onClick={() => router.push('/super-admin/staff/role-permission')}>
            <i className="bi bi-shield-lock-fill"></i> Roles & Permissions
          </button>
          <button className="btn-glow" onClick={() => openModal()}>
            <i className="bi bi-person-plus"></i> Add Staff Member
          </button>
        </div>
      </div>

      {/* Stats Cards – removed district count */}
      <div className="staff-stats">
        <div className="stat-card"><i className="bi bi-person-badge"></i><div><span className="stat-number">{staff.length}</span><span>Total Staff</span></div></div>
        <div className="stat-card"><i className="bi bi-check-circle-fill"></i><div><span className="stat-number">{staff.filter(s => s.status === 'active').length}</span><span>Active</span></div></div>
        <div className="stat-card"><i className="bi bi-briefcase-fill"></i><div><span className="stat-number">{new Set(staff.map(s => s.role?.name)).size}</span><span>Roles</span></div></div>
        {/* District stat removed */}
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="search-group"><i className="bi bi-search"></i><input type="text" placeholder="Search by name, email or role..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
        <div className="filter-group"><label><i className="bi bi-briefcase"></i> Role</label><select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}><option value="all">All Roles</option>{roles.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
        <div className="filter-group"><label><i className="bi bi-flag"></i> Status</label><select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option value="all">All</option><option value="active">Active</option><option value="inactive">Inactive</option><option value="pending">Pending</option></select></div>
      </div>

      {/* Staff Grid – removed district line */}
      {loading ? (
        <div className="loading-spinner">Loading staff...</div>
      ) : (
        <div className="staff-grid">
          {filteredStaff.map(member => (
            <div className="staff-card" key={member._id}>
              <div className="card-status-badge" data-status={member.status}>
                {member.status === 'active' ? 'Active' : member.status === 'inactive' ? 'Inactive' : 'Pending'}
              </div>
              <div className="staff-avatar">{member.fullName.charAt(0)}{member.fullName.split(' ')[1]?.charAt(0) || ''}</div>
              <h3 className="staff-name">{member.fullName}</h3>
              <div className="staff-role">{member.role?.name}</div>
              <div className="staff-details">
                <p><i className="bi bi-envelope"></i> {member.email}</p>
                <p><i className="bi bi-telephone"></i> {member.phone}</p>
                <p><i className="bi bi-calendar"></i> Joined: {member.joiningDate ? new Date(member.joiningDate).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div className="staff-actions">
                <button className="action-icon view" onClick={() => setViewingStaff(member)}><i className="bi bi-eye"></i></button>
                <button className="action-icon edit" onClick={() => openModal(member)}><i className="bi bi-pencil"></i></button>
                <button className="action-icon delete" onClick={() => setDeleteConfirm(member._id)}><i className="bi bi-trash"></i></button>
                <button className={`status-toggle ${member.status}`} onClick={() => toggleStatus(member._id, member.status)}>
                  <i className={`bi ${member.status === 'active' ? 'bi-toggle-on' : 'bi-toggle-off'}`}></i>
                </button>
              </div>
            </div>
          ))}
          {filteredStaff.length === 0 && (
            <div className="empty-state">
              <i className="bi bi-person-x"></i>
              <p>No staff members found. Click "Add Staff Member" to get started.</p>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal – unchanged (no district) */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><i className="bi bi-person-plus"></i> {editingStaff ? 'Edit Staff' : 'Add Staff Member'}</h3>
              <button className="close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Full name" />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="email@example.com" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+91 XXXXX XXXXX" />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                    {roles.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Password {!editingStaff && <span className="required">*</span>}</label>
                  <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder={editingStaff ? 'Leave blank to keep current' : 'Enter password'} />
                </div>
                <div className="form-group">
                  <label>Confirm Password</label>
                  <input type="password" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} placeholder="Confirm password" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Joining Date</label>
                  <input type="date" value={formData.joinDate} onChange={e => setFormData({...formData, joinDate: e.target.value})} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={saveStaff} disabled={saving}>
                {saving ? 'Saving...' : (editingStaff ? 'Update' : 'Add')} Staff
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal – removed district row */}
      {viewingStaff && (
        <div className="modal-overlay" onClick={() => setViewingStaff(null)}>
          <div className="modal-content view-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3><i className="bi bi-person-circle"></i> Staff Details</h3><button className="close" onClick={() => setViewingStaff(null)}>&times;</button></div>
            <div className="modal-body view-body">
              <div className="detail-row"><span>Name:</span><strong>{viewingStaff.fullName}</strong></div>
              <div className="detail-row"><span>Role:</span><strong>{viewingStaff.role?.name}</strong></div>
              <div className="detail-row"><span>Email:</span><strong>{viewingStaff.email}</strong></div>
              <div className="detail-row"><span>Phone:</span><strong>{viewingStaff.phone}</strong></div>
              {/* District row removed */}
              <div className="detail-row"><span>Status:</span><span className={`status-badge ${viewingStaff.status}`}>{viewingStaff.status}</span></div>
              <div className="detail-row"><span>Joined:</span><strong>{viewingStaff.joiningDate ? new Date(viewingStaff.joiningDate).toLocaleDateString() : 'N/A'}</strong></div>
            </div>
            <div className="modal-footer"><button className="btn-secondary" onClick={() => setViewingStaff(null)}>Close</button></div>
          </div>
        </div>
      )}

      {/* Delete Confirm (unchanged) */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content delete-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3><i className="bi bi-exclamation-triangle"></i> Confirm Delete</h3><button className="close" onClick={() => setDeleteConfirm(null)}>&times;</button></div>
            <div className="modal-body"><p>Are you sure you want to delete this staff member? This action cannot be undone.</p></div>
            <div className="modal-footer"><button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button><button className="btn-danger" onClick={() => deleteStaff(deleteConfirm)} disabled={deleting}>{deleting ? 'Deleting...' : 'Delete'}</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
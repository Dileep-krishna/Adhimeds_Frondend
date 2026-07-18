'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import './staff.css';
import { getAllRoles } from '@/app/services/permissionService';
import { deleteStaffAPI, getStaffAPI, updateStaffAPI } from '@/app/services/staffService';


export default function StaffManagement() {
  const router = useRouter();

  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [viewingStaff, setViewingStaff] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);

  // Fetch roles for filter
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await getAllRoles();
        if (res.success && res.data) {
          setRoles(res.data.map(r => r.name));
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

  const filteredStaff = staff.filter(member => {
    const matchesSearch =
      member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.role?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.district || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || member.role?.name === roleFilter;
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

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

  if (loadingRoles) return <div className="staff-page"><div className="loading-spinner">Loading...</div></div>;

  return (
    <div className="staff-page">
      <Toaster position="top-right" />

      <div className="staff-hero">
        <div>
          <div className="hero-title">
            <i className="bi bi-people-fill"></i> Staff Management
          </div>
          <div className="hero-subtitle">Manage your team members, roles, and assignments.</div>
        </div>
        <div className="hero-buttons">
          <button className="btn-glow roles-perms" onClick={() => router.push('/super-admin/staff/RoleAdd')}>
            <i className="bi bi-shield-lock-fill"></i> Roles & Permissions
          </button>
          <button className="btn-glow" onClick={() => router.push('/super-admin/staff/add')}>
            <i className="bi bi-person-plus"></i> Add Staff Member
          </button>
        </div>
      </div>

      <div className="staff-stats">
        <div className="stat-card">
          <i className="bi bi-person-badge"></i>
          <div>
            <span className="stat-number">{staff.length}</span>
            <span>Total Staff</span>
          </div>
        </div>
        <div className="stat-card">
          <i className="bi bi-check-circle-fill"></i>
          <div>
            <span className="stat-number">{staff.filter(s => s.status === 'active').length}</span>
            <span>Active</span>
          </div>
        </div>
        <div className="stat-card">
          <i className="bi bi-briefcase-fill"></i>
          <div>
            <span className="stat-number">{new Set(staff.map(s => s.role?.name)).size}</span>
            <span>Roles</span>
          </div>
        </div>
        <div className="stat-card">
          <i className="bi bi-geo-alt-fill"></i>
          <div>
            <span className="stat-number">{new Set(staff.map(s => s.district).filter(Boolean)).size}</span>
            <span>Districts</span>
          </div>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-group">
          <i className="bi bi-search"></i>
          <input
            type="text"
            placeholder="Search by name, email, role or district..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label><i className="bi bi-briefcase"></i> Role</label>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            <option value="all">All Roles</option>
            {roles.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label><i className="bi bi-flag"></i> Status</label>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading staff...</div>
      ) : (
        <div className="staff-table-wrapper">
          <table className="staff-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>District</th>
                <th>Status</th>
                <th>Joined</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map((member, index) => (
                <tr key={member._id}>
                  <td>{index + 1}</td>
                  <td>
                    <div className="staff-name-cell">
                      <span className="staff-avatar-sm">
                        {member.fullName.charAt(0)}{member.fullName.split(' ')[1]?.charAt(0) || ''}
                      </span>
                      <span className="fw-semibold">{member.fullName}</span>
                    </div>
                  </td>
                  <td>{member.email}</td>
                  <td>{member.phone}</td>
                  <td><span className="role-badge">{member.role?.name}</span></td>
                  <td>{member.district || '—'}</td>
                  <td>
                    <span className={`status-badge ${member.status}`}>
                      {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                    </span>
                  </td>
                  <td>{member.joiningDate ? new Date(member.joiningDate).toLocaleDateString() : '—'}</td>
                  <td>
                    <div className="actions-group">
                      <button className="action-btn view-btn" onClick={() => setViewingStaff(member)} title="View">
                        <i className="bi bi-eye"></i>
                      </button>
                      <button className="action-btn edit-btn" onClick={() => router.push(`/super-admin/staff/edit/${member._id}`)} title="Edit">
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button className="action-btn delete-btn" onClick={() => setDeleteConfirm(member._id)} title="Delete">
                        <i className="bi bi-trash"></i>
                      </button>
                      <button className="action-btn toggle-btn" onClick={() => toggleStatus(member._id, member.status)} title="Toggle Status">
                        <i className={`bi ${member.status === 'active' ? 'bi-toggle-on text-success' : 'bi-toggle-off text-secondary'}`}></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredStaff.length === 0 && (
                <tr>
                  <td colSpan="9" className="text-center py-4 text-muted">
                    <i className="bi bi-person-x me-2"></i> No staff members found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* View Modal */}
      {viewingStaff && (
        <div className="modal-overlay" onClick={() => setViewingStaff(null)}>
          <div className="modal-content view-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><i className="bi bi-person-circle"></i> Staff Details</h3>
              <button className="close" onClick={() => setViewingStaff(null)}>&times;</button>
            </div>
            <div className="modal-body view-body">
              <div className="detail-row"><span>Name:</span><strong>{viewingStaff.fullName}</strong></div>
              <div className="detail-row"><span>Role:</span><strong>{viewingStaff.role?.name}</strong></div>
              <div className="detail-row"><span>Email:</span><strong>{viewingStaff.email}</strong></div>
              <div className="detail-row"><span>Phone:</span><strong>{viewingStaff.phone}</strong></div>
              <div className="detail-row"><span>District:</span><strong>{viewingStaff.district || 'N/A'}</strong></div>
              <div className="detail-row"><span>Status:</span><span className={`status-badge ${viewingStaff.status}`}>{viewingStaff.status}</span></div>
              <div className="detail-row"><span>Joined:</span><strong>{viewingStaff.joiningDate ? new Date(viewingStaff.joiningDate).toLocaleDateString() : 'N/A'}</strong></div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setViewingStaff(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content delete-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><i className="bi bi-exclamation-triangle"></i> Confirm Delete</h3>
              <button className="close" onClick={() => setDeleteConfirm(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this staff member? This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn-danger" onClick={() => deleteStaff(deleteConfirm)} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
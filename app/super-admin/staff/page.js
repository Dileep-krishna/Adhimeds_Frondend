'use client';

import { useState } from 'react';
import './staff.css';

export default function StaffManagement() {
  const [staff, setStaff] = useState([
    { id: 1, name: 'Rahul Sharma', role: 'Pharmacist', district: 'Ernakulam', email: 'rahul@pharmacy.com', phone: '+91 98765 43210', status: 'active', joinDate: '2023-01-15' },
    { id: 2, name: 'Priya Patel', role: 'Store Manager', district: 'Thiruvananthapuram', email: 'priya@store.com', phone: '+91 87654 32109', status: 'active', joinDate: '2023-03-20' },
    { id: 3, name: 'Ahmed Khan', role: 'Delivery Coordinator', district: 'Kozhikode', email: 'ahmed@delivery.com', phone: '+91 76543 21098', status: 'inactive', joinDate: '2023-06-10' },
    { id: 4, name: 'Sneha Nair', role: 'Customer Support', district: 'Kochi', email: 'sneha@support.com', phone: '+91 65432 10987', status: 'active', joinDate: '2024-01-05' },
    { id: 5, name: 'Vikram Singh', role: 'Accountant', district: 'Kollam', email: 'vikram@accounts.com', phone: '+91 54321 09876', status: 'pending', joinDate: '2024-02-18' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [viewingStaff, setViewingStaff] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    name: '', role: '', district: '', email: '', phone: '', status: 'active', joinDate: new Date().toISOString().split('T')[0]
  });

  const roles = ['Pharmacist', 'Store Manager', 'Delivery Coordinator', 'Customer Support', 'Accountant', 'Admin'];
  const districts = ['Ernakulam', 'Thiruvananthapuram', 'Kozhikode', 'Kochi', 'Kollam', 'Palakkad', 'Thrissur'];

  const filteredStaff = staff.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          member.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const openModal = (member = null) => {
    if (member) {
      setEditingStaff(member);
      setFormData({
        name: member.name, role: member.role, district: member.district,
        email: member.email, phone: member.phone, status: member.status, joinDate: member.joinDate
      });
    } else {
      setEditingStaff(null);
      setFormData({
        name: '', role: roles[0], district: districts[0], email: '', phone: '',
        status: 'active', joinDate: new Date().toISOString().split('T')[0]
      });
    }
    setShowModal(true);
  };

  const saveStaff = () => {
    if (!formData.name || !formData.email) return;
    if (editingStaff) {
      setStaff(staff.map(s => s.id === editingStaff.id ? { ...s, ...formData } : s));
    } else {
      const newId = Math.max(0, ...staff.map(s => s.id)) + 1;
      setStaff([...staff, { id: newId, ...formData }]);
    }
    setShowModal(false);
  };

  const deleteStaff = (id) => {
    setStaff(staff.filter(s => s.id !== id));
    setDeleteConfirm(null);
  };

  const toggleStatus = (id) => {
    setStaff(staff.map(s => s.id === id ? 
      { ...s, status: s.status === 'active' ? 'inactive' : 'active' } : s));
  };

  return (
    <div className="staff-page">
      {/* Hero Header */}
      <div className="hero-section staff-hero">
        <div>
          <h1 className="hero-title"><i className="bi bi-people-fill"></i> Staff Management</h1>
          <p className="hero-subtitle">Manage your team members, roles, and assignments.</p>
        </div>
        <button className="btn-glow" onClick={() => openModal()}>
          <i className="bi bi-person-plus"></i> Add Staff Member
        </button>
      </div>

      {/* Stats Cards */}
      <div className="staff-stats">
        <div className="stat-card"><i className="bi bi-person-badge"></i><div><span className="stat-number">{staff.length}</span><span>Total Staff</span></div></div>
        <div className="stat-card"><i className="bi bi-check-circle-fill"></i><div><span className="stat-number">{staff.filter(s => s.status === 'active').length}</span><span>Active</span></div></div>
        <div className="stat-card"><i className="bi bi-briefcase-fill"></i><div><span className="stat-number">{new Set(staff.map(s => s.role)).size}</span><span>Roles</span></div></div>
        <div className="stat-card"><i className="bi bi-geo-alt-fill"></i><div><span className="stat-number">{new Set(staff.map(s => s.district)).size}</span><span>Districts</span></div></div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="search-group"><i className="bi bi-search"></i><input type="text" placeholder="Search by name, email or role..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
        <div className="filter-group"><label><i className="bi bi-briefcase"></i> Role</label><select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}><option value="all">All Roles</option>{roles.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
        <div className="filter-group"><label><i className="bi bi-flag"></i> Status</label><select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option value="all">All</option><option value="active">Active</option><option value="inactive">Inactive</option><option value="pending">Pending</option></select></div>
      </div>

      {/* Staff Grid (Responsive Cards) */}
      <div className="staff-grid">
        {filteredStaff.map(member => (
          <div className="staff-card" key={member.id}>
            <div className="card-status-badge" data-status={member.status}>
              {member.status === 'active' ? 'Active' : member.status === 'inactive' ? 'Inactive' : 'Pending'}
            </div>
            <div className="staff-avatar">{member.name.charAt(0)}{member.name.split(' ')[1]?.charAt(0) || ''}</div>
            <h3 className="staff-name">{member.name}</h3>
            <div className="staff-role">{member.role}</div>
            <div className="staff-details">
              <p><i className="bi bi-envelope"></i> {member.email}</p>
              <p><i className="bi bi-telephone"></i> {member.phone}</p>
              <p><i className="bi bi-geo-alt"></i> {member.district}</p>
              <p><i className="bi bi-calendar"></i> Joined: {member.joinDate}</p>
            </div>
            <div className="staff-actions">
              <button className="action-icon view" onClick={() => setViewingStaff(member)}><i className="bi bi-eye"></i></button>
              <button className="action-icon edit" onClick={() => openModal(member)}><i className="bi bi-pencil"></i></button>
              <button className="action-icon delete" onClick={() => setDeleteConfirm(member.id)}><i className="bi bi-trash"></i></button>
              <button className={`status-toggle ${member.status}`} onClick={() => toggleStatus(member.id)}>
                <i className={`bi ${member.status === 'active' ? 'bi-toggle-on' : 'bi-toggle-off'}`}></i>
              </button>
            </div>
          </div>
        ))}
        {filteredStaff.length === 0 && (<div className="empty-state"><i className="bi bi-person-x"></i><p>No staff members found</p></div>)}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3><i className="bi bi-person-plus"></i> {editingStaff ? 'Edit Staff' : 'Add Staff Member'}</h3><button className="close" onClick={() => setShowModal(false)}>&times;</button></div>
            <div className="modal-body">
              <div className="form-row"><div className="form-group"><label>Full Name</label><input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Full name" /></div>
              <div className="form-group"><label>Email</label><input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="email@example.com" /></div></div>
              <div className="form-row"><div className="form-group"><label>Phone</label><input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+91 XXXXX XXXXX" /></div>
              <div className="form-group"><label>Role</label><select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>{roles.map(r => <option key={r} value={r}>{r}</option>)}</select></div></div>
              <div className="form-row"><div className="form-group"><label>District</label><select value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})}>{districts.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
              <div className="form-group"><label>Status</label><select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}><option value="active">Active</option><option value="inactive">Inactive</option><option value="pending">Pending</option></select></div></div>
              <div className="form-group"><label>Joining Date</label><input type="date" value={formData.joinDate} onChange={e => setFormData({...formData, joinDate: e.target.value})} /></div>
            </div>
            <div className="modal-footer"><button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button className="btn-primary" onClick={saveStaff}>{editingStaff ? 'Update' : 'Add'} Staff</button></div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewingStaff && (
        <div className="modal-overlay" onClick={() => setViewingStaff(null)}>
          <div className="modal-content view-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3><i className="bi bi-person-circle"></i> Staff Details</h3><button className="close" onClick={() => setViewingStaff(null)}>&times;</button></div>
            <div className="modal-body view-body">
              <div className="detail-row"><span>Name:</span><strong>{viewingStaff.name}</strong></div>
              <div className="detail-row"><span>Role:</span><strong>{viewingStaff.role}</strong></div>
              <div className="detail-row"><span>Email:</span><strong>{viewingStaff.email}</strong></div>
              <div className="detail-row"><span>Phone:</span><strong>{viewingStaff.phone}</strong></div>
              <div className="detail-row"><span>District:</span><strong>{viewingStaff.district}</strong></div>
              <div className="detail-row"><span>Status:</span><span className={`status-badge ${viewingStaff.status}`}>{viewingStaff.status}</span></div>
              <div className="detail-row"><span>Joined:</span><strong>{viewingStaff.joinDate}</strong></div>
            </div>
            <div className="modal-footer"><button className="btn-secondary" onClick={() => setViewingStaff(null)}>Close</button></div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content delete-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3><i className="bi bi-exclamation-triangle"></i> Confirm Delete</h3><button className="close" onClick={() => setDeleteConfirm(null)}>&times;</button></div>
            <div className="modal-body"><p>Are you sure you want to delete this staff member? This action cannot be undone.</p></div>
            <div className="modal-footer"><button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button><button className="btn-danger" onClick={() => deleteStaff(deleteConfirm)}>Delete</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
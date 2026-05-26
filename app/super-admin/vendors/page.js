'use client';

import { useState, useEffect } from 'react';
import './vendors.css'; // separate CSS (provided below)

export default function VendorManagement() {
  const [vendors, setVendors] = useState([
    { id: 1, name: 'FreshMart', email: 'contact@freshmart.com', phone: '+1 234 567 890', status: 'active', joined: 'Jan 2024', orders: 245 },
    { id: 2, name: 'TechHub', email: 'hello@techhub.com', phone: '+1 345 678 901', status: 'active', joined: 'Feb 2024', orders: 189 },
    { id: 3, name: 'HomeStyle', email: 'support@homestyle.com', phone: '+1 456 789 012', status: 'inactive', joined: 'Mar 2024', orders: 102 },
    { id: 4, name: 'ElectroWorld', email: 'sales@electroworld.com', phone: '+1 567 890 123', status: 'active', joined: 'Apr 2024', orders: 78 },
    { id: 5, name: 'FashionFiesta', email: 'info@fashionfiesta.com', phone: '+1 678 901 234', status: 'pending', joined: 'May 2024', orders: 34 },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', status: 'active' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Filter vendors
  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          vendor.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || vendor.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Open modal for add/edit
  const openModal = (vendor = null) => {
    if (vendor) {
      setEditingVendor(vendor);
      setFormData({ name: vendor.name, email: vendor.email, phone: vendor.phone, status: vendor.status });
    } else {
      setEditingVendor(null);
      setFormData({ name: '', email: '', phone: '', status: 'active' });
    }
    setShowModal(true);
  };

  // Save vendor (add or update)
  const saveVendor = () => {
    if (!formData.name || !formData.email) return;
    if (editingVendor) {
      setVendors(vendors.map(v => v.id === editingVendor.id ? { ...v, ...formData } : v));
    } else {
      const newId = Math.max(0, ...vendors.map(v => v.id)) + 1;
      setVendors([...vendors, { id: newId, ...formData, joined: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), orders: 0 }]);
    }
    setShowModal(false);
  };

  // Delete vendor
  const deleteVendor = (id) => {
    setVendors(vendors.filter(v => v.id !== id));
    setDeleteConfirm(null);
  };

  return (
    <div className="vendor-management-container">
      {/* Hero Header */}
      <div className="vendor-hero">
        <div>
          <h1 className="vendor-title">Vendor Management</h1>
          <p className="vendor-subtitle">Manage all your registered vendors, track performance, and control access.</p>
        </div>
        <button className="btn-primary-gradient" onClick={() => openModal()}>
          <i className="bi bi-plus-circle"></i> Add New Vendor
        </button>
      </div>

      {/* Search & Filters */}
      <div className="vendor-controls">
        <div className="search-box">
          <i className="bi bi-search"></i>
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>Status:</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Vendor Table */}
      <div className="vendor-table-container">
        <table className="vendor-table">
          <thead>
            <tr>
              <th>Vendor</th>
              <th>Contact</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Orders</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVendors.map(vendor => (
              <tr key={vendor.id} className="vendor-row">
                <td>
                  <div className="vendor-info">
                    <div className="vendor-avatar">
                      <i className="bi bi-shop"></i>
                    </div>
                    <div>
                      <strong>{vendor.name}</strong>
                      <div className="vendor-email">{vendor.email}</div>
                    </div>
                  </div>
                </td>
                <td>{vendor.phone}</td>
                <td>
                  <span className={`status-badge ${vendor.status}`}>
                    {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
                  </span>
                </td>
                <td>{vendor.joined}</td>
                <td>{vendor.orders}</td>
                <td>
                  <div className="action-buttons">
                    <button className="action-icon edit" onClick={() => openModal(vendor)} title="Edit">
                      <i className="bi bi-pencil-square"></i>
                    </button>
                    <button className="action-icon delete" onClick={() => setDeleteConfirm(vendor.id)} title="Delete">
                      <i className="bi bi-trash3"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredVendors.length === 0 && (
          <div className="empty-state">
            <i className="bi bi-inbox"></i>
            <p>No vendors found</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingVendor ? 'Edit Vendor' : 'Add New Vendor'}</h3>
              <button className="close-modal" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Vendor Name *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g., FreshMart" />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="contact@vendor.com" />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="+1 234 567 890" />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={saveVendor}>{editingVendor ? 'Update' : 'Add'} Vendor</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content delete-confirm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirm Delete</h3>
              <button className="close-modal" onClick={() => setDeleteConfirm(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this vendor? This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn-danger" onClick={() => deleteVendor(deleteConfirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
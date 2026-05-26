'use client';

import { useState, useEffect } from 'react';
import './delivery-boys.css';
import {
  addDeliveryBoyAPI,
  deleteDeliveryBoyAPI,
  getDeliveryBoysAPI,
  updateStatusAPI,
} from '../../services/deliveryService';

export default function DeliveryBoysPage() {
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingBoy, setEditingBoy] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    aadharNumber: '',
    aadharImage: null,
    licenseNumber: '',
    licenseImage: null,
    bikeNumber: '',
    district: 'Thiruvananthapuram',
    status: 'active',
  });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const keralaDistricts = [
    'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha',
    'Kottayam', 'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad',
    'Malappuram', 'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod',
  ];

  // Fetch all delivery boys
  const fetchDeliveryBoys = async () => {
    console.log("📤 Fetching delivery boys...");
    setIsLoading(true);
    setError('');
    try {
      const result = await getDeliveryBoysAPI();
      let data = [];
      if (Array.isArray(result)) data = result;
      else if (result?.data && Array.isArray(result.data)) data = result.data;
      else if (result?.success && Array.isArray(result?.data)) data = result.data;
      else if (result?.boys && Array.isArray(result.boys)) data = result.boys;
      else data = [];

      const formattedData = data.map((boy, index) => ({
        id: boy._id || index + 1,
        name: boy.name,
        phone: boy.phone,
        district: boy.district || boy.zone,
        status: boy.status,
        deliveries: boy.deliveries || 0,
        rating: boy.rating || 0,
        avatar: boy.name
          ?.split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2),
      }));
      setDeliveryBoys(formattedData);
    } catch (err) {
      console.log("❌ Fetch Exception:", err);
      setError('Failed to load delivery boys. Please try again.');
      setDeliveryBoys([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryBoys();
  }, []);

  const totalBoys = deliveryBoys.length;
  const activeBoys = deliveryBoys.filter((b) => b.status === 'active').length;
  const topDeliveries = deliveryBoys.length ? Math.max(...deliveryBoys.map((b) => b.deliveries)) : 0;

  const filteredBoys = deliveryBoys.filter((boy) => {
    const matchesSearch =
      boy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      boy.phone.includes(searchTerm);
    const matchesDistrict = districtFilter === 'all' || boy.district === districtFilter;
    const matchesStatus = statusFilter === 'all' || boy.status === statusFilter;
    return matchesSearch && matchesDistrict && matchesStatus;
  });

  const openModal = (boy = null) => {
    if (boy) {
      setEditingBoy(boy);
      setFormData({
        name: boy.name,
        email: boy.email || '',
        phone: boy.phone,
        password: '',
        aadharNumber: boy.aadharNumber || '',
        aadharImage: null,
        licenseNumber: boy.licenseNumber || '',
        licenseImage: null,
        bikeNumber: boy.bikeNumber || '',
        district: boy.district,
        status: boy.status,
      });
    } else {
      setEditingBoy(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        aadharNumber: '',
        aadharImage: null,
        licenseNumber: '',
        licenseImage: null,
        bikeNumber: '',
        district: 'Thiruvananthapuram',
        status: 'active',
      });
    }
    setShowModal(true);
  };

  const saveBoy = async () => {
    if (!formData.name || !formData.phone) return;
    if (isSaving) return;

    setIsSaving(true);
    try {
      const reqBody = new FormData();
      reqBody.append('name', formData.name);
      reqBody.append('email', formData.email || '');
      reqBody.append('phone', formData.phone);
      reqBody.append('password', formData.password || '');
      reqBody.append('aadharNumber', formData.aadharNumber || '');
      reqBody.append('licenseNumber', formData.licenseNumber || '');
      reqBody.append('bikeNumber', formData.bikeNumber || '');
      reqBody.append('district', formData.district);
      reqBody.append('status', formData.status);
      if (formData.aadharImage) reqBody.append('aadharImage', formData.aadharImage);
      if (formData.licenseImage) reqBody.append('licenseImage', formData.licenseImage);

      const result = await addDeliveryBoyAPI(reqBody);

      if (result?.success === false) {
        console.log('❌ API Error:', result.message);
        return;
      }

      const newBoyData = result?.data || result?.boy || result;
      if (newBoyData && newBoyData._id) {
        const newBoy = {
          id: newBoyData._id,
          name: newBoyData.name,
          phone: newBoyData.phone,
          district: newBoyData.district,
          status: newBoyData.status,
          deliveries: newBoyData.deliveries || 0,
          rating: newBoyData.rating || 0,
          avatar: newBoyData.name
            ?.split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2),
        };
        setDeliveryBoys(prev => [newBoy, ...prev]);
      } else {
        await fetchDeliveryBoys();
      }

      setShowModal(false);
      setFormData({
        name: '', email: '', phone: '', password: '',
        aadharNumber: '', aadharImage: null,
        licenseNumber: '', licenseImage: null, bikeNumber: '',
        district: 'Thiruvananthapuram', status: 'active',
      });
    } catch (err) {
      console.log('❌ Save Error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteBoy = async (id) => {
    console.log('🗑️ Deleting ID:', id);
    const previousBoys = [...deliveryBoys];
    setDeliveryBoys(prev => prev.filter(b => b.id !== id));
    setDeleteConfirm(null);

    try {
      const result = await deleteDeliveryBoyAPI(id);
      if (result?.success === false) {
        console.log('❌ Delete Error:', result.message);
        setDeliveryBoys(previousBoys);
        return;
      }
      console.log('✅ Deleted Successfully');
    } catch (err) {
      console.log('❌ Delete Exception:', err);
      setDeliveryBoys(previousBoys);
    }
  };

 

  return (
    <div className="delivery-page">
      {/* Hero Header */}
      <div className="hero-section">
        <div className="hero-text">
          <h1 className="hero-title"><i className="bi bi-bicycle"></i> Delivery Fleet</h1>
          <p className="hero-subtitle">Manage your delivery partners, track performance, and optimize routes.</p>
        </div>
        <button className="btn-glow" onClick={() => openModal()}>
          <i className="bi bi-plus-circle"></i> Add Delivery Boy
        </button>
      </div>

      {/* Stats Summary - these will show zero while loading */}
      <div className="stats-mini">
        <div className="stat-mini-card"><i className="bi bi-person-badge"></i><div><span className="stat-mini-num">{totalBoys}</span><span>Total Boys</span></div></div>
        <div className="stat-mini-card"><i className="bi bi-check-circle-fill"></i><div><span className="stat-mini-num">{activeBoys}</span><span>Active</span></div></div>
        <div className="stat-mini-card"><i className="bi bi-trophy-fill"></i><div><span className="stat-mini-num">{topDeliveries}</span><span>Top Deliveries</span></div></div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="search-group"><i className="bi bi-search"></i><input type="text" placeholder="Search by name or phone..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
        <div className="filter-group"><label><i className="bi bi-geo-alt"></i> District</label><select value={districtFilter} onChange={e => setDistrictFilter(e.target.value)}><option value="all">All Districts</option>{keralaDistricts.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
        <div className="filter-group"><label><i className="bi bi-flag"></i> Status</label><select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option value="all">All</option><option value="active">Active</option><option value="inactive">Inactive</option><option value="pending">Pending</option></select></div>
      </div>

      {/* Delivery Boys Grid */}
      <div className="delivery-grid">
        {isLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading delivery boys...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <i className="bi bi-exclamation-triangle-fill"></i>
            <p>{error}</p>
            <button className="btn-retry" onClick={fetchDeliveryBoys}>Retry</button>
          </div>
        ) : filteredBoys.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-emoji-frown"></i>
            <p>No delivery boys found</p>
          </div>
        ) : (
          filteredBoys.map((boy) => (
            <div className="delivery-card premium-card" key={boy.id} data-status={boy.status}>
              <div className="card-badge" data-status={boy.status}>
                {boy.status === 'active' ? 'Active' : boy.status === 'inactive' ? 'Inactive' : 'Pending'}
              </div>
              <div className="avatar-wrapper">
                <div className="avatar-glow">{boy.avatar}</div>
                <button className="status-toggle" onClick={() => toggleStatus(boy.id)} title="Toggle status">
                  <i className={`bi ${boy.status === 'active' ? 'bi-toggle-on' : 'bi-toggle-off'}`}></i>
                </button>
              </div>
              <h3 className="delivery-name">{boy.name}</h3>
              <div className="delivery-details">
                <p><i className="bi bi-telephone-fill"></i> {boy.phone}</p>
                <p><i className="bi bi-pin-map-fill"></i> District: <strong>{boy.district}</strong></p>
                <p><i className="bi bi-truck"></i> Deliveries: <strong>{boy.deliveries}</strong></p>
                <p className="rating"><i className="bi bi-star-fill"></i> {boy.rating} ★</p>
              </div>
              <div className="card-actions">
                <button className="action-btn delete" onClick={() => setDeleteConfirm(boy.id)}><i className="bi bi-trash"></i> Delete</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><i className="bi bi-person-plus"></i> {editingBoy ? 'Edit Delivery Boy' : 'Add New Delivery Boy'}</h3>
              <button className="close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-group"><label>Full Name</label><input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Rajesh Kumar" /></div>
              <div className="form-group"><label>Email</label><input type="email" value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="example@gmail.com" /></div>
              <div className="form-group"><label>Phone Number</label><input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="+91 98765 43210" /></div>
              <div className="form-group"><label>Password</label><input type="password" value={formData.password || ''} onChange={e => setFormData({ ...formData, password: e.target.value })} placeholder="Enter password" /></div>
              <div className="form-group"><label>Aadhar Number</label><input type="text" value={formData.aadharNumber || ''} onChange={e => setFormData({ ...formData, aadharNumber: e.target.value })} placeholder="1234 1234 1234" /></div>
              <div className="form-group"><label>Aadhar Image</label><input type="file" onChange={e => setFormData({ ...formData, aadharImage: e.target.files[0] })} /></div>
              <div className="form-group"><label>License Number</label><input type="text" value={formData.licenseNumber || ''} onChange={e => setFormData({ ...formData, licenseNumber: e.target.value })} placeholder="KL123456" /></div>
              <div className="form-group"><label>License Image</label><input type="file" onChange={e => setFormData({ ...formData, licenseImage: e.target.files[0] })} /></div>
              <div className="form-group"><label>Bike Number</label><input type="text" value={formData.bikeNumber || ''} onChange={e => setFormData({ ...formData, bikeNumber: e.target.value })} placeholder="KL07AB1234" /></div>
              <div className="form-group"><label>District</label><select value={formData.district} onChange={e => setFormData({ ...formData, district: e.target.value })}>{keralaDistricts.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
              <div className="form-group"><label>Status</label><select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}><option value="active">Active</option><option value="inactive">Inactive</option><option value="blocked">Blocked</option></select></div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={saveBoy} disabled={isSaving}>{isSaving ? 'Saving...' : editingBoy ? 'Update' : 'Add'} Boy</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3><i className="bi bi-exclamation-triangle-fill"></i> Confirm Delete</h3><button className="close" onClick={() => setDeleteConfirm(null)}>&times;</button></div>
            <div className="modal-body"><p>Are you sure you want to delete this delivery boy? This action cannot be undone.</p></div>
            <div className="modal-footer"><button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button><button className="btn-danger" onClick={() => deleteBoy(deleteConfirm)}>Delete Permanently</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
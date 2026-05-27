'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import './delivery-boys.css';
import {
  addDeliveryBoyAPI,
  deleteDeliveryBoyAPI,
  getDeliveryBoysAPI,
  updateDeliveryBoyAPI,
} from '../../services/deliveryService';

export default function DeliveryBoysPage() {
  const queryClient = useQueryClient();
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

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

  const capitalizeDistrict = (district) => {
    if (!district) return 'Thiruvananthapuram';
    return district.charAt(0).toUpperCase() + district.slice(1).toLowerCase();
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // ---------- Fetch delivery boys ----------
  const { data: deliveryBoys = [], isLoading, error, refetch } = useQuery({
    queryKey: ['deliveryBoys'],
    queryFn: async () => {
      const result = await getDeliveryBoysAPI();
      let data = [];
      if (Array.isArray(result)) data = result;
      else if (result?.data && Array.isArray(result.data)) data = result.data;
      else if (result?.success && Array.isArray(result?.data)) data = result.data;
      else if (result?.boys && Array.isArray(result.boys)) data = result.boys;
      else data = [];

      return data.map((boy) => ({
        id: boy._id,
        name: boy.name,
        email: boy.email || '',
        phone: boy.phone,
        district: capitalizeDistrict(boy.district || boy.zone),
        status: boy.status,
        deliveries: boy.deliveries || 0,
        rating: boy.rating || 0,
        aadharNumber: boy.aadharNumber || '',
        licenseNumber: boy.licenseNumber || '',
        bikeNumber: boy.bikeNumber || '',
        avatar: boy.name
          ?.split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2),
      }));
    },
    staleTime: 0,
  });

  // ---------- Add Mutation ----------
  const addMutation = useMutation({
    mutationFn: (data) => addDeliveryBoyAPI(data),
    onMutate: async (newBoyData) => {
      await queryClient.cancelQueries({ queryKey: ['deliveryBoys'] });
      const previousBoys = queryClient.getQueryData(['deliveryBoys']);
      const optimisticBoy = {
        id: `temp-${Date.now()}`,
        name: newBoyData.get('name'),
        email: newBoyData.get('email'),
        phone: newBoyData.get('phone'),
        district: capitalizeDistrict(newBoyData.get('district')),
        status: newBoyData.get('status'),
        deliveries: 0,
        rating: 0,
        aadharNumber: newBoyData.get('aadharNumber'),
        licenseNumber: newBoyData.get('licenseNumber'),
        bikeNumber: newBoyData.get('bikeNumber'),
        avatar: newBoyData.get('name')?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
      };
      queryClient.setQueryData(['deliveryBoys'], (old) => [optimisticBoy, ...(old || [])]);
      return { previousBoys };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveryBoys'] });
      showToast('Delivery boy added successfully!', 'success');
      setShowModal(false);
      resetForm();
    },
    onError: (err, _, context) => {
      queryClient.setQueryData(['deliveryBoys'], context.previousBoys);
      showToast(`Add failed: ${err.message}`, 'error');
    },
  });

  // ---------- Update Mutation (with logging and force refetch) ----------
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => {
      console.log('📤 Updating boy ID:', id);
      console.log('📤 FormData entries:');
      for (let pair of data.entries()) {
        console.log(pair[0], pair[1]);
      }
      return updateDeliveryBoyAPI(id, data);
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['deliveryBoys'] });
      const previousBoys = queryClient.getQueryData(['deliveryBoys']);
      const updatedFields = {
        name: data.get('name'),
        email: data.get('email'),
        phone: data.get('phone'),
        district: capitalizeDistrict(data.get('district')),
        status: data.get('status'),
        aadharNumber: data.get('aadharNumber'),
        licenseNumber: data.get('licenseNumber'),
        bikeNumber: data.get('bikeNumber'),
        avatar: data.get('name')?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
      };
      queryClient.setQueryData(['deliveryBoys'], (old) =>
        old.map((boy) => (boy.id === id ? { ...boy, ...updatedFields } : boy))
      );
      return { previousBoys };
    },
    onSuccess: (result, variables, context) => {
      console.log('✅ Update API response:', result);
      if (result?.success === false) {
        queryClient.setQueryData(['deliveryBoys'], context.previousBoys);
        showToast(`Update failed: ${result.message}`, 'error');
        return;
      }
      // Force a fresh fetch to replace optimistic data
      queryClient.invalidateQueries({ queryKey: ['deliveryBoys'] });
      showToast('Delivery boy updated successfully!', 'success');
      setShowModal(false);
      resetForm();
    },
    onError: (err, _, context) => {
      console.error('❌ Update error:', err);
      queryClient.setQueryData(['deliveryBoys'], context.previousBoys);
      showToast(`Update error: ${err.message}`, 'error');
    },
  });

  // ---------- Delete Mutation ----------
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteDeliveryBoyAPI(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['deliveryBoys'] });
      const previousBoys = queryClient.getQueryData(['deliveryBoys']);
      queryClient.setQueryData(['deliveryBoys'], (old) => old.filter((boy) => boy.id !== id));
      return { previousBoys };
    },
    onSuccess: () => {
      showToast('Delivery boy deleted successfully', 'success');
      setDeleteConfirm(null);
    },
    onError: (err, _, context) => {
      queryClient.setQueryData(['deliveryBoys'], context.previousBoys);
      showToast(`Delete failed: ${err.message}`, 'error');
    },
  });

  // ---------- Toggle Status ----------
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }) => {
      const form = new FormData();
      form.append('status', status);
      return updateDeliveryBoyAPI(id, form);
    },
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['deliveryBoys'] });
      const previousBoys = queryClient.getQueryData(['deliveryBoys']);
      queryClient.setQueryData(['deliveryBoys'], (old) =>
        old.map((boy) => (boy.id === id ? { ...boy, status } : boy))
      );
      return { previousBoys };
    },
    onSuccess: (_, { status }) => {
      showToast(`Status changed to ${status}`, 'success');
    },
    onError: (err, _, context) => {
      queryClient.setQueryData(['deliveryBoys'], context.previousBoys);
      showToast(`Status update failed: ${err.message}`, 'error');
    },
  });

  const resetForm = () => {
    setFormData({
      name: '', email: '', phone: '', password: '',
      aadharNumber: '', aadharImage: null,
      licenseNumber: '', licenseImage: null, bikeNumber: '',
      district: 'Thiruvananthapuram', status: 'active',
    });
    setEditingBoy(null);
  };

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
        name: '', email: '', phone: '', password: '',
        aadharNumber: '', aadharImage: null,
        licenseNumber: '', licenseImage: null, bikeNumber: '',
        district: 'Thiruvananthapuram', status: 'active',
      });
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.phone) {
      showToast('Please fill in Name and Phone Number', 'error');
      return;
    }
    const reqBody = new FormData();
    reqBody.append('name', formData.name);
    reqBody.append('email', formData.email || '');
    reqBody.append('phone', formData.phone);
    if (formData.password) reqBody.append('password', formData.password);
    reqBody.append('aadharNumber', formData.aadharNumber || '');
    reqBody.append('licenseNumber', formData.licenseNumber || '');
    reqBody.append('bikeNumber', formData.bikeNumber || '');
    reqBody.append('district', formData.district);
    reqBody.append('status', formData.status);
    if (formData.aadharImage) reqBody.append('aadharImage', formData.aadharImage);
    if (formData.licenseImage) reqBody.append('licenseImage', formData.licenseImage);

    if (editingBoy) {
      updateMutation.mutate({ id: editingBoy.id, data: reqBody });
    } else {
      addMutation.mutate(reqBody);
    }
  };

  const handleDelete = () => {
    if (deleteConfirm) deleteMutation.mutate(deleteConfirm);
  };

  const isMutating =
    addMutation.isPending || updateMutation.isPending || deleteMutation.isPending || toggleStatusMutation.isPending;

  return (
    <div className="delivery-page" suppressHydrationWarning>
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          <i className={`bi ${toast.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`}></i>
          <span>{toast.message}</span>
        </div>
      )}

      <div className="hero-section">
        <div className="hero-text">
          <h1 className="hero-title"><i className="bi bi-bicycle"></i> Delivery Fleet</h1>
          <p className="hero-subtitle">Manage your delivery partners, track performance, and optimise routes.</p>
        </div>
        <button className="btn-glow" onClick={() => openModal()}>
          <i className="bi bi-plus-circle"></i> Add Delivery Boy
        </button>
      </div>

      <div className="stats-mini">
        <div className="stat-mini-card"><i className="bi bi-person-badge"></i><div><span className="stat-mini-num">{totalBoys}</span><span>Total Boys</span></div></div>
        <div className="stat-mini-card"><i className="bi bi-check-circle-fill"></i><div><span className="stat-mini-num">{activeBoys}</span><span>Active</span></div></div>
        <div className="stat-mini-card"><i className="bi bi-trophy-fill"></i><div><span className="stat-mini-num">{topDeliveries}</span><span>Top Deliveries</span></div></div>
      </div>

      <div className="filter-bar">
        <div className="search-group"><i className="bi bi-search"></i><input type="text" placeholder="Search by name or phone..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
        <div className="filter-group"><label><i className="bi bi-geo-alt"></i> District</label><select value={districtFilter} onChange={(e) => setDistrictFilter(e.target.value)}><option value="all">All Districts</option>{keralaDistricts.map((d) => <option key={d}>{d}</option>)}</select></div>
        <div className="filter-group"><label><i className="bi bi-flag"></i> Status</label><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option value="all">All</option><option value="active">Active</option><option value="inactive">Inactive</option><option value="pending">Pending</option></select></div>
      </div>

      <div className="delivery-grid">
        {isLoading ? (
          <div className="loading-state"><div className="spinner"></div><p>Loading delivery boys...</p></div>
        ) : error ? (
          <div className="error-state"><i className="bi bi-exclamation-triangle-fill"></i><p>{error.message}</p><button className="btn-retry" onClick={() => refetch()}>Retry</button></div>
        ) : filteredBoys.length === 0 ? (
          <div className="empty-state"><i className="bi bi-emoji-frown"></i><p>No delivery boys found</p></div>
        ) : (
          filteredBoys.map((boy) => (
            <div className="delivery-card premium-card" key={boy.id} data-status={boy.status}>
              <div className="card-badge" data-status={boy.status}>
                {boy.status === 'active' ? 'Active' : boy.status === 'inactive' ? 'Inactive' : 'Pending'}
              </div>
              <div className="avatar-wrapper">
                <div className="avatar-glow">{boy.avatar}</div>
                <button className="status-toggle" onClick={() => toggleStatusMutation.mutate({ id: boy.id, status: boy.status === 'active' ? 'inactive' : 'active' })}>
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
                <button className="action-btn edit" onClick={() => openModal(boy)}><i className="bi bi-pencil"></i> Edit</button>
                <button className="action-btn delete" onClick={() => setDeleteConfirm(boy.id)}><i className="bi bi-trash"></i> Delete</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3><i className="bi bi-person-plus"></i> {editingBoy ? 'Edit Delivery Boy' : 'Add New Delivery Boy'}</h3><button className="close" onClick={() => setShowModal(false)}>&times;</button></div>
            <div className="modal-body">
              <div className="form-group"><label>Full Name</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Rajesh Kumar" /></div>
              <div className="form-group"><label>Email</label><input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="example@gmail.com" /></div>
              <div className="form-group"><label>Phone Number</label><input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+91 98765 43210" /></div>
              <div className="form-group"><label>Password</label><input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Enter password" /></div>
              <div className="form-group"><label>Aadhar Number</label><input type="text" value={formData.aadharNumber} onChange={(e) => setFormData({ ...formData, aadharNumber: e.target.value })} placeholder="1234 1234 1234" /></div>
              <div className="form-group"><label>Aadhar Image</label><input type="file" onChange={(e) => setFormData({ ...formData, aadharImage: e.target.files[0] })} /></div>
              <div className="form-group"><label>License Number</label><input type="text" value={formData.licenseNumber} onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })} placeholder="KL123456" /></div>
              <div className="form-group"><label>License Image</label><input type="file" onChange={(e) => setFormData({ ...formData, licenseImage: e.target.files[0] })} /></div>
              <div className="form-group"><label>Bike Number</label><input type="text" value={formData.bikeNumber} onChange={(e) => setFormData({ ...formData, bikeNumber: e.target.value })} placeholder="KL07AB1234" /></div>
              <div className="form-group"><label>District</label><select value={formData.district} onChange={(e) => setFormData({ ...formData, district: e.target.value })}>{keralaDistricts.map((d) => <option key={d}>{d}</option>)}</select></div>
              <div className="form-group"><label>Status</label><select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}><option value="active">Active</option><option value="inactive">Inactive</option><option value="blocked">Blocked</option></select></div>
            </div>
            <div className="modal-footer"><button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button className="btn-primary" onClick={handleSave} disabled={isMutating}>{isMutating ? 'Saving...' : editingBoy ? 'Update' : 'Add'} Boy</button></div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3><i className="bi bi-exclamation-triangle-fill"></i> Confirm Delete</h3><button className="close" onClick={() => setDeleteConfirm(null)}>&times;</button></div>
            <div className="modal-body"><p>Are you sure you want to delete this delivery boy? This action cannot be undone.</p></div>
            <div className="modal-footer"><button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button><button className="btn-danger" onClick={handleDelete}>Delete Permanently</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
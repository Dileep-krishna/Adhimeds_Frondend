'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import './delivery-boys.css';
import {
  getDeliveryBoysAPI,
  deleteDeliveryBoyAPI,
  updateDeliveryBoyAPI,
} from '../../services/deliveryService';

// Skeleton loader component
const CardSkeleton = () => (
  <div className="delivery-card skeleton">
    <div className="card-header skeleton-header"></div>
    <div className="card-avatar skeleton-avatar"></div>
    <div className="card-name skeleton-text"></div>
    <div className="card-details skeleton-details"></div>
    <div className="card-actions skeleton-actions"></div>
  </div>
);

export default function DeliveryBoysPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [selectedBoy, setSelectedBoy] = useState(null);
  const [showOffcanvas, setShowOffcanvas] = useState(false);

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

  // Fetch delivery boys with caching and faster loading
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
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
    refetchOnWindowFocus: false,
  });

  // Delete mutation
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

  // Toggle status
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

  const handleDelete = () => {
    if (deleteConfirm) deleteMutation.mutate(deleteConfirm);
  };

  const openViewOffcanvas = (boy) => {
    setSelectedBoy(boy);
    setShowOffcanvas(true);
  };

  const totalBoys = deliveryBoys.length;
  const activeBoys = deliveryBoys.filter((b) => b.status === 'active').length;
  const topDeliveries = deliveryBoys.length ? Math.max(...deliveryBoys.map((b) => b.deliveries)) : 0;

  const filteredBoys = useMemo(() => {
    return deliveryBoys.filter((boy) => {
      const matchesSearch =
        boy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        boy.phone.includes(searchTerm);
      const matchesDistrict = districtFilter === 'all' || boy.district === districtFilter;
      const matchesStatus = statusFilter === 'all' || boy.status === statusFilter;
      return matchesSearch && matchesDistrict && matchesStatus;
    });
  }, [deliveryBoys, searchTerm, districtFilter, statusFilter]);

  return (
    <div className="delivery-page-full">
      {/* Toast */}
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          <i className={`bi ${toast.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`}></i>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Hero Section */}
      <div className="hero-section-full">
        <div className="hero-text">
          <h1 className="hero-title"><i className="bi bi-bicycle"></i> Delivery Fleet</h1>
          <p className="hero-subtitle">Manage your delivery partners, track performance, and optimise routes.</p>
        </div>
        <button className="btn-glow" onClick={() => router.push('/super-admin/delivery-boys/delivery-boysAdd')}>
          <i className="bi bi-plus-circle"></i> Add Delivery Boy
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-row-full">
        <div className="stat-card">
          <div className="stat-icon"><i className="bi bi-people-fill"></i></div>
          <div className="stat-info">
            <span className="stat-value">{totalBoys}</span>
            <span className="stat-label">Total Boys</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><i className="bi bi-check-circle-fill"></i></div>
          <div className="stat-info">
            <span className="stat-value">{activeBoys}</span>
            <span className="stat-label">Active</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><i className="bi bi-trophy-fill"></i></div>
          <div className="stat-info">
            <span className="stat-value">{topDeliveries}</span>
            <span className="stat-label">Top Deliveries</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar-full">
        <div className="search-group">
          <i className="bi bi-search"></i>
          <input type="text" placeholder="Search by name or phone..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="filter-group">
          <label><i className="bi bi-geo-alt"></i> District</label>
          <select value={districtFilter} onChange={(e) => setDistrictFilter(e.target.value)}>
            <option value="all">All Districts</option>
            {keralaDistricts.map((d) => <option key={d}>{d}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label><i className="bi bi-flag"></i> Status</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Cards Grid with Skeleton Loader */}
      <div className="delivery-grid-full">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => <CardSkeleton key={i} />)
        ) : error ? (
          <div className="error-state-full">
            <i className="bi bi-exclamation-triangle-fill"></i>
            <p>{error.message}</p>
            <button className="btn-retry" onClick={() => refetch()}>Retry</button>
          </div>
        ) : filteredBoys.length === 0 ? (
          <div className="empty-state-full">
            <i className="bi bi-emoji-frown"></i>
            <p>No delivery boys found</p>
          </div>
        ) : (
          filteredBoys.map((boy) => (
            <div className="delivery-card" key={boy.id}>
              <div className="card-header">
                <span className={`status-badge ${boy.status}`}>
                  {boy.status === 'active' ? 'Active' : boy.status === 'inactive' ? 'Inactive' : 'Pending'}
                </span>
                <div className="card-actions-top">
                  <button className="icon-btn view" onClick={() => openViewOffcanvas(boy)} title="View Details">
                    <i className="bi bi-eye-fill"></i>
                  </button>
                </div>
              </div>
              <div className="card-avatar">
                <div className="avatar-circle">{boy.avatar}</div>
                <button className="status-toggle" onClick={() => toggleStatusMutation.mutate({ id: boy.id, status: boy.status === 'active' ? 'inactive' : 'active' })}>
                  <i className={`bi ${boy.status === 'active' ? 'bi-toggle-on' : 'bi-toggle-off'}`}></i>
                </button>
              </div>
              <h3 className="card-name">{boy.name}</h3>
              <div className="card-details">
                <p><i className="bi bi-telephone-fill"></i> {boy.phone}</p>
                <p><i className="bi bi-pin-map-fill"></i> {boy.district}</p>
                <p><i className="bi bi-truck"></i> <strong>{boy.deliveries}</strong> deliveries</p>
                <p className="rating"><i className="bi bi-star-fill"></i> {boy.rating} ★</p>
              </div>
              <div className="card-actions">
                <button className="action-btn edit" onClick={() => router.push(`/super-admin/delivery-boys/delivery-boysEdit/${boy.id}`)}>
                  <i className="bi bi-pencil"></i> Edit
                </button>
                <button className="action-btn delete" onClick={() => setDeleteConfirm(boy.id)}>
                  <i className="bi bi-trash"></i> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><i className="bi bi-exclamation-triangle-fill"></i> Confirm Delete</h3>
              <button className="close" onClick={() => setDeleteConfirm(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this delivery boy? This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn-danger" onClick={handleDelete}>Delete Permanently</button>
            </div>
          </div>
        </div>
      )}

      {/* Offcanvas Side Modal with clear heading */}
      <div className={`offcanvas ${showOffcanvas ? 'show' : ''}`}>
        <div className="offcanvas-header">
          <h5 className="offcanvas-title">
            <i className="bi bi-person-badge me-2"></i>Delivery Boy Details
          </h5>
          <button type="button" className="btn-close" onClick={() => setShowOffcanvas(false)}></button>
        </div>
        <div className="offcanvas-body">
          {selectedBoy && (
            <div className="details-container">
              <div className="detail-avatar">
                <div className="avatar-large">{selectedBoy.avatar}</div>
              </div>
              <div className="detail-row">
                <span className="detail-label">Full Name:</span>
                <span className="detail-value">{selectedBoy.name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{selectedBoy.email || 'Not provided'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Phone:</span>
                <span className="detail-value">{selectedBoy.phone}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">District:</span>
                <span className="detail-value">{selectedBoy.district}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status:</span>
                <span className={`status-badge ${selectedBoy.status}`}>{selectedBoy.status}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Deliveries:</span>
                <span className="detail-value">{selectedBoy.deliveries}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Rating:</span>
                <span className="detail-value">{selectedBoy.rating} ★</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Aadhar Number:</span>
                <span className="detail-value">{selectedBoy.aadharNumber || 'Not provided'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">License Number:</span>
                <span className="detail-value">{selectedBoy.licenseNumber || 'Not provided'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Bike Number:</span>
                <span className="detail-value">{selectedBoy.bikeNumber || 'Not provided'}</span>
              </div>
            </div>
          )}
        </div>
      </div>
      {showOffcanvas && <div className="offcanvas-backdrop" onClick={() => setShowOffcanvas(false)}></div>}
    </div>
  );
}
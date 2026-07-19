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

export default function DeliveryBoysPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
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

  const { data: deliveryBoys = [], isLoading, error } = useQuery({
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
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

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

  const SkeletonRow = () => (
    <tr className="skeleton-row">
      <td><div className="skeleton-text" style={{ width: '30px' }}></div></td>
      <td><div className="skeleton-text" style={{ width: '120px' }}></div></td>
      <td><div className="skeleton-text" style={{ width: '140px' }}></div></td>
      <td><div className="skeleton-text" style={{ width: '100px' }}></div></td>
      <td><div className="skeleton-text" style={{ width: '90px' }}></div></td>
      <td><div className="skeleton-text" style={{ width: '70px' }}></div></td>
      <td><div className="skeleton-text" style={{ width: '50px' }}></div></td>
      <td><div className="skeleton-text" style={{ width: '60px' }}></div></td>
      <td><div className="skeleton-text" style={{ width: '150px' }}></div></td>
    </tr>
  );

  return (
    <div className="delivery-page-full">
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          <i className={`bi ${toast.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`}></i>
          <span>{toast.message}</span>
        </div>
      )}

      {/* ─── Page Title ─── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Delivery Boys</h1>
          <p className="page-subtitle">Manage your delivery partners and track their performance</p>
        </div>
      </div>

      {/* ─── Stats Cards ─── */}
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
        <div className="stat-card">
          <div className="stat-icon"><i className="bi bi-plus-circle-fill"></i></div>
          <div className="stat-info">
            <button className="btn-glow" onClick={() => router.push('/super-admin/delivery-boys/delivery-boysAdd')}>
              <i className="bi bi-plus-circle"></i> Add Delivery Boy
            </button>
          </div>
        </div>
      </div>

      {/* ─── Filter Bar ─── */}
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

      {/* ─── Table ─── */}
      <div className="delivery-table-wrapper">
        <div className="delivery-table-card">
          <div className="table-responsive">
            <table className="delivery-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>District</th>
                  <th>Status</th>
                  <th>Deliveries</th>
                  <th>Rating</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => <SkeletonRow key={i} />)
                ) : error ? (
                  <tr>
                    <td colSpan="9" className="text-center py-4 text-danger">
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>
                      {error.message}
                    </td>
                  </tr>
                ) : filteredBoys.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-4 text-muted">
                      <i className="bi bi-emoji-frown me-2"></i>
                      No delivery boys found
                    </td>
                  </tr>
                ) : (
                  filteredBoys.map((boy, index) => (
                    <tr key={boy.id}>
                      <td>{index + 1}</td>

                      <td>
                        <div className="user-info">
                          <div className="user-avatar">{boy.avatar}</div>
                          <span className="user-name">{boy.name}</span>
                        </div>
                      </td>

                      <td>{boy.email || '—'}</td>

                      <td>{boy.phone}</td>

                      <td>{boy.district}</td>

                      <td>
                        <span className={`status-badge-table ${boy.status}`}>
                          {boy.status === 'active' ? 'Active' : boy.status === 'inactive' ? 'Inactive' : 'Pending'}
                        </span>
                      </td>

                      <td>{boy.deliveries}</td>

                      <td>
                        <span className="rating-stars">
                          <i className="bi bi-star-fill"></i> {boy.rating}
                        </span>
                      </td>

                      <td>
                        <div className="action-buttons">
                          <button className="btn-view" title="View">
                            <i className="bi bi-eye"></i>
                          </button>
                          <button
                            className="btn-edit"
                            title="Edit"
                            onClick={() =>
                              router.push(
                                `/super-admin/delivery-boys/delivery-boysEdit/${boy.id}`
                              )
                            }
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn-status"
                            title="Change Status"
                            onClick={() =>
                              toggleStatusMutation.mutate({
                                id: boy.id,
                                status: boy.status === 'active' ? 'inactive' : 'active',
                              })
                            }
                          >
                            <i className={`bi ${boy.status === 'active' ? 'bi-toggle-on' : 'bi-toggle-off'}`}></i>
                          </button>
                          <button
                            className="btn-delete"
                            title="Delete"
                            onClick={() => setDeleteConfirm(boy.id)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ─── Delete Confirmation Modal ─── */}
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
    </div>
  );
}
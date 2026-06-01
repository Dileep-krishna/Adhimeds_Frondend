'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { getStoresAPI, deleteStoreAPI, getStoreByIdAPI } from '../../services/storeManagementAPI';
import SERVERURL from '../../services/serverURL'; // adjust path as needed
import './medical-stores.css';

// Helper: convert relative image path to absolute backend URL
const getImageUrl = (path) => {
  if (!path) return null;
  // Already absolute
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  // Normalise leading slash
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${SERVERURL}${normalized}`;
};

export default function MedicalStoreManagement() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [viewStore, setViewStore] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const response = await getStoresAPI();
      if (response.success) setStores(response.data);
      else toast.error(response.message || 'Failed to fetch stores');
    } catch (error) {
      toast.error('Server error while fetching stores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const activeCount = stores.filter(s => s.status === 'active').length;
  const inactiveCount = stores.filter(s => s.status === 'inactive').length;
  const pendingCount = stores.filter(s => s.status === 'pending').length;

  const filteredStores = stores.filter(store => {
    const matchesSearch = store.storeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (store.address && store.address.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || store.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const confirmDelete = (id) => setDeleteConfirm(id);

  const deleteStore = async () => {
    setDeleting(true);
    try {
      const response = await deleteStoreAPI(deleteConfirm);
      if (response.success) {
        toast.success('Store deleted successfully');
        fetchStores();
      } else {
        toast.error(response.message || 'Deletion failed');
      }
    } catch (error) {
      toast.error('Server error while deleting store');
    } finally {
      setDeleting(false);
      setDeleteConfirm(null);
    }
  };

  const handleViewStore = async (id) => {
    setViewLoading(true);
    try {
      const response = await getStoreByIdAPI(id);
      if (response.success) {
        setViewStore(response.data);
      } else {
        toast.error('Failed to load store details');
      }
    } catch (error) {
      toast.error('Error loading store details');
    } finally {
      setViewLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get first thumbnail URL (absolute) or fallback icon
  const getThumbnail = (store) => {
    if (store.thumbnailImages && store.thumbnailImages.length > 0) {
      return getImageUrl(store.thumbnailImages[0]);
    }
    return null;
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="medical-stores-container">
        <div className="stores-hero">
          <div>
            <h1 className="stores-title">Medical Store Management</h1>
            <p className="stores-subtitle">Manage pharmacy locations across India</p>
          </div>
          <Link href="/super-admin/store-managment/add" className="btn-primary-gradient">
            <i className="bi bi-plus-circle"></i> Add New Store
          </Link>
        </div>

        <div className="stats-row">
          <div className="stat-card active">
            <div className="stat-icon">🏪</div>
            <div className="stat-info">
              <h3>{activeCount}</h3>
              <p>Active Stores</p>
            </div>
          </div>
          <div className="stat-card inactive">
            <div className="stat-icon">⏸️</div>
            <div className="stat-info">
              <h3>{inactiveCount}</h3>
              <p>Inactive Stores</p>
            </div>
          </div>
          <div className="stat-card pending">
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <h3>{pendingCount}</h3>
              <p>Pending Stores</p>
            </div>
          </div>
        </div>

        <div className="filter-bar">
          <div className="filter-buttons">
            {['all', 'active', 'inactive', 'pending'].map(status => (
              <button
                key={status}
                className={`filter-btn ${statusFilter === status ? 'active' : ''}`}
                onClick={() => setStatusFilter(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
          <input
            type="text"
            className="search-input"
            placeholder="Search by name or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="stores-table-container">
          {loading ? (
            <div className="loading-spinner">Loading stores...</div>
          ) : (
            <table className="stores-table">
              <thead>
                <tr>
                  <th>Store</th>
                  <th>Vendor Category</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Added Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStores.map(store => {
                  const thumbnail = getThumbnail(store);
                  return (
                    <tr key={store._id}>
                      <td>
                        <div className="store-info">
                          <div className="store-avatar">
                            {thumbnail ? (
                              <img
                                src={thumbnail}
                                alt={store.storeName}
                                className="store-thumbnail"
                                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling?.style?.removeProperty('display'); }}
                              />
                            ) : null}
                            {!thumbnail && <i className="bi bi-building"></i>}
                          </div>
                          <div>
                            <strong>{store.storeName}</strong>
                            {store.address && <div className="store-address">{store.address}</div>}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="vendor-badge">
                          {store.vendorCategory || '—'}
                        </span>
                      </td>
                      <td>{store.emailAddress || '—'}</td>
                      <td>
                        <span className={`status-badge ${store.status}`}>
                          {store.status.charAt(0).toUpperCase() + store.status.slice(1)}
                        </span>
                      </td>
                      <td>
                        {store.createdAt
                          ? new Date(store.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                          : 'N/A'}
                      </td>
                      <td className="actions-cell">
                        <button
                          className="action-icon view"
                          onClick={() => handleViewStore(store._id)}
                          title="View Details"
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                        <Link
                          href={`/super-admin/store-managment/edit/${store._id}`}
                          className="action-icon edit"
                          title="Edit"
                        >
                          <i className="bi bi-pencil-square"></i>
                        </Link>
                        <button
                          className="action-icon delete"
                          onClick={() => confirmDelete(store._id)}
                          title="Delete"
                        >
                          <i className="bi bi-trash3"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredStores.length === 0 && (
                  <tr>
                    <td colSpan="6" className="empty-state">
                      <i className="bi bi-inbox"></i>
                      <p>No medical stores found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
            <div className="modal-content delete-confirm">
              <div className="modal-header">
                <h3>Confirm Delete</h3>
                <button className="close-modal" onClick={() => setDeleteConfirm(null)}>&times;</button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this medical store?</p>
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                <button className="btn-danger" onClick={deleteStore} disabled={deleting}>
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Details Side Drawer with Thumbnail Gallery */}
        <AnimatePresence>
          {viewStore && (
            <>
              <div className="drawer-backdrop" onClick={() => setViewStore(null)} />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween', duration: 0.3 }}
                className="view-drawer"
              >
                <div className="drawer-header">
                  <h3>Store Details</h3>
                  <button className="btn-close" onClick={() => setViewStore(null)}>×</button>
                </div>
                <div className="drawer-body">
                  {viewLoading ? (
                    <div className="loading-spinner">Loading details...</div>
                  ) : (
                    <>
                      {/* Thumbnail gallery */}
                      {viewStore.thumbnailImages?.length > 0 && (
                        <div className="drawer-image-gallery">
                          {viewStore.thumbnailImages.map((img, idx) => (
                            <img
                              key={idx}
                              src={getImageUrl(img)}
                              alt={`thumb-${idx}`}
                              className="drawer-thumb"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ))}
                        </div>
                      )}

                      <div className="detail-row">
                        <strong>Store Name:</strong> {viewStore.storeName}
                      </div>
                      <div className="detail-row">
                        <strong>Vendor Category:</strong> {viewStore.vendorCategory || '—'}
                      </div>
                      <div className="detail-row">
                        <strong>Email:</strong> {viewStore.emailAddress || '—'}
                      </div>
                      <div className="detail-row">
                        <strong>Contact Number:</strong> {viewStore.contactNumber || '—'}
                      </div>
                      <div className="detail-row">
                        <strong>Pharmacist Name:</strong> {viewStore.pharmacistName || '—'}
                      </div>
                      <div className="detail-row">
                        <strong>Address:</strong> {viewStore.address || '—'}
                      </div>
                      <div className="detail-row">
                        <strong>Pincode:</strong> {viewStore.pincode || '—'}
                      </div>
                      <div className="detail-row">
                        <strong>Coordinates:</strong> {viewStore.latitude}, {viewStore.longitude}
                      </div>
                      <div className="detail-row">
                        <strong>Drug License Number:</strong> {viewStore.drugLicenseNumber || '—'}
                      </div>
                      <div className="detail-row">
                        <strong>GST Number:</strong> {viewStore.gstNumber || '—'}
                      </div>
                      <div className="detail-row">
                        <strong>Status:</strong>{' '}
                        <span className={`status-badge ${viewStore.status}`}>
                          {viewStore.status?.toUpperCase()}
                        </span>
                      </div>
                      <div className="detail-row">
                        <strong>Added on:</strong> {formatDate(viewStore.createdAt)}
                      </div>
                      <div className="detail-row">
                        <strong>Last updated:</strong> {formatDate(viewStore.updatedAt)}
                      </div>
                    </>
                  )}
                </div>
                <div className="drawer-footer">
                  <button className="btn-secondary" onClick={() => setViewStore(null)}>Close</button>
                  <Link
                    href={`/super-admin/store-managment/edit/${viewStore?._id}`}
                    className="btn-primary"
                    onClick={() => setViewStore(null)}
                  >
                    Edit Store
                  </Link>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
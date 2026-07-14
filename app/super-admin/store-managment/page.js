'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef, useTransition, useDeferredValue } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { getStoresAPI, deleteStoreAPI, getStoreByIdAPI } from '../../services/storeManagementAPI';
import SERVERURL from '../../services/serverURL';
import './medical-stores.css';

// Helper: debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// Helper: convert relative image path to absolute backend URL
const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${SERVERURL}${normalized}`;
};

// Memoized stats row
const StatsRow = React.memo(({ activeCount, inactiveCount, pendingCount }) => (
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
));
StatsRow.displayName = 'StatsRow';

// Memoized store row component – now includes District
const StoreRow = React.memo(({ store, onView, onDelete, getThumbnail }) => {
  const thumbnail = useMemo(() => getThumbnail(store), [store, getThumbnail]);
  return (
    <tr>
      <td>
        <div className="store-info">
          <div className="store-avatar">
            {thumbnail ? (
              <img
                src={thumbnail}
                alt={store.storeName}
                className="store-thumbnail"
                loading="lazy"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <i className="bi bi-building"></i>
            )}
          </div>
          <div>
            <strong>{store.storeName}</strong>
            {store.address && <div className="store-address">{store.address}</div>}
          </div>
        </div>
      </td>
      <td><span className="vendor-badge">{store.vendorCategory || '—'}</span></td>
      <td><span className="district-badge">{store.district || '—'}</span></td>
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
        <button className="action-icon view" onClick={() => onView(store._id)} title="View Details">
          <i className="bi bi-eye"></i>
        </button>
        <Link href={`/super-admin/store-managment/edit/${store._id}`} className="action-icon edit" title="Edit">
          <i className="bi bi-pencil-square"></i>
        </Link>
        <button className="action-icon delete" onClick={() => onDelete(store._id)} title="Delete">
          <i className="bi bi-trash3"></i>
        </button>
      </td>
    </tr>
  );
});
StoreRow.displayName = 'StoreRow';

// Skeleton loader row (updated to match new column count)
const SkeletonRow = () => (
  <tr className="skeleton-row">
    <td><div className="skeleton" style={{ width: '200px', height: '50px' }} /></td>
    <td><div className="skeleton" style={{ width: '100px' }} /></td>
    <td><div className="skeleton" style={{ width: '120px' }} /></td>
    <td><div className="skeleton" style={{ width: '150px' }} /></td>
    <td><div className="skeleton" style={{ width: '80px' }} /></td>
    <td><div className="skeleton" style={{ width: '90px' }} /></td>
    <td><div className="skeleton" style={{ width: '120px' }} /></td>
  </tr>
);

export default function MedicalStoreManagement() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [viewStore, setViewStore] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isPending, startTransition] = useTransition();
  const deferredSearch = useDeferredValue(searchTerm);
  const debouncedSearch = useDebounce(deferredSearch, 300);

  const fetchStores = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  useEffect(() => {
    startTransition(() => setCurrentPage(1));
  }, [debouncedSearch, statusFilter]);

  const activeCount = useMemo(() => stores.filter(s => s.status === 'active').length, [stores]);
  const inactiveCount = useMemo(() => stores.filter(s => s.status === 'inactive').length, [stores]);
  const pendingCount = useMemo(() => stores.filter(s => s.status === 'pending').length, [stores]);

  const filteredStores = useMemo(() => {
    let result = stores;
    if (debouncedSearch) {
      const term = debouncedSearch.toLowerCase();
      result = result.filter(store =>
        store.storeName?.toLowerCase().includes(term) ||
        store.address?.toLowerCase().includes(term) ||
        store.district?.toLowerCase().includes(term)
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter(store => store.status === statusFilter);
    }
    return result;
  }, [stores, debouncedSearch, statusFilter]);

  const totalPages = Math.ceil(filteredStores.length / itemsPerPage);
  const paginatedStores = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredStores.slice(start, start + itemsPerPage);
  }, [filteredStores, currentPage, itemsPerPage]);

  const confirmDelete = useCallback((id) => setDeleteConfirm(id), []);
  const deleteStore = useCallback(async () => {
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
  }, [deleteConfirm, fetchStores]);

  const handleViewStore = useCallback(async (id) => {
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
  }, []);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, []);

  const getThumbnail = useCallback((store) => {
    if (store.thumbnailImages && store.thumbnailImages.length > 0) {
      return getImageUrl(store.thumbnailImages[0]);
    }
    return null;
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

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

        <StatsRow activeCount={activeCount} inactiveCount={inactiveCount} pendingCount={pendingCount} />

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
            placeholder="Search by name, address, or district..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        <div className="stores-table-container">
          {loading ? (
            <table className="stores-table">
              <thead>
                <tr>
                  <th>Store</th>
                  <th>Vendor Category</th>
                  <th>District</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Added Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array(itemsPerPage).fill().map((_, i) => <SkeletonRow key={i} />)}
              </tbody>
            </table>
          ) : (
            <>
              <table className="stores-table">
                <thead>
                  <tr>
                    <th>Store</th>
                    <th>Vendor Category</th>
                    <th>District</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Added Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedStores.map(store => (
                    <StoreRow
                      key={store._id}
                      store={store}
                      onView={handleViewStore}
                      onDelete={confirmDelete}
                      getThumbnail={getThumbnail}
                    />
                  ))}
                  {paginatedStores.length === 0 && (
                    <tr>
                      <td colSpan="7" className="empty-state">
                        <i className="bi bi-inbox"></i>
                        <p>No medical stores found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {filteredStores.length > 0 && (
                <div className="pagination-controls">
                  <div className="pagination-info">
                    Showing {Math.min(filteredStores.length, (currentPage-1)*itemsPerPage+1)} to {Math.min(currentPage*itemsPerPage, filteredStores.length)} of {filteredStores.length} stores
                  </div>
                  <div className="pagination-buttons">
                    <button className="pagination-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p-1)}>
                      Previous
                    </button>
                    <span className="page-indicator">Page {currentPage} of {totalPages}</span>
                    <button className="pagination-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p+1)}>
                      Next
                    </button>
                    <select className="per-page-select" value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
                      <option value={10}>10 per page</option>
                      <option value={25}>25 per page</option>
                      <option value={50}>50 per page</option>
                      <option value={100}>100 per page</option>
                    </select>
                  </div>
                </div>
              )}
            </>
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

        {/* View Details Side Drawer – now includes District */}
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
                      {viewStore.thumbnailImages?.length > 0 && (
                        <div className="drawer-image-gallery">
                          {viewStore.thumbnailImages.map((img, idx) => (
                            <img
                              key={idx}
                              src={getImageUrl(img)}
                              alt={`thumb-${idx}`}
                              className="drawer-thumb"
                              loading="lazy"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ))}
                        </div>
                      )}
                      <div className="detail-row"><strong>Store Name:</strong> {viewStore.storeName}</div>
                      <div className="detail-row"><strong>Vendor Category:</strong> {viewStore.vendorCategory || '—'}</div>
                      <div className="detail-row"><strong>District:</strong> {viewStore.district || '—'}</div>
                      <div className="detail-row"><strong>Email:</strong> {viewStore.emailAddress || '—'}</div>
                      <div className="detail-row"><strong>Contact Number:</strong> {viewStore.contactNumber || '—'}</div>
                      <div className="detail-row"><strong>Pharmacist Name:</strong> {viewStore.pharmacistName || '—'}</div>
                      <div className="detail-row"><strong>Address:</strong> {viewStore.address || '—'}</div>
                      <div className="detail-row"><strong>Pincode:</strong> {viewStore.pincode || '—'}</div>
                      <div className="detail-row"><strong>Coordinates:</strong> {viewStore.latitude}, {viewStore.longitude}</div>
                      <div className="detail-row"><strong>Drug License Number:</strong> {viewStore.drugLicenseNumber || '—'}</div>
                      <div className="detail-row"><strong>GST Number:</strong> {viewStore.gstNumber || '—'}</div>
                      <div className="detail-row">
                        <strong>Status:</strong>{' '}
                        <span className={`status-badge ${viewStore.status}`}>
                          {viewStore.status?.toUpperCase()}
                        </span>
                      </div>
                      <div className="detail-row"><strong>Added on:</strong> {formatDate(viewStore.createdAt)}</div>
                      <div className="detail-row"><strong>Last updated:</strong> {formatDate(viewStore.updatedAt)}</div>
                    </>
                  )}
                </div>
                <div className="drawer-footer">
                  <button className="btn-secondary" onClick={() => setViewStore(null)}>Close</button>
                  <Link href={`/super-admin/store-managment/edit/${viewStore?._id}`} className="btn-primary" onClick={() => setViewStore(null)}>
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
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, Autocomplete } from '@react-google-maps/api';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { createStoreAPI, deleteStoreAPI, getStoresAPI, updateStoreAPI } from '../../services/storeManagementAPI';
import './medical-stores.css';

// -------------------------------
// Constants
// -------------------------------
const mapContainerStyle = { width: '100%', height: '300px', borderRadius: '8px' };
const defaultCenter = { lat: 9.9312, lng: 76.2673 };
const mapOptions = { disableDefaultUI: false, zoomControl: true };
const libraries = ['places'];

export default function MedicalStoreManagement() {
  // State
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [formData, setFormData] = useState({
    storeName: '',
    searchLocation: '',
    address: '',
    latitude: defaultCenter.lat,
    longitude: defaultCenter.lng,
    status: 'active',
  });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showView, setShowView] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [map, setMap] = useState(null);
  const [autocomplete, setAutocomplete] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const searchBoxRef = useRef(null);

  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // Fetch stores
  const fetchStores = async () => {
    setLoading(true);
    try {
      console.log('📡 Fetching stores...');
      const response = await getStoresAPI();
      console.log('✅ Fetch response:', response);
      if (response.success) {
        setStores(response.data);
      } else {
        toast.error(response.message || 'Failed to fetch stores');
      }
    } catch (error) {
      console.error('❌ Error fetching stores:', error);
      toast.error('Server error while fetching stores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  // Stats counts
  const activeCount = stores.filter(s => s.status === 'active').length;
  const inactiveCount = stores.filter(s => s.status === 'inactive').length;
  const pendingCount = stores.filter(s => s.status === 'pending').length;

  // Filtered stores
  const filteredStores = stores.filter(store => {
    const matchesSearch = store.storeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (store.address && store.address.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || store.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Modal handlers
  const openModal = (store = null) => {
    if (store) {
      console.log('✏️ Editing store:', store);
      setEditingStore(store);
      setFormData({
        storeName: store.storeName,
        searchLocation: store.searchLocation || '',
        address: store.address || '',
        latitude: store.latitude,
        longitude: store.longitude,
        status: store.status,
      });
    } else {
      console.log('➕ Adding new store');
      setEditingStore(null);
      setFormData({
        storeName: '',
        searchLocation: '',
        address: '',
        latitude: defaultCenter.lat,
        longitude: defaultCenter.lng,
        status: 'active',
      });
    }
    setShowModal(true);
  };

  const updatePosition = (lat, lng) => {
    setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
    if (map) map.panTo({ lat, lng });
  };

  const onMapClick = useCallback((event) => {
    updatePosition(event.latLng.lat(), event.latLng.lng());
  }, []);

  const onMarkerDragEnd = useCallback((event) => {
    updatePosition(event.latLng.lat(), event.latLng.lng());
  }, []);

  const onLoadAutocomplete = (autocompleteInstance) => {
    setAutocomplete(autocompleteInstance);
    autocompleteInstance.setComponentRestrictions({ country: 'in' });
    const ernakulamBounds = new window.google.maps.LatLngBounds(
      { lat: 9.85, lng: 76.20 },
      { lat: 10.05, lng: 76.45 }
    );
    autocompleteInstance.setBounds(ernakulamBounds);
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      console.log('📍 Place selected:', place);
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const address = place.formatted_address || place.name || '';
        // Also store the typed search term (from input) as searchLocation
        const searchLocation = searchBoxRef.current?.value || address;
        setFormData(prev => ({
          ...prev,
          address,
          latitude: lat,
          longitude: lng,
          searchLocation: searchLocation,
        }));
        console.log('🗺️ Updated formData:', { address, lat, lng, searchLocation });
        if (map) {
          map.panTo({ lat, lng });
          map.setZoom(15);
        }
      } else {
        console.warn('⚠️ No geometry found for place');
        toast.error('Could not find coordinates for that place. Try a more specific location.');
      }
    }
  };

  // Save store (create or update)
  const saveStore = async () => {
    console.log('💾 saveStore called with formData:', formData);

    if (!formData.storeName.trim()) {
      toast.error('Store name required');
      return;
    }
    if (!formData.searchLocation.trim()) {
      toast.error('Search location required (type a location in the search box)');
      return;
    }
    if (formData.latitude < -90 || formData.latitude > 90 || formData.longitude < -180 || formData.longitude > 180) {
      toast.error('Invalid latitude/longitude');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        storeName: formData.storeName,
        searchLocation: formData.searchLocation,
        address: formData.address,
        latitude: formData.latitude,
        longitude: formData.longitude,
        status: formData.status,
      };
      console.log('📦 Payload being sent:', payload);

      let response;
      if (editingStore) {
        console.log('🔁 Updating store ID:', editingStore._id);
        response = await updateStoreAPI(editingStore._id, payload);
        console.log('🔄 Update response:', response);
      } else {
        console.log('✨ Creating new store');
        response = await createStoreAPI(payload);
        console.log('✅ Create response:', response);
      }

      if (response.success) {
        toast.success(editingStore ? 'Store updated successfully' : 'Store added successfully');
        fetchStores();
        setShowModal(false);
      } else {
        toast.error(response.message || (editingStore ? 'Update failed' : 'Creation failed'));
      }
    } catch (error) {
      console.error('❌ Error saving store:', error);
      toast.error('Server error while saving store');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (id) => {
    setDeleteConfirm(id);
  };

  const deleteStore = async () => {
    setDeleting(true);
    try {
      console.log('🗑️ Deleting store ID:', deleteConfirm);
      const response = await deleteStoreAPI(deleteConfirm);
      console.log('✅ Delete response:', response);
      if (response.success) {
        toast.success('Store deleted successfully');
        fetchStores();
      } else {
        toast.error(response.message || 'Deletion failed');
      }
    } catch (error) {
      console.error('❌ Error deleting store:', error);
      toast.error('Server error while deleting store');
    } finally {
      setDeleting(false);
      setDeleteConfirm(null);
    }
  };

  const formatCoord = (lat, lng) => `${lat?.toFixed(4)}, ${lng?.toFixed(4)}`;

  if (!googleMapsApiKey) {
    return <div className="medical-stores-container"><div className="alert alert-warning">Missing API key. Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env.local</div></div>;
  }

  return (
    <LoadScript googleMapsApiKey={googleMapsApiKey} libraries={libraries}>
      <Toaster position="top-right" />
      <div className="medical-stores-container">
        {/* Hero section */}
        <div className="stores-hero">
          <div>
            <h1 className="stores-title">Medical Store Management</h1>
            <p className="stores-subtitle">Manage pharmacy locations across India</p>
          </div>
          <button className="btn-primary-gradient" onClick={() => openModal()}>
            <i className="bi bi-plus-circle"></i> Add New Store
          </button>
        </div>

        {/* Stats Cards */}
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

        {/* Filter Bar */}
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

        {/* Stores Table */}
        <div className="stores-table-container">
          {loading ? (
            <div className="loading-spinner">Loading stores...</div>
          ) : (
            <table className="stores-table">
              <thead>
                <tr>
                  <th>Store Name</th>
                  <th>Location (Lat, Lng)</th>
                  <th>Status</th>
                  <th>Added Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStores.map(store => (
                  <tr key={store._id || store.id}>
                    <td>
                      <div className="store-info">
                        <div className="store-avatar"><i className="bi bi-building"></i></div>
                        <div>
                          <strong>{store.storeName}</strong>
                          {store.address && <div className="store-address">{store.address}</div>}
                        </div>
                      </div>
                    </td>
                    <td>{formatCoord(store.latitude, store.longitude)}</td>
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
                        onClick={() => {
                          setSelectedStore(store);
                          setShowView(true);
                        }}
                        title="View Details"
                      >
                        <i className="bi bi-eye"></i>
                      </button>
                      <button
                        className="action-icon edit"
                        onClick={() => openModal(store)}
                        title="Edit"
                      >
                        <i className="bi bi-pencil-square"></i>
                      </button>
                      <button
                        className="action-icon delete"
                        onClick={() => confirmDelete(store._id)}
                        title="Delete"
                      >
                        <i className="bi bi-trash3"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredStores.length === 0 && (
                  <tr>
                    <td colSpan="5" className="empty-state">
                      <i className="bi bi-inbox"></i>
                      <p>No medical stores found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{editingStore ? 'Edit Medical Store' : 'Add New Medical Store'}</h3>
                <button className="close-modal" onClick={() => setShowModal(false)}>&times;</button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Store Name *</label>
                  <input
                    type="text"
                    value={formData.storeName}
                    onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                    placeholder="e.g., City Medical Hall"
                  />
                </div>

                <div className="form-group">
                  <label>Search for location (city, landmark, address) *</label>
                  <Autocomplete onLoad={onLoadAutocomplete} onPlaceChanged={onPlaceChanged}>
                    <input
                      type="text"
                      ref={searchBoxRef}
                      placeholder="e.g., Ernakulam, Marine Drive, Kochi"
                      className="form-control"
                      onChange={(e) => setFormData(prev => ({ ...prev, searchLocation: e.target.value }))}
                      value={formData.searchLocation}
                    />
                  </Autocomplete>
                  <small className="text-muted">Try "Ernakulam", "Kochi", "Marine Drive" – restricted to India</small>
                </div>

                <div className="form-group">
                  <label>Exact Location (click or drag marker)</label>
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={{ lat: formData.latitude, lng: formData.longitude }}
                    zoom={14}
                    options={mapOptions}
                    onClick={onMapClick}
                    onLoad={setMap}
                  >
                    <Marker
                      position={{ lat: formData.latitude, lng: formData.longitude }}
                      draggable={true}
                      onDragEnd={onMarkerDragEnd}
                    />
                  </GoogleMap>
                </div>

                <div className="latlng-inputs">
                  <div className="lat-input">
                    <label>Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) => updatePosition(parseFloat(e.target.value), formData.longitude)}
                    />
                  </div>
                  <div className="lng-input">
                    <label>Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) => updatePosition(formData.latitude, parseFloat(e.target.value))}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Address (auto-filled from search)</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Street, city, etc."
                  />
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn-primary" onClick={saveStore} disabled={saving}>
                  {saving ? 'Saving...' : (editingStore ? 'Update' : 'Add')} Store
                </button>
              </div>
            </div>
          </div>
        )}

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

        {/* Side View Panel */}
        <AnimatePresence>
          {showView && selectedStore && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="sidebar-backdrop"
                onClick={() => setShowView(false)}
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween', duration: 0.3 }}
                className="view-sidebar"
              >
                <div className="sidebar-header">
                  <h4>{selectedStore.storeName}</h4>
                  <button className="btn-close btn-close-white" onClick={() => setShowView(false)}></button>
                </div>
                <div className="sidebar-body">
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item">
                      <strong>Address:</strong> {selectedStore.address || '—'}
                    </li>
                    <li className="list-group-item">
                      <strong>Coordinates:</strong> {formatCoord(selectedStore.latitude, selectedStore.longitude)}
                    </li>
                    <li className="list-group-item">
                      <strong>Status:</strong>{' '}
                      <span className={`status-badge ${selectedStore.status}`} style={{ marginLeft: '8px' }}>
                        {selectedStore.status.toUpperCase()}
                      </span>
                    </li>
                    <li className="list-group-item">
                      <strong>Added:</strong>{' '}
                      {selectedStore.createdAt
                        ? new Date(selectedStore.createdAt).toLocaleDateString()
                        : 'N/A'}
                    </li>
                  </ul>
                  {/* Mini map preview */}
                  <div className="mt-3">
                    <label className="form-label fw-bold">Location Preview</label>
                    <GoogleMap
                      mapContainerStyle={{ width: '100%', height: '200px' }}
                      center={{ lat: selectedStore.latitude, lng: selectedStore.longitude }}
                      zoom={13}
                      options={{ disableDefaultUI: true, zoomControl: false }}
                    >
                      <Marker position={{ lat: selectedStore.latitude, lng: selectedStore.longitude }} />
                    </GoogleMap>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </LoadScript>
  );
}
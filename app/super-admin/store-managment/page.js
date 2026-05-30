'use client';

import { useState, useCallback, useRef } from 'react';
import { GoogleMap, LoadScript, Marker, Autocomplete } from '@react-google-maps/api';
import './medical-stores.css';

const mapContainerStyle = { width: '100%', height: '300px', borderRadius: '8px' };
const defaultCenter = { lat: 9.9312, lng: 76.2673 }; // Ernakulam center
const mapOptions = { disableDefaultUI: false, zoomControl: true };

export default function MedicalStoreManagement() {
  const [stores, setStores] = useState([
    { id: 1, name: 'City Medical Hall', address: 'MG Road, Ernakulam', lat: 9.9816, lng: 76.2999, status: 'active', added: 'Jan 2024' },
    { id: 2, name: 'HealthPlus Pharmacy', address: 'Broadway, Ernakulam', lat: 9.9605, lng: 76.2955, status: 'active', added: 'Feb 2024' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [formData, setFormData] = useState({
    name: '', address: '', lat: defaultCenter.lat, lng: defaultCenter.lng, status: 'active',
  });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [map, setMap] = useState(null);
  const [autocomplete, setAutocomplete] = useState(null);
  const searchBoxRef = useRef(null);

  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const filteredStores = stores.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (store.address && store.address.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || store.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openModal = (store = null) => {
    if (store) {
      setEditingStore(store);
      setFormData({ name: store.name, address: store.address || '', lat: store.lat, lng: store.lng, status: store.status });
    } else {
      setEditingStore(null);
      setFormData({ name: '', address: '', lat: defaultCenter.lat, lng: defaultCenter.lng, status: 'active' });
    }
    setShowModal(true);
  };

  const updatePosition = (lat, lng) => {
    setFormData(prev => ({ ...prev, lat, lng }));
    if (map) map.panTo({ lat, lng });
  };

  const onMapClick = useCallback((event) => {
    updatePosition(event.latLng.lat(), event.latLng.lng());
  }, []);

  const onMarkerDragEnd = useCallback((event) => {
    updatePosition(event.latLng.lat(), event.latLng.lng());
  }, []);

  // Autocomplete fix: set country restriction to India
  const onLoadAutocomplete = (autocompleteInstance) => {
    setAutocomplete(autocompleteInstance);
    // Restrict to India only
    autocompleteInstance.setComponentRestrictions({ country: 'in' });
    // Optionally bias to Ernakulam region (lat/lng bounds)
    const ernakulamBounds = new window.google.maps.LatLngBounds(
      { lat: 9.85, lng: 76.20 },
      { lat: 10.05, lng: 76.45 }
    );
    autocompleteInstance.setBounds(ernakulamBounds);
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      console.log('Selected place:', place); // Debug log
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const address = place.formatted_address || place.name || '';
        setFormData(prev => ({ ...prev, address, lat, lng }));
        if (map) {
          map.panTo({ lat, lng });
          map.setZoom(15);
        }
      } else {
        console.warn('No geometry found for place');
        alert('Could not find coordinates for that place. Try a more specific location.');
      }
    }
  };

  const saveStore = () => {
    if (!formData.name.trim()) return alert('Store name required');
    if (formData.lat < -90 || formData.lat > 90) return alert('Invalid latitude');
    if (editingStore) {
      setStores(stores.map(s => s.id === editingStore.id ? { ...s, ...formData } : s));
    } else {
      const newId = Math.max(0, ...stores.map(s => s.id), 0) + 1;
      const addedDate = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      setStores([...stores, { id: newId, ...formData, added: addedDate }]);
    }
    setShowModal(false);
  };

  const deleteStore = (id) => {
    setStores(stores.filter(s => s.id !== id));
    setDeleteConfirm(null);
  };

  const formatCoord = (lat, lng) => `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

  if (!googleMapsApiKey) {
    return <div className="medical-stores-container"><div className="alert alert-warning">Missing API key. Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env.local</div></div>;
  }

  return (
    <LoadScript googleMapsApiKey={googleMapsApiKey} libraries={['places']}>
      <div className="medical-stores-container">
        {/* Hero, search, filter - same as before */}
        <div className="stores-hero">
          <div><h1 className="stores-title">Medical Store Management</h1><p className="stores-subtitle">Manage pharmacy locations across India</p></div>
          <button className="btn-primary-gradient" onClick={() => openModal()}><i className="bi bi-plus-circle"></i> Add New Store</button>
        </div>
        <div className="stores-controls">
          <div className="search-box"><i className="bi bi-search"></i><input type="text" placeholder="Search by store name or address..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
          <div className="filter-group"><label>Status:</label><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option value="all">All</option><option value="active">Active</option><option value="inactive">Inactive</option><option value="pending">Pending</option></select></div>
        </div>
        <div className="stores-table-container">
          <table className="stores-table"><thead><tr><th>Store Name</th><th>Location (Lat, Lng)</th><th>Status</th><th>Added Date</th><th>Actions</th></tr></thead><tbody>
            {filteredStores.map(store => (<tr key={store.id}><td><div className="store-info"><div className="store-avatar"><i className="bi bi-shop"></i></div><div><strong>{store.name}</strong>{store.address && <div className="store-address">{store.address}</div>}</div></div></td><td>{formatCoord(store.lat, store.lng)}</td><td><span className={`status-badge ${store.status}`}>{store.status.charAt(0).toUpperCase() + store.status.slice(1)}</span></td><td>{store.added}</td><td><div className="action-buttons"><button className="action-icon edit" onClick={() => openModal(store)}><i className="bi bi-pencil-square"></i></button><button className="action-icon delete" onClick={() => setDeleteConfirm(store.id)}><i className="bi bi-trash3"></i></button></div></td></tr>))}
            {filteredStores.length === 0 && <tr><td colSpan="5" className="empty-state"><i className="bi bi-inbox"></i><p>No medical stores found</p></td></tr>}
          </tbody></table>
        </div>

        {/* Modal with improved autocomplete */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header"><h3>{editingStore ? 'Edit Medical Store' : 'Add New Medical Store'}</h3><button className="close-modal" onClick={() => setShowModal(false)}>&times;</button></div>
              <div className="modal-body">
                <div className="form-group"><label>Store Name *</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., City Medical Hall" /></div>
                <div className="form-group"><label>Search for location (city, landmark, address)</label>
                  <Autocomplete onLoad={onLoadAutocomplete} onPlaceChanged={onPlaceChanged}>
                    <input type="text" ref={searchBoxRef} placeholder="e.g., Ernakulam, Marine Drive, Kochi" className="form-control" />
                  </Autocomplete>
                  <small className="text-muted">Try "Ernakulam", "Kochi", "Marine Drive" – restricted to India</small>
                </div>
                <div className="form-group"><label>Exact Location (click or drag marker)</label>
                  <GoogleMap mapContainerStyle={mapContainerStyle} center={{ lat: formData.lat, lng: formData.lng }} zoom={14} options={mapOptions} onClick={onMapClick} onLoad={setMap}>
                    <Marker position={{ lat: formData.lat, lng: formData.lng }} draggable={true} onDragEnd={onMarkerDragEnd} />
                  </GoogleMap>
                </div>
                <div className="latlng-inputs"><div className="lat-input"><label>Latitude</label><input type="number" step="any" value={formData.lat} onChange={(e) => updatePosition(parseFloat(e.target.value), formData.lng)} /></div><div className="lng-input"><label>Longitude</label><input type="number" step="any" value={formData.lng} onChange={(e) => updatePosition(formData.lat, parseFloat(e.target.value))} /></div></div>
                <div className="form-group"><label>Address (auto-filled from search)</label><input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Street, city, etc." /></div>
                <div className="form-group"><label>Status</label><select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}><option value="active">Active</option><option value="inactive">Inactive</option><option value="pending">Pending</option></select></div>
              </div>
              <div className="modal-footer"><button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button className="btn-primary" onClick={saveStore}>{editingStore ? 'Update' : 'Add'} Store</button></div>
            </div>
          </div>
        )}

        {deleteConfirm && (
          <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
            <div className="modal-content delete-confirm"><div className="modal-header"><h3>Confirm Delete</h3><button className="close-modal" onClick={() => setDeleteConfirm(null)}>&times;</button></div><div className="modal-body"><p>Are you sure you want to delete this medical store?</p></div><div className="modal-footer"><button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button><button className="btn-danger" onClick={() => deleteStore(deleteConfirm)}>Delete</button></div></div>
          </div>
        )}
      </div>
    </LoadScript>
  );
}
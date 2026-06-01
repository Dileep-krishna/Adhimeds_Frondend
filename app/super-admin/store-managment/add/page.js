'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleMap, LoadScript, Marker, Autocomplete } from '@react-google-maps/api';
import toast, { Toaster } from 'react-hot-toast';
import { createStoreAPI } from '../../../services/storeManagementAPI';
import '../medical-stores.css';

const mapContainerStyle = { width: '100%', height: '300px', borderRadius: '8px' };
const defaultCenter = { lat: 9.9312, lng: 76.2673 };
const mapOptions = { disableDefaultUI: false, zoomControl: true };
const libraries = ['places'];

export default function AddStorePage() {
  const router = useRouter();
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const [formData, setFormData] = useState({
    storeName: '',
    searchLocation: '',
    address: '',
    latitude: defaultCenter.lat,
    longitude: defaultCenter.lng,
    status: 'pending',
    vendorCategory: '',
    pincode: '',
    emailAddress: '',
    password: '',
    drugLicenseNumber: '',
    gstNumber: '',
    contactNumber: '',
    pharmacistName: '',
  });

  const [thumbnailFiles, setThumbnailFiles] = useState([]);
  const [thumbnailPreviews, setThumbnailPreviews] = useState([]);
  const [map, setMap] = useState(null);
  const [autocomplete, setAutocomplete] = useState(null);
  const [saving, setSaving] = useState(false);
  const searchBoxRef = useRef(null);

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
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const address = place.formatted_address || place.name || '';
        const searchLocation = searchBoxRef.current?.value || address;
        setFormData(prev => ({
          ...prev,
          address,
          latitude: lat,
          longitude: lng,
          searchLocation,
        }));
        if (map) {
          map.panTo({ lat, lng });
          map.setZoom(15);
        }
      } else {
        toast.error('Could not find coordinates for that place. Try a more specific location.');
      }
    }
  };

  const handleThumbnailChange = (e) => {
    const files = Array.from(e.target.files);
    setThumbnailFiles(files);
    const previews = files.map(file => URL.createObjectURL(file));
    setThumbnailPreviews(previews);
  };

  const saveStore = async () => {
    // Only store name and coordinates are required
    if (!formData.storeName.trim()) {
      toast.error('Store name required');
      return;
    }
    if (formData.latitude < -90 || formData.latitude > 90 || formData.longitude < -180 || formData.longitude > 180) {
      toast.error('Invalid latitude/longitude');
      return;
    }

    setSaving(true);
    try {
      const payload = new FormData();
      payload.append('storeName', formData.storeName);
      payload.append('latitude', formData.latitude);
      payload.append('longitude', formData.longitude);
      
      // Append optional fields only if they have values
      if (formData.searchLocation) payload.append('searchLocation', formData.searchLocation);
      if (formData.address) payload.append('address', formData.address);
      if (formData.status) payload.append('status', formData.status);
      if (formData.vendorCategory) payload.append('vendorCategory', formData.vendorCategory);
      if (formData.pincode) payload.append('pincode', formData.pincode);
      if (formData.emailAddress) payload.append('emailAddress', formData.emailAddress);
      if (formData.password) payload.append('password', formData.password);
      if (formData.drugLicenseNumber) payload.append('drugLicenseNumber', formData.drugLicenseNumber);
      if (formData.gstNumber) payload.append('gstNumber', formData.gstNumber);
      if (formData.contactNumber) payload.append('contactNumber', formData.contactNumber);
      if (formData.pharmacistName) payload.append('pharmacistName', formData.pharmacistName);
      
      thumbnailFiles.forEach(file => {
        payload.append('thumbnailImages', file);
      });

      const response = await createStoreAPI(payload);
      if (response.success) {
        toast.success('Store added successfully');
        router.push('/super-admin/store-management');
      } else {
        toast.error(response.message || 'Creation failed');
      }
    } catch (error) {
      console.error(error);
      toast.error('Server error while saving store');
    } finally {
      setSaving(false);
    }
  };

  if (!googleMapsApiKey) {
    return <div className="medical-stores-container"><div className="alert alert-warning">Missing API key</div></div>;
  }

  return (
    <LoadScript googleMapsApiKey={googleMapsApiKey} libraries={libraries}>
      <Toaster position="top-right" />
      <div className="medical-stores-container">
        <div className="stores-hero">
          <div>
            <h1 className="stores-title">Add New Medical Store</h1>
            <p className="stores-subtitle">Fill in the details (only store name and location are required)</p>
          </div>
          <button className="btn-secondary" onClick={() => router.back()}>
            <i className="bi bi-arrow-left"></i> Back
          </button>
        </div>

        <div className="store-form-card">
          <div className="form-section">
            {/* Required fields */}
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
              <label>Search for location (optional)</label>
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
            </div>

            <div className="form-group">
              <label>Exact Location * (click or drag marker)</label>
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
                <label>Latitude *</label>
                <input
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => updatePosition(parseFloat(e.target.value), formData.longitude)}
                />
              </div>
              <div className="lng-input">
                <label>Longitude *</label>
                <input
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => updatePosition(formData.latitude, parseFloat(e.target.value))}
                />
              </div>
            </div>

            {/* Optional fields */}
            <div className="form-group">
              <label>Address (optional)</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Street, city, etc."
              />
            </div>

            <div className="form-group">
              <label>Vendor Category (optional)</label>
              <select
                value={formData.vendorCategory}
                onChange={(e) => setFormData({ ...formData, vendorCategory: e.target.value })}
              >
                <option value="">Select category</option>
                <option value="medical store">Medical Store</option>
                <option value="Lab test">Lab Test</option>
                <option value="Ayurveda store">Ayurveda Store</option>
              </select>
            </div>

            <div className="form-group">
              <label>Pincode (optional)</label>
              <input
                type="text"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                placeholder="6-digit pincode"
                maxLength="6"
              />
            </div>

            <div className="form-group">
              <label>Email Address (optional)</label>
              <input
                type="email"
                value={formData.emailAddress}
                onChange={(e) => setFormData({ ...formData, emailAddress: e.target.value })}
                placeholder="store@example.com"
              />
            </div>

            <div className="form-group">
              <label>Password (optional, at least 6 characters if provided)</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Leave blank if not needed"
              />
            </div>

            <div className="form-group">
              <label>Drug License Number (optional)</label>
              <input
                type="text"
                value={formData.drugLicenseNumber}
                onChange={(e) => setFormData({ ...formData, drugLicenseNumber: e.target.value })}
                placeholder="e.g., DL-12345"
              />
            </div>

            <div className="form-group">
              <label>GST Number (optional)</label>
              <input
                type="text"
                value={formData.gstNumber}
                onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                placeholder="22AAAAA0000A1Z"
              />
            </div>

            <div className="form-group">
              <label>Contact Number (optional, 10 digits)</label>
              <input
                type="tel"
                value={formData.contactNumber}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                placeholder="10-digit mobile number"
                maxLength="10"
              />
            </div>

            <div className="form-group">
              <label>Pharmacist Name (optional)</label>
              <input
                type="text"
                value={formData.pharmacistName}
                onChange={(e) => setFormData({ ...formData, pharmacistName: e.target.value })}
                placeholder="Full name of responsible pharmacist"
              />
            </div>

            <div className="form-group">
              <label>Thumbnail Images (optional, max 10)</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleThumbnailChange}
              />
              {thumbnailPreviews.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                  {thumbnailPreviews.map((src, idx) => (
                    <img key={idx} src={src} alt={`preview-${idx}`} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                  ))}
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Status (optional, defaults to pending)</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="form-actions">
              <button className="btn-secondary" onClick={() => router.back()}>Cancel</button>
              <button className="btn-primary" onClick={saveStore} disabled={saving}>
                {saving ? 'Saving...' : 'Add Store'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </LoadScript>
  );
}
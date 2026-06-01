'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { GoogleMap, LoadScript, Marker, Autocomplete } from '@react-google-maps/api';
import toast, { Toaster } from 'react-hot-toast';
import { getStoreByIdAPI, updateStoreAPI } from '../../../../services/storeManagementAPI';
import SERVERURL from '../../../../services/serverURL'; // adjust path as needed
import '@/app/super-admin/store-managment/medical-stores.css';

const mapContainerStyle = { width: '100%', height: '300px', borderRadius: '8px' };
const defaultCenter = { lat: 9.9312, lng: 76.2673 };
const mapOptions = { disableDefaultUI: false, zoomControl: true };
const libraries = ['places'];

// Helper: convert relative image path to absolute backend URL
const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${SERVERURL}${normalized}`;
};

export default function EditStorePage() {
  const router = useRouter();
  const { id } = useParams();
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [map, setMap] = useState(null);
  const [autocomplete, setAutocomplete] = useState(null);
  const [saving, setSaving] = useState(false);
  const searchBoxRef = useRef(null);
  const [thumbnailFiles, setThumbnailFiles] = useState([]);
  const [existingThumbnails, setExistingThumbnails] = useState([]);
  const [thumbnailPreviews, setThumbnailPreviews] = useState([]);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const response = await getStoreByIdAPI(id);
        if (response.success) {
          const store = response.data;
          setFormData({
            storeName: store.storeName || '',
            searchLocation: store.searchLocation || '',
            address: store.address || '',
            latitude: store.latitude,
            longitude: store.longitude,
            status: store.status || 'pending',
            vendorCategory: store.vendorCategory || '',
            pincode: store.pincode || '',
            emailAddress: store.emailAddress || '',
            drugLicenseNumber: store.drugLicenseNumber || '',
            gstNumber: store.gstNumber || '',
            contactNumber: store.contactNumber || '',
            pharmacistName: store.pharmacistName || '',
          });
          if (store.thumbnailImages && store.thumbnailImages.length) {
            setExistingThumbnails(store.thumbnailImages);
          }
        } else {
          toast.error('Store not found');
          router.push('/super-admin/store-management');
        }
      } catch (error) {
        toast.error('Error loading store');
      } finally {
        setLoading(false);
      }
    };
    fetchStore();
  }, [id, router]);

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
        toast.error('Could not find coordinates for that place.');
      }
    }
  };

  const handleThumbnailChange = (e) => {
    const files = Array.from(e.target.files);
    setThumbnailFiles(files);
    const previews = files.map(file => URL.createObjectURL(file));
    setThumbnailPreviews(previews);
  };

  const updateStore = async () => {
    if (!formData.storeName.trim()) {
      toast.error('Store name required');
      return;
    }
    if (formData.latitude < -90 || formData.latitude > 90 || formData.longitude < -180 || formData.longitude > 180) {
      toast.error('Invalid coordinates');
      return;
    }

    setSaving(true);
    try {
      const payload = new FormData();
      payload.append('storeName', formData.storeName);
      payload.append('latitude', formData.latitude);
      payload.append('longitude', formData.longitude);
      
      if (formData.searchLocation) payload.append('searchLocation', formData.searchLocation);
      if (formData.address) payload.append('address', formData.address);
      if (formData.status) payload.append('status', formData.status);
      if (formData.vendorCategory) payload.append('vendorCategory', formData.vendorCategory);
      if (formData.pincode) payload.append('pincode', formData.pincode);
      if (formData.emailAddress) payload.append('emailAddress', formData.emailAddress);
      if (formData.drugLicenseNumber) payload.append('drugLicenseNumber', formData.drugLicenseNumber);
      if (formData.gstNumber) payload.append('gstNumber', formData.gstNumber);
      if (formData.contactNumber) payload.append('contactNumber', formData.contactNumber);
      if (formData.pharmacistName) payload.append('pharmacistName', formData.pharmacistName);
      
      const passwordInput = document.querySelector('input[name="password"]');
      if (passwordInput && passwordInput.value.trim()) {
        payload.append('password', passwordInput.value.trim());
      }
      
      thumbnailFiles.forEach(file => {
        payload.append('thumbnailImages', file);
      });

      const response = await updateStoreAPI(id, payload);
      if (response.success) {
        toast.success('Store updated successfully');
        router.push('/super-admin/store-management');
      } else {
        toast.error(response.message || 'Update failed');
      }
    } catch (error) {
      console.error(error);
      toast.error('Server error while updating store');
    } finally {
      setSaving(false);
    }
  };

  if (!googleMapsApiKey) {
    return <div className="medical-stores-container"><div className="alert alert-warning">Missing API key</div></div>;
  }

  if (loading) return <div className="medical-stores-container"><div className="loading-spinner">Loading store...</div></div>;
  if (!formData) return null;

  return (
    <LoadScript googleMapsApiKey={googleMapsApiKey} libraries={libraries}>
      <Toaster position="top-right" />
      <div className="medical-stores-container">
        <div className="stores-hero">
          <div>
            <h1 className="stores-title">Edit Medical Store</h1>
            <p className="stores-subtitle">Update store information (all fields optional except name & location)</p>
          </div>
          <button className="btn-secondary" onClick={() => router.back()}>
            <i className="bi bi-arrow-left"></i> Back
          </button>
        </div>

        <div className="store-form-card">
          <div className="form-section">
            <div className="form-group">
              <label>Store Name *</label>
              <input
                type="text"
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Search location (optional)</label>
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
              <label>Exact Location *</label>
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

            <div className="form-group">
              <label>Address (optional)</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
                maxLength="6"
              />
            </div>

            <div className="form-group">
              <label>Email Address (optional)</label>
              <input
                type="email"
                value={formData.emailAddress}
                onChange={(e) => setFormData({ ...formData, emailAddress: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Password (leave blank to keep current)</label>
              <input
                type="password"
                name="password"
                placeholder="Enter new password only if you want to change"
              />
            </div>

            <div className="form-group">
              <label>Drug License Number (optional)</label>
              <input
                type="text"
                value={formData.drugLicenseNumber}
                onChange={(e) => setFormData({ ...formData, drugLicenseNumber: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>GST Number (optional)</label>
              <input
                type="text"
                value={formData.gstNumber}
                onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Contact Number (optional, 10 digits)</label>
              <input
                type="tel"
                value={formData.contactNumber}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                maxLength="10"
              />
            </div>

            <div className="form-group">
              <label>Pharmacist Name (optional)</label>
              <input
                type="text"
                value={formData.pharmacistName}
                onChange={(e) => setFormData({ ...formData, pharmacistName: e.target.value })}
              />
            </div>

            {/* Thumbnail Images Section with absolute URLs */}
            <div className="form-group">
              <label>Thumbnail Images</label>
              {existingThumbnails.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                  <label>Current thumbnails:</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                    {existingThumbnails.map((url, idx) => (
                      <img
                        key={idx}
                        src={getImageUrl(url)}
                        alt="thumbnail"
                        style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleThumbnailChange}
              />
              {thumbnailPreviews.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                  {thumbnailPreviews.map((src, idx) => (
                    <img key={idx} src={src} alt="preview" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                  ))}
                </div>
              )}
              <small className="text-muted">Upload new images to replace all existing thumbnails.</small>
            </div>

            <div className="form-group">
              <label>Status (optional)</label>
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
              <button className="btn-primary" onClick={updateStore} disabled={saving}>
                {saving ? 'Saving...' : 'Update Store'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </LoadScript>
  );
}
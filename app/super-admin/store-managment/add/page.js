'use client';

import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleMap, LoadScript, Marker, Autocomplete } from '@react-google-maps/api';
import toast, { Toaster } from 'react-hot-toast';
import { createStoreAPI } from '../../../services/storeManagementAPI';
import '../medical-stores.css';
import './storeAdd.css';

const mapContainerStyle = { width: '100%', height: '300px', borderRadius: '8px' };
const defaultCenter = { lat: 9.9312, lng: 76.2673 };
const mapOptions = { disableDefaultUI: false, zoomControl: true };
const libraries = ['places'];

export default function AddStorePage() {
  const router = useRouter();
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const [formData, setFormData] = useState({
    storeName: '',
    shopid: '',               // ✅ Medisoft shop ID
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
  const [shopsList, setShopsList] = useState([]);
  const searchBoxRef = useRef(null);

  // Fetch shops for validation
  useEffect(() => {
    const fetchShops = async () => {
      try {
        const res = await fetch('/api/medisoft/shops');
        if (res.ok) {
          const data = await res.json();
          setShopsList(Array.isArray(data) ? data : []);
        } else {
          console.warn('Could not fetch shops');
        }
      } catch (error) {
        console.warn('Error fetching shops:', error);
      }
    };
    fetchShops();
  }, []);

  const updatePosition = useCallback((lat, lng) => {
    setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
    if (map) map.panTo({ lat, lng });
  }, [map]);

  const onMapClick = useCallback((event) => {
    updatePosition(event.latLng.lat(), event.latLng.lng());
  }, [updatePosition]);

  const onMarkerDragEnd = useCallback((event) => {
    updatePosition(event.latLng.lat(), event.latLng.lng());
  }, [updatePosition]);

  const onLoadAutocomplete = useCallback((autocompleteInstance) => {
    setAutocomplete(autocompleteInstance);
    autocompleteInstance.setComponentRestrictions({ country: 'in' });
    const ernakulamBounds = new window.google.maps.LatLngBounds(
      { lat: 9.85, lng: 76.20 },
      { lat: 10.05, lng: 76.45 }
    );
    autocompleteInstance.setBounds(ernakulamBounds);
  }, []);

  const onPlaceChanged = useCallback(() => {
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
  }, [autocomplete, map]);

  const handleThumbnailChange = useCallback((e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      toast.error('Maximum 5 thumbnails allowed');
      return;
    }
    setThumbnailFiles(files);
    const previews = files.map(file => URL.createObjectURL(file));
    thumbnailPreviews.forEach(url => URL.revokeObjectURL(url));
    setThumbnailPreviews(previews);
  }, [thumbnailPreviews]);

  // --- Validation with shopid check ---
  const validateForm = useCallback(() => {
    const requiredFields = [
      'storeName', 'vendorCategory', 'pincode', 'emailAddress',
      'password', 'drugLicenseNumber', 'gstNumber', 'contactNumber',
      'pharmacistName', 'address', 'searchLocation'
    ];
    for (let field of requiredFields) {
      if (!formData[field]?.trim()) {
        toast.error(`${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`);
        return false;
      }
    }
    // Additional validations
    if (!/^\d{6}$/.test(formData.pincode)) {
      toast.error('Pincode must be exactly 6 digits');
      return false;
    }
    if (!/^\d{10}$/.test(formData.contactNumber)) {
      toast.error('Contact number must be 10 digits');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.emailAddress)) {
      toast.error('Valid email address is required');
      return false;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return false;
    }
    if (formData.latitude < -90 || formData.latitude > 90 || formData.longitude < -180 || formData.longitude > 180) {
      toast.error('Invalid latitude/longitude coordinates');
      return false;
    }
    if (thumbnailFiles.length === 0) {
      toast.error('At least one thumbnail image is required');
      return false;
    }

    // ✅ Check shopid (if provided) – now uses toast.error (not warning)
    if (formData.shopid && formData.shopid.trim() !== '') {
      const exists = shopsList.some(shop => shop.shopid === formData.shopid.trim());
      if (!exists) {
        toast.error('Shop ID does not match any known store. You can still save, but verify the ID.');
      }
    }

    return true;
  }, [formData, thumbnailFiles, shopsList]);

  const saveStore = useCallback(async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const payload = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== undefined && formData[key] !== null) {
          payload.append(key, formData[key]);
        }
      });
      thumbnailFiles.forEach(file => {
        payload.append('thumbnailImages', file);
      });

      const response = await createStoreAPI(payload);
      if (response.success) {
        toast.success('Store added successfully');
        router.push('/super-admin/store-managment');
      } else {
        toast.error(response.message || 'Creation failed');
      }
    } catch (error) {
      console.error(error);
      toast.error('Server error while saving store');
    } finally {
      setSaving(false);
    }
  }, [formData, thumbnailFiles, validateForm, router]);

  // Cleanup object URLs
  React.useEffect(() => {
    return () => {
      thumbnailPreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [thumbnailPreviews]);

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
            <p className="stores-subtitle">All fields are mandatory</p>
          </div>
          <button className="btn-secondary" onClick={() => router.back()}>
            <i className="bi bi-arrow-left"></i> Back
          </button>
        </div>

        <div className="store-form-card">
          <div className="form-section">
            {/* Store Name */}
            <div className="form-group">
              <label>Store Name *</label>
              <input
                type="text"
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                placeholder="e.g., City Medical Hall"
              />
            </div>

            {/* Medisoft Shop ID (optional) */}
            <div className="form-group">
              <label>Medisoft Shop ID (optional)</label>
              <input
                type="text"
                value={formData.shopid}
                onChange={(e) => setFormData({ ...formData, shopid: e.target.value })}
                placeholder="e.g., 30, 3743, 3783, 3752"
              />
              <small className="text-muted">If provided, it will be validated against existing shops.</small>
            </div>

            {/* Search Location */}
            <div className="form-group">
              <label>Search for location *</label>
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

            {/* Map */}
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

            {/* Lat/Lng inputs */}
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

            {/* Address */}
            <div className="form-group">
              <label>Address *</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Street, city, etc."
              />
            </div>

            {/* Vendor Category */}
            <div className="form-group">
              <label>Vendor Category *</label>
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

            {/* Pincode */}
            <div className="form-group">
              <label>Pincode *</label>
              <input
                type="text"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                placeholder="6-digit pincode"
                maxLength="6"
              />
            </div>

            {/* Email */}
            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                value={formData.emailAddress}
                onChange={(e) => setFormData({ ...formData, emailAddress: e.target.value })}
                placeholder="store@example.com"
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <label>Password * (at least 6 characters)</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Minimum 6 characters"
              />
            </div>

            {/* Drug License */}
            <div className="form-group">
              <label>Drug License Number *</label>
              <input
                type="text"
                value={formData.drugLicenseNumber}
                onChange={(e) => setFormData({ ...formData, drugLicenseNumber: e.target.value })}
                placeholder="e.g., DL-12345"
              />
            </div>

            {/* GST */}
            <div className="form-group">
              <label>GST Number *</label>
              <input
                type="text"
                value={formData.gstNumber}
                onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                placeholder="22AAAAA0000A1Z"
              />
            </div>

            {/* Contact */}
            <div className="form-group">
              <label>Contact Number * (10 digits)</label>
              <input
                type="tel"
                value={formData.contactNumber}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                placeholder="10-digit mobile number"
                maxLength="10"
              />
            </div>

            {/* Pharmacist */}
            <div className="form-group">
              <label>Pharmacist Name *</label>
              <input
                type="text"
                value={formData.pharmacistName}
                onChange={(e) => setFormData({ ...formData, pharmacistName: e.target.value })}
                placeholder="Full name of responsible pharmacist"
              />
            </div>

            {/* Thumbnails */}
            <div className="form-group">
              <label>Thumbnail Images * (max 5)</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleThumbnailChange}
              />
              {thumbnailPreviews.length > 0 && (
                <div className="thumbnail-preview-grid">
                  {thumbnailPreviews.map((src, idx) => (
                    <img key={idx} src={src} alt={`preview-${idx}`} className="thumbnail-preview-img" />
                  ))}
                </div>
              )}
            </div>

            {/* Status */}
            <div className="form-group">
              <label>Status *</label>
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
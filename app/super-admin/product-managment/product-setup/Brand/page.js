'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import './brand.css';
import { getAllBrands, deleteBrand } from '../../../../services/brandAPI';
import SERVERURL from '../../../../services/serverURL';

export default function BrandManagement() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [bulkAction, setBulkAction] = useState('');
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // ✅ New state for view offcanvas
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const res = await getAllBrands();
      if (res.success) {
        setBrands(res.data);
      } else {
        toast.error(res.message || 'Failed to load brands');
      }
    } catch (error) {
      console.error(error);
      toast.error('Server error while loading brands');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this brand permanently?')) return;
    try {
      const res = await deleteBrand(id);
      if (res.success) {
        toast.success('Brand deleted successfully');
        fetchBrands();
      } else {
        toast.error(res.message || 'Delete failed');
      }
    } catch (error) {
      console.error(error);
      toast.error('Server error while deleting brand');
    }
  };

  const handleBulkAction = () => {
    if (bulkAction === 'delete') {
      alert('Bulk delete would delete selected brands – implement as needed');
    }
  };

  const getImageUrl = (logoPath) => {
    if (!logoPath) return null;
    if (logoPath.startsWith('http')) return logoPath;
    return `${SERVERURL}${logoPath}`;
  };

  // ✅ Open offcanvas with brand details
  const openViewOffcanvas = (brand) => {
    setSelectedBrand(brand);
    setShowOffcanvas(true);
  };

  const filteredBrands = brands
    .filter(b => activeTab !== 'unused' || b.products === 0)
    .filter(b => b.name?.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading && brands.length === 0) {
    return <div className="brands-container"><div className="loading-spinner">Loading brands...</div></div>;
  }

  return (
    <div className="brands-container">
      <Toaster position="top-right" />

      <div className="brands-header">
        <h1 className="brands-title">Medical Brands</h1>
        <button 
          className="btn-add-brand" 
          onClick={() => router.push('/super-admin/product-managment/product-setup/Brand/addBrand')}
        >
          <i className="bi bi-plus-circle"></i> Add New Brand
        </button>
      </div>

      <div className="brands-toolbar">
        <div className="tabs">
          <button className={`tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>All Brands</button>
          <button className={`tab ${activeTab === 'unused' ? 'active' : ''}`} onClick={() => setActiveTab('unused')}>Unused Brands</button>
          <button className="tab bulk-import" onClick={() => router.push('/super-admin/product-managment/product-setup/Brand/brand-bulk-import')}>
            Bulk Import Brands
          </button>
        </div>
        <div className="search-area">
          <input
            type="text"
            className="search-input"
            placeholder="Search brands..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="bulk-actions">
            <select className="bulk-select" value={bulkAction} onChange={(e) => setBulkAction(e.target.value)}>
              <option value="">Bulk Action</option>
              <option value="delete">Delete Selected</option>
            </select>
            <button className="btn-apply" onClick={handleBulkAction}>Apply</button>
          </div>
        </div>
      </div>

      <div className="brands-table-wrapper">
        <table className="brands-table">
          <thead>
            <tr>
              <th><input type="checkbox" /></th>
              <th>Brand Logo</th>
              <th>Brand Name</th>
              <th>QTY PRODUCTS</th>
              <th>CREATED</th>
              <th>CATEGORIES</th>
              <th>OPTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredBrands.map(brand => (
              <tr key={brand._id}>
                <td><input type="checkbox" /></td>
                <td className="logo-cell">
                  {brand.logo ? (
                    <img src={getImageUrl(brand.logo)} alt={brand.name} width="40" height="40" style={{ objectFit: 'cover', borderRadius: '8px' }} />
                  ) : (
                    <div className="logo-placeholder"><i className="bi bi-building"></i></div>
                  )}
                </td>
                <td className="brand-name">{brand.name}</td>
                <td>{brand.products || 0}--</td>
                <td>{brand.createdAt ? new Date(brand.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}--</td>
                <td className="categories-cell">{brand.category || 'General'}--</td>
                <td className="actions-cell">
                  <button className="action-icon view" onClick={() => openViewOffcanvas(brand)}>
                    <i className="bi bi-eye"></i>
                  </button>
                  <button 
                    className="action-icon edit" 
                    onClick={() => router.push(`/super-admin/product-managment/product-setup/Brand/edit/${brand._id}`)}
                  >
                    <i className="bi bi-pencil"></i>
                  </button>
                  <button className="action-icon delete" onClick={() => handleDelete(brand._id)}>
                    <i className="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
            {filteredBrands.length === 0 && !loading && (
              <tr>
                <td colSpan="7" className="text-center py-4">No brands found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ Sidebar Offcanvas for View Details */}
      <div className={`offcanvas offcanvas-end ${showOffcanvas ? 'show' : ''}`} tabIndex="-1" style={{ visibility: showOffcanvas ? 'visible' : 'hidden' }}>
        <div className="offcanvas-header">
          <h5 className="offcanvas-title">
            <i className="bi bi-building me-2"></i>Brand Details
          </h5>
          <button type="button" className="btn-close" onClick={() => setShowOffcanvas(false)}></button>
        </div>
        <div className="offcanvas-body">
          {selectedBrand && (
            <div className="brand-details">
              <div className="text-center mb-4">
                {selectedBrand.logo ? (
                  <img 
                    src={getImageUrl(selectedBrand.logo)} 
                    alt={selectedBrand.name} 
                    style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '12px' }}
                  />
                ) : (
                  <div className="logo-placeholder-large">
                    <i className="bi bi-building fs-1"></i>
                  </div>
                )}
              </div>
              <div className="detail-row">
                <span className="detail-label">Brand Name:</span>
                <span className="detail-value">{selectedBrand.name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Category:</span>
                <span className="detail-value">{selectedBrand.category || 'General'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Products Count:</span>
                <span className="detail-value">{selectedBrand.products || 0}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Created At:</span>
                <span className="detail-value">
                  {selectedBrand.createdAt ? new Date(selectedBrand.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Meta Title:</span>
                <span className="detail-value">{selectedBrand.metaTitle || 'Not set'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Meta Description:</span>
                <span className="detail-value">{selectedBrand.metaDescription || 'Not set'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Meta Keywords:</span>
                <span className="detail-value">{selectedBrand.metaKeywords || 'Not set'}</span>
              </div>
            </div>
          )}
        </div>
      </div>
      {showOffcanvas && <div className="offcanvas-backdrop" onClick={() => setShowOffcanvas(false)}></div>}
    </div>
  );
}
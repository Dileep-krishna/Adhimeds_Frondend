'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import './brand.css';
import { createBrand, deleteBrand, getAllBrands, updateBrand } from '../../../../services/brandAPI';
import SERVERURL from '../../../../services/serverURL';

export default function BrandManagement() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [editBrand, setEditBrand] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [bulkAction, setBulkAction] = useState('');
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ✅ Removed 'categories' from formData
  const [formData, setFormData] = useState({
    name: '',
    logo: null,
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
  });

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

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'logo') {
      setFormData({ ...formData, logo: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Brand name is required');
      return;
    }

    setSaving(true);
    try {
      const payload = { ...formData };
      if (editBrand) {
        const res = await updateBrand(editBrand._id, payload);
        if (res.success) {
          toast.success('Brand updated successfully');
          fetchBrands();
        } else {
          toast.error(res.message || 'Update failed');
        }
      } else {
        const res = await createBrand(payload);
        if (res.success) {
          toast.success('Brand created successfully');
          fetchBrands();
        } else {
          toast.error(res.message || 'Creation failed');
        }
      }
      resetModal();
    } catch (error) {
      console.error(error);
      toast.error('Server error while saving brand');
    } finally {
      setSaving(false);
    }
  };

  const resetModal = () => {
    setFormData({
      name: '',
      logo: null,
      metaTitle: '',
      metaDescription: '',
      metaKeywords: '',
    });
    setShowModal(false);
    setEditBrand(null);
  };

  const handleEdit = (brand) => {
    setEditBrand(brand);
    setFormData({
      name: brand.name,
      logo: null,
      metaTitle: brand.metaTitle || '',
      metaDescription: brand.metaDescription || '',
      metaKeywords: brand.metaKeywords || '',
    });
    setShowModal(true);
  };

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
        <button className="btn-add-brand" onClick={() => setShowModal(true)}>
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
                  <button className="action-icon view" onClick={() => router.push(`/super-admin/brand/${brand._id}/products`)}>
                    <i className="bi bi-eye"></i>
                  </button>
                  <button className="action-icon edit" onClick={() => handleEdit(brand)}>
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

      {/* Add/Edit Modal – Category field removed */}
      {showModal && (
        <div className="modal-overlay" onClick={resetModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editBrand ? 'Edit Brand' : 'Add Brand'}</h3>
              <button className="close-modal" onClick={resetModal}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Brand Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Brand Logo</label>
                <input type="file" name="logo" accept="image/*" onChange={handleChange} />
                <small>Recommended: 100x100px</small>
              </div>
              {/* ✅ Category field removed */}
              <div className="form-group">
                <label>Meta Title</label>
                <input type="text" name="metaTitle" value={formData.metaTitle} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Meta Description</label>
                <textarea name="metaDescription" value={formData.metaDescription} onChange={handleChange} rows="2" />
              </div>
              <div className="form-group">
                <label>Meta Keywords</label>
                <input type="text" name="metaKeywords" value={formData.metaKeywords} onChange={handleChange} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={resetModal}>Cancel</button>
              <button className="btn-save" onClick={handleSubmit} disabled={saving}>
                {saving ? 'Saving...' : (editBrand ? 'Update' : 'Save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
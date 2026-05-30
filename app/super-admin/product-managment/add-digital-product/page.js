'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

export default function AddDigitalProductPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    // General
    productCategory: '',
    productName: '',
    productFile: null,
    tags: [],
    tagInput: '',
    mainImages: [],
    thumbnailImage: null,
    // Meta Tags
    metaTitle: '',
    metaDescription: '',
    keywords: '',
    metaImage: null,
    // Price & other
    unitPrice: '',
    hsnCode: '',
    gstRate: '',
    discountDateRange: { start: '', end: '' },
    discount: '',
    discountType: 'flat', // 'flat' or 'percent'
    externalLink: '',
    externalLinkButtonText: '',
    // Product Information
    description: '',
    // Frequently Bought
    frequentlyBought: [],
  });

  // Helper for simple fields
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Tags
  const addTag = () => {
    const tag = formData.tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
        tagInput: '',
      }));
    }
  };
  const removeTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }));
  };

  // Main Images
  const handleMainImages = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({ ...prev, mainImages: [...prev.mainImages, ...files] }));
  };
  const removeMainImage = (index) => {
    setFormData(prev => ({
      ...prev,
      mainImages: prev.mainImages.filter((_, i) => i !== index),
    }));
  };

  // Frequently Bought
  const addFrequentlyBought = () => {
    setFormData(prev => ({
      ...prev,
      frequentlyBought: [...prev.frequentlyBought, { product: '', category: '' }],
    }));
  };
  const updateFrequentlyBought = (index, field, value) => {
    const updated = [...formData.frequentlyBought];
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, frequentlyBought: updated }));
  };
  const removeFrequentlyBought = (index) => {
    setFormData(prev => ({
      ...prev,
      frequentlyBought: prev.frequentlyBought.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Digital Product Data:', formData);
    alert('Digital product submitted (demo). Connect to your API.');
    // router.back(); // uncomment to go back after save
  };

  return (
    <div className="container-fluid py-4" style={{ maxWidth: '1200px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">Add New Digital Product</h2>
        <button type="submit" form="digitalProductForm" className="btn btn-primary px-4">
          Save Product
        </button>
      </div>

      <form id="digitalProductForm" onSubmit={handleSubmit}>
        {/* ========== GENERAL SECTION ========== */}
        <div className="card mb-4 shadow-sm">
          <div className="card-header bg-white fw-bold">General</div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Product category</label>
                <select className="form-select" value={formData.productCategory} onChange={e => handleChange('productCategory', e.target.value)}>
                  <option value="">Select Main</option>
                  <option>Electronics</option><option>Music</option><option>Software</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Product Name *</label>
                <input type="text" className="form-control" required value={formData.productName} onChange={e => handleChange('productName', e.target.value)} />
              </div>
            </div>

            <hr className="my-3" />
            <h6 className="fw-semibold">Digital Products</h6>
            <div className="mb-3">
              <label className="form-label">Product File</label>
              <input type="file" className="form-control" onChange={e => handleChange('productFile', e.target.files[0])} />
            </div>

            <hr className="my-3" />
            <h6 className="fw-semibold">Tags</h6>
            <div className="mb-3">
              <div className="border rounded p-2 d-flex flex-wrap gap-2 align-items-center">
                {formData.tags.map(tag => (
                  <span key={tag} className="badge bg-secondary d-flex align-items-center gap-1">
                    {tag} <i className="bi bi-x-circle" style={{ cursor: 'pointer' }} onClick={() => removeTag(tag)}></i>
                  </span>
                ))}
                <input
                  type="text"
                  className="border-0 flex-grow-1 outline-none"
                  style={{ outline: 'none' }}
                  placeholder="Type to add a tag"
                  value={formData.tagInput}
                  onChange={e => handleChange('tagInput', e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
              </div>
              <div className="form-text">Press Enter to add tag</div>
            </div>

            <hr className="my-3" />
            <h6 className="fw-semibold">Images</h6>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Main Images</label>
                <input type="file" className="form-control" multiple accept="image/*" onChange={handleMainImages} />
                <div className="d-flex flex-wrap gap-2 mt-2">
                  {formData.mainImages.map((img, idx) => (
                    <div key={idx} className="position-relative" style={{ width: '60px', height: '60px' }}>
                      <img src={URL.createObjectURL(img)} alt="preview" className="w-100 h-100 object-fit-cover border rounded" />
                      <i className="bi bi-trash position-absolute top-0 end-0 bg-danger text-white rounded-circle p-1 small" style={{ cursor: 'pointer' }} onClick={() => removeMainImage(idx)}></i>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-md-6">
                <label className="form-label">Thumbnail Image</label>
                <input type="file" className="form-control" accept="image/*" onChange={e => handleChange('thumbnailImage', e.target.files[0])} />
                <div className="form-text">(290x300 recommended)</div>
              </div>
            </div>
          </div>
        </div>

        {/* ========== META TAGS ========== */}
        <div className="card mb-4 shadow-sm">
          <div className="card-header bg-white fw-bold">Meta Tags</div>
          <div className="card-body">
            <div className="mb-3">
              <label className="form-label">Meta Title</label>
              <input type="text" className="form-control" value={formData.metaTitle} onChange={e => handleChange('metaTitle', e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea rows="2" className="form-control" value={formData.metaDescription} onChange={e => handleChange('metaDescription', e.target.value)}></textarea>
            </div>
            <div className="mb-3">
              <label className="form-label">Keywords</label>
              <input type="text" className="form-control" placeholder="Keyword, Keyword" value={formData.keywords} onChange={e => handleChange('keywords', e.target.value)} />
              <div className="form-text">Separate with comma</div>
            </div>
            <div className="mb-3">
              <label className="form-label">Meta Image</label>
              <input type="file" className="form-control" accept="image/*" onChange={e => handleChange('metaImage', e.target.files[0])} />
            </div>
          </div>
        </div>

        {/* ========== PRICE SECTION ========== */}
        <div className="card mb-4 shadow-sm">
          <div className="card-header bg-white fw-bold">Price</div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label">Unit price *</label>
                <input type="number" step="0.01" className="form-control" required value={formData.unitPrice} onChange={e => handleChange('unitPrice', e.target.value)} />
              </div>
              <div className="col-md-3">
                <label className="form-label">HSN Code</label>
                <input type="text" className="form-control" value={formData.hsnCode} onChange={e => handleChange('hsnCode', e.target.value)} />
              </div>
              <div className="col-md-3">
                <label className="form-label">GST Rate (%)</label>
                <input type="number" step="0.01" className="form-control" value={formData.gstRate} onChange={e => handleChange('gstRate', e.target.value)} />
              </div>
              <div className="col-md-3">
                <label className="form-label">Discount Date Range</label>
                <input type="date" className="form-control mb-1" placeholder="Start" onChange={e => setFormData(prev => ({ ...prev, discountDateRange: { ...prev.discountDateRange, start: e.target.value } }))} />
                <input type="date" className="form-control" placeholder="End" onChange={e => setFormData(prev => ({ ...prev, discountDateRange: { ...prev.discountDateRange, end: e.target.value } }))} />
              </div>
              <div className="col-md-3">
                <label className="form-label">Discount</label>
                <input type="number" step="0.01" className="form-control" value={formData.discount} onChange={e => handleChange('discount', e.target.value)} />
              </div>
              <div className="col-md-3">
                <label className="form-label">Discount Type</label>
                <select className="form-select" value={formData.discountType} onChange={e => handleChange('discountType', e.target.value)}>
                  <option value="flat">Flat</option>
                  <option value="percent">Percent</option>
                </select>
              </div>
            </div>
            <hr />
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">External link</label>
                <input type="url" className="form-control" placeholder="https://" value={formData.externalLink} onChange={e => handleChange('externalLink', e.target.value)} />
                <div className="form-text">Leave it blank if you do not use external site link</div>
              </div>
              <div className="col-md-6">
                <label className="form-label">External link button text</label>
                <input type="text" className="form-control" value={formData.externalLinkButtonText} onChange={e => handleChange('externalLinkButtonText', e.target.value)} />
                <div className="form-text">Leave it blank if you do not use external site link</div>
              </div>
            </div>
          </div>
        </div>

        {/* ========== PRODUCT INFORMATION ========== */}
        <div className="card mb-4 shadow-sm">
          <div className="card-header bg-white fw-bold">Product Information</div>
          <div className="card-body">
            <label className="form-label">Description</label>
            <textarea className="form-control" rows="6" value={formData.description} onChange={e => handleChange('description', e.target.value)}></textarea>
            <div className="text-end mt-1">
              <button type="button" className="btn btn-sm btn-link">Clear</button>
            </div>
          </div>
        </div>

        {/* ========== FREQUENTLY BOUGHT ========== */}
        <div className="card mb-4 shadow-sm">
          <div className="card-header bg-white fw-bold">Frequently Bought</div>
          <div className="card-body">
            {formData.frequentlyBought.map((item, idx) => (
              <div key={idx} className="row g-2 mb-2 align-items-end">
                <div className="col-5">
                  <select className="form-select" value={item.product} onChange={e => updateFrequentlyBought(idx, 'product', e.target.value)}>
                    <option value="">Select Product</option>
                    <option>Product 1</option><option>Product 2</option>
                  </select>
                </div>
                <div className="col-5">
                  <select className="form-select" value={item.category} onChange={e => updateFrequentlyBought(idx, 'category', e.target.value)}>
                    <option value="">Select Category</option>
                    <option>Category 1</option><option>Category 2</option>
                  </select>
                </div>
                <div className="col-2">
                  <button type="button" className="btn btn-sm btn-danger w-100" onClick={() => removeFrequentlyBought(idx)}>Remove</button>
                </div>
              </div>
            ))}
            <button type="button" className="btn btn-sm btn-outline-primary mt-2" onClick={addFrequentlyBought}>
              + Add More
            </button>
          </div>
        </div>

        <div className="d-flex justify-content-end gap-2 mt-4 mb-5">
          <button type="button" className="btn btn-secondary" onClick={() => router.back()}>Cancel</button>
          <button type="submit" className="btn btn-primary px-5">Save Product</button>
        </div>
      </form>
    </div>
  );
}
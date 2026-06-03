'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './add-product.css';
import { createProductAPI, deleteProductAPI } from '../../../../services/productService';

export default function AddProductPage() {
  const router = useRouter();
  const medicalCategories = [
    'Medicine (Prescription)', 'Medicine (OTC)', 'Medical Equipment',
    'Supplements & Vitamins', 'Ayurveda & Herbal', 'Diagnostics & Monitoring',
    'Personal Care', 'First Aid', 'Mobility Aids',
  ];

  const [formData, setFormData] = useState({
    productName: '', mainCategory: '', brand: '',
    relatedCategories: [], unit: '', weight: '', minPurchaseQty: 1,
    barcode: '', tags: [], tagInput: '',
    published: true, featured: false, todaysDeal: false,
    flashTitle: '', discount: 0, discountType: 'percent',
    discountStartDate: '', discountEndDate: '',
    refundable: false, refundNote: 'This product is eligible for return within 7 days of delivery.',
    warrantyEnabled: false, warrantyType: '',
    warrantyNote: 'This is a demo warranty note for Active eCommerce CMS, developed by Active IT Zo...',
    freeShipping: true, flatRate: false, quantityMultiply: false,
    shippingDays: '', showShippingTime: false, showShippingNote: false,
    shippingNote: 'This is a demo shipping note for Active eCommerce CMS, developed by Active IT Zo...',
    codAvailable: false, codNote: 'This is a demo delivery note for Active eCommerce CMS, developed by Active IT Zo...',
    hsnCode: '', gstRate: '',
    metaTitle: '', metaDescription: '', metaImage: null,
    seoTags: [], seoTagInput: '',
    thumbnail: null, galleryImages: [], youtubeUrls: [''],
    videoFile: null, videoThumbnail: null, pdfSpec: null,
    unitPrice: 0, stock: 0, sku: '',
    colorsEnabled: false, colorInput: '',
    attributes: [{ name: '', values: '' }],
    variants: [],
    hideStockState: 'none',
    lowStockWarning: 0,
    defaultQuantity: 1,
    frequentlyBought: [{ product: '', category: '' }],
  });

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [generatingVariants, setGeneratingVariants] = useState(false);

  const computeVariants = () => {
    const colors = formData.colorsEnabled
      ? formData.colorInput.split(',').map(c => c.trim()).filter(c => c)
      : [];
    const attrLists = [];
    formData.attributes.forEach(attr => {
      if (attr.name.trim() && attr.values.trim()) {
        const values = attr.values.split(',').map(v => v.trim()).filter(v => v);
        if (values.length) attrLists.push(values);
      }
    });
    let combinations = [[]];
    for (const list of attrLists) {
      const newCombos = [];
      for (const combo of combinations) {
        for (const val of list) {
          newCombos.push([...combo, val]);
        }
      }
      combinations = newCombos;
    }
    if (combinations.length === 0) combinations = [[]];
    let baseNames = colors.length ? colors : [''];
    const variants = [];
    for (const color of baseNames) {
      for (const combo of combinations) {
        let variantName = color;
        if (combo.length) variantName += (variantName ? ' / ' : '') + combo.join(' / ');
        const sku = variantName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
        variants.push({
          variant: variantName,
          price: formData.unitPrice,
          sku: sku,
          quantity: 0,
          photo: null,
        });
      }
    }
    return variants;
  };

  const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const addFrequentlyBought = () => {
    setFormData(prev => ({ ...prev, frequentlyBought: [...prev.frequentlyBought, { product: '', category: '' }] }));
  };
  const updateFrequentlyBought = (idx, field, value) => {
    const updated = [...formData.frequentlyBought];
    updated[idx][field] = value;
    setFormData(prev => ({ ...prev, frequentlyBought: updated }));
  };
  const removeFrequentlyBought = (idx) => {
    const updated = formData.frequentlyBought.filter((_, i) => i !== idx);
    setFormData(prev => ({ ...prev, frequentlyBought: updated }));
  };

  const handleRelatedCategoriesChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, opt => opt.value);
    setFormData(prev => ({ ...prev, relatedCategories: selected }));
  };

  const addTag = () => {
    if (formData.tagInput.trim() && !formData.tags.includes(formData.tagInput.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, prev.tagInput.trim()], tagInput: '' }));
    }
  };
  const removeTag = (tag) => setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));

  const addSeoTag = () => {
    if (formData.seoTagInput.trim() && !formData.seoTags.includes(formData.seoTagInput.trim())) {
      setFormData(prev => ({ ...prev, seoTags: [...prev.seoTags, prev.seoTagInput.trim()], seoTagInput: '' }));
    }
  };
  const removeSeoTag = (tag) => setFormData(prev => ({ ...prev, seoTags: prev.seoTags.filter(t => t !== tag) }));

  const generateBarcode = () => {
    const code = Math.random().toString(36).substring(2, 12).toUpperCase();
    handleChange('barcode', code);
  };
  const generateSku = () => {
    const sku = Math.random().toString(36).substring(2, 10).toUpperCase();
    handleChange('sku', sku);
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({ ...prev, galleryImages: [...prev.galleryImages, ...files] }));
  };
  const removeGalleryImage = (idx) => {
    setFormData(prev => ({ ...prev, galleryImages: prev.galleryImages.filter((_, i) => i !== idx) }));
  };

  const addYouTubeUrl = () => {
    setFormData(prev => ({ ...prev, youtubeUrls: [...prev.youtubeUrls, ''] }));
  };
  const updateYouTubeUrl = (idx, value) => {
    const updated = [...formData.youtubeUrls];
    updated[idx] = value;
    setFormData(prev => ({ ...prev, youtubeUrls: updated }));
  };
  const removeYouTubeUrl = (idx) => {
    const updated = formData.youtubeUrls.filter((_, i) => i !== idx);
    setFormData(prev => ({ ...prev, youtubeUrls: updated }));
  };

  const addAttribute = () => {
    setFormData(prev => ({ ...prev, attributes: [...prev.attributes, { name: '', values: '' }] }));
  };
  const removeAttribute = (idx) => {
    const updated = formData.attributes.filter((_, i) => i !== idx);
    setFormData(prev => ({ ...prev, attributes: updated }));
  };
  const updateAttribute = (idx, field, value) => {
    const updated = [...formData.attributes];
    updated[idx][field] = value;
    setFormData(prev => ({ ...prev, attributes: updated }));
  };

  const generateVariants = () => {
    if (!formData.colorsEnabled) return;
    setGeneratingVariants(true);
    const newVariants = computeVariants();
    setFormData(prev => ({ ...prev, variants: newVariants }));
    setGeneratingVariants(false);
  };

  const updateVariant = (idx, field, value) => {
    const updated = [...formData.variants];
    updated[idx][field] = value;
    setFormData(prev => ({ ...prev, variants: updated }));
  };

  const saveProduct = async (status) => {
    if (!formData.productName || !formData.mainCategory || !formData.brand) {
      toast.error('Please fill in all required fields (*)');
      return false;
    }
    setSaving(true);
    try {
      const payload = new FormData();
      Object.keys(formData).forEach(key => {
        if (['galleryImages', 'youtubeUrls', 'relatedCategories', 'tags', 'seoTags', 'attributes', 'variants', 'frequentlyBought'].includes(key)) {
          if (key === 'relatedCategories') formData[key].forEach(val => payload.append(`${key}[]`, val));
          else if (key === 'tags') formData[key].forEach(val => payload.append(`${key}[]`, val));
          else if (key === 'seoTags') formData[key].forEach(val => payload.append(`${key}[]`, val));
          else if (key === 'youtubeUrls') formData[key].forEach(val => payload.append(`${key}[]`, val));
          else if (key === 'galleryImages') formData[key].forEach(file => payload.append(`${key}[]`, file));
          else if (key === 'attributes') payload.append(key, JSON.stringify(formData[key]));
          else if (key === 'variants') payload.append(key, JSON.stringify(formData[key]));
          else if (key === 'frequentlyBought') payload.append(key, JSON.stringify(formData[key]));
        } else if (key === 'thumbnail' && formData.thumbnail) payload.append('thumbnail', formData.thumbnail);
        else if (key === 'videoFile' && formData.videoFile) payload.append('videoFile', formData.videoFile);
        else if (key === 'videoThumbnail' && formData.videoThumbnail) payload.append('videoThumbnail', formData.videoThumbnail);
        else if (key === 'pdfSpec' && formData.pdfSpec) payload.append('pdfSpec', formData.pdfSpec);
        else if (key === 'metaImage' && formData.metaImage) payload.append('metaImage', formData.metaImage);
        else if (typeof formData[key] !== 'object') payload.append(key, formData[key]);
      });
      payload.append('published', status === 'publish' ? true : status === 'unpublish' ? false : false);
      const response = await createProductAPI(payload);
      if (response.success) {
        toast.success(`Product ${status === 'publish' ? 'published' : status === 'unpublish' ? 'unpublished' : 'saved as draft'} successfully!`);
        return true;
      } else {
        toast.error(response.message || 'Failed to save product');
        return false;
      }
    } catch (error) {
      console.error(error);
      toast.error('Network or server error');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndPublish = () => saveProduct('publish');
  const handleSaveAndUnpublish = () => saveProduct('unpublish');
  const handleSaveAsDraft = () => saveProduct('draft');

  const handleDelete = async () => {
    if (!confirm('Delete this product permanently?')) return;
    setDeleting(true);
    try {
      const response = await deleteProductAPI(formData._id);
      if (response.success) {
        toast.success('Product deleted');
        router.push('/super-admin/product-managment/all-products');
      } else {
        toast.error(response.message || 'Delete failed');
      }
    } catch (error) {
      toast.error('Server error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="add-product-page">
      <Toaster position="top-right" />
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="page-title">Add New Product</h1>
        <div className="d-flex gap-2">
          <button type="button" className="btn-danger" onClick={handleDelete} disabled={deleting}>{deleting ? 'Deleting...' : 'Delete Product'}</button>
          <button type="submit" form="productForm" className="btn-save" disabled={saving}>{saving ? 'Saving...' : 'Save Product'}</button>
        </div>
      </div>

      <form id="productForm" className="row g-4">
        {/* LEFT COLUMN */}
        <div className="col-md-6">
          {/* Product Basic Information */}
          <div className="form-card auto-height-card">
            <div className="card-header">Product Basic Information</div>
            <div className="card-body">
              <div className="mb-3"><label className="form-label">Product Name *</label><input type="text" className="form-control" value={formData.productName} onChange={e => handleChange('productName', e.target.value)} /></div>
              <div className="mb-3"><label className="form-label">Select Main Category *</label><select className="form-select" value={formData.mainCategory} onChange={e => handleChange('mainCategory', e.target.value)}><option value="">Select Main Category</option>{medicalCategories.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
              <div className="mb-3"><label className="form-label">Brand / Manufacturer *</label><input type="text" className="form-control" value={formData.brand} onChange={e => handleChange('brand', e.target.value)} /></div>
            </div>
          </div>

          {/* Product Configuration (merged) */}
          <div className="form-card">
            <div className="card-header">Product Configuration</div>
            <div className="card-body">
              {/* Related Categories */}
              <div className="mb-3">
                <label className="form-label">Related Categories *</label>
                <select className="form-select" multiple size="4" value={formData.relatedCategories} onChange={handleRelatedCategoriesChange}>
                  {medicalCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <small className="text-muted">Hold Ctrl/Cmd to select multiple</small>
              </div>
              {/* Unit & Weight row */}
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label">Unit *</label>
                  <input type="text" className="form-control" placeholder="e.g., Tablet, Bottle" value={formData.unit} onChange={e => handleChange('unit', e.target.value)} />
                </div>
                <div className="col-6">
                  <label className="form-label">Weight (In Kg)</label>
                  <input type="number" step="0.01" className="form-control" value={formData.weight} onChange={e => handleChange('weight', e.target.value)} />
                </div>
              </div>
              {/* Minimum Purchase Qty */}
              <div className="mb-3">
                <label className="form-label">Minimum Purchase Qty *</label>
                <input type="number" min="1" className="form-control" value={formData.minPurchaseQty} onChange={e => handleChange('minPurchaseQty', e.target.value)} />
              </div>
              {/* Barcode */}
              <div className="mb-3">
                <label className="form-label">Barcode</label>
                <div className="input-group">
                  <input type="text" className="form-control" value={formData.barcode} onChange={e => handleChange('barcode', e.target.value)} placeholder="Enter barcode or generate" />
                  <button type="button" className="btn btn-outline-secondary" onClick={generateBarcode}>Generate</button>
                </div>
              </div>
              {/* Tags – clearly visible */}
              <div className="mb-3">
                <label className="form-label">Tags *</label>
                <div className="tag-input-container">
                  {formData.tags.map(tag => (
                    <span key={tag} className="tag">
                      {tag} <i className="bi bi-x-circle" onClick={() => removeTag(tag)}></i>
                    </span>
                  ))}
                  <input
                    type="text"
                    className="tag-input"
                    placeholder="Type and hit enter to add a tag"
                    value={formData.tagInput}
                    onChange={e => handleChange('tagInput', e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                </div>
                <small className="text-muted">These keywords help customers find the product via search.</small>
              </div>
            </div>
          </div>

          {/* Files & Media */}
          <div className="form-card">
            <div className="card-header">Files & Media</div>
            <div className="card-body">
              <div className="mb-3"><label className="form-label">Thumbnail</label><input type="file" className="form-control" accept="image/*" onChange={e => handleChange('thumbnail', e.target.files[0])} /><small>300x300px</small></div>
              <div className="mb-3"><label className="form-label">Gallery Images</label><input type="file" className="form-control" multiple accept="image/*" onChange={handleGalleryChange} /><small>800x800px</small>
                {formData.galleryImages.length > 0 && (<div className="gallery-preview mt-2">{formData.galleryImages.map((img, idx) => (<div key={idx} className="gallery-item" style={{ backgroundImage: `url(${URL.createObjectURL(img)})` }} onClick={() => removeGalleryImage(idx)}><i className="bi bi-trash"></i></div>))}</div>)}
              </div>
              <div className="mb-3"><label className="form-label">YouTube link</label>
                {formData.youtubeUrls.map((url, idx) => (
                  <div key={idx} className="input-group mb-2">
                    <input type="url" className="form-control" placeholder="Paste url" value={url} onChange={e => updateYouTubeUrl(idx, e.target.value)} />
                    {formData.youtubeUrls.length > 1 && (
                      <button type="button" className="btn btn-outline-danger" onClick={() => removeYouTubeUrl(idx)}><i className="bi bi-trash"></i></button>
                    )}
                  </div>
                ))}
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={addYouTubeUrl}>+ Add Another</button>
              </div>
              <div className="mb-3"><label className="form-label">Video file</label>
                <input type="file" className="form-control" accept="video/*" onChange={e => handleChange('videoFile', e.target.files[0])} />
                <small className="text-muted">Under 30s for better performance</small>
              </div>
              <div className="mb-3"><label className="form-label">Video Thumbnail</label>
                <input type="file" className="form-control" accept="image/*" onChange={e => handleChange('videoThumbnail', e.target.files[0])} />
                <small className="text-muted">Upload if you want to set video thumb manually</small>
              </div>
              <div className="mb-3"><label className="form-label">PDF Specification</label>
                <input type="file" className="form-control" accept=".pdf" onChange={e => handleChange('pdfSpec', e.target.files[0])} />
              </div>
            </div>
          </div>

          {/* SEO Meta Tags */}
          <div className="form-card">
            <div className="card-header">SEO Meta Tags</div>
            <div className="card-body">
              <div className="mb-3"><label className="form-label">Meta Title</label><input type="text" className="form-control" value={formData.metaTitle} onChange={e => handleChange('metaTitle', e.target.value)} /></div>
              <div className="mb-3"><label className="form-label">Description</label><textarea rows="3" className="form-control" value={formData.metaDescription} onChange={e => handleChange('metaDescription', e.target.value)} /></div>
              <div className="mb-3"><label className="form-label">Meta Image</label><input type="file" className="form-control" accept="image/*" onChange={e => handleChange('metaImage', e.target.files[0])} /></div>
              <div className="mb-3"><label className="form-label">Tags</label>
                <div className="tag-input-container">
                  {formData.seoTags.map(tag => (<span key={tag} className="tag">{tag} <i className="bi bi-x-circle" onClick={() => removeSeoTag(tag)}></i></span>))}
                  <input type="text" className="tag-input" placeholder="Type and hit enter" value={formData.seoTagInput} onChange={e => handleChange('seoTagInput', e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSeoTag())} />
                </div>
              </div>
            </div>
          </div>

          {/* Product price + stock */}
          <div className="form-card">
            <div className="card-header">Product price + stock</div>
            <div className="card-body">
              <div className="row g-2">
                <div className="col-12"><label className="form-label">Unit price * (₹)</label><input type="number" className="form-control" value={formData.unitPrice} onChange={e => handleChange('unitPrice', e.target.value)} /></div>
                <div className="col-6"><label className="form-label">Discount</label><input type="number" className="form-control" value={formData.discount} onChange={e => handleChange('discount', e.target.value)} /></div>
                <div className="col-6"><label className="form-label">Discount Type</label><select className="form-select" value={formData.discountType} onChange={e => handleChange('discountType', e.target.value)}><option value="percent">Percent</option><option value="fixed">Fixed</option></select></div>
                <div className="col-6"><label className="form-label">Discount Start Date</label><input type="date" className="form-control" value={formData.discountStartDate} onChange={e => handleChange('discountStartDate', e.target.value)} /></div>
                <div className="col-6"><label className="form-label">Discount End Date</label><input type="date" className="form-control" value={formData.discountEndDate} onChange={e => handleChange('discountEndDate', e.target.value)} /></div>
                <div className="col-12"><label className="form-label">Stock</label><input type="number" className="form-control" value={formData.stock} onChange={e => handleChange('stock', e.target.value)} /></div>
                <div className="col-12"><label className="form-label">SKU</label><div className="input-group"><input type="text" className="form-control" value={formData.sku} onChange={e => handleChange('sku', e.target.value)} placeholder="SKU" /><button type="button" className="btn btn-outline-secondary" onClick={generateSku}>Generate</button></div></div>
              </div>
            </div>
          </div>

          {/* Variation Configuration */}
          <div className="form-card">
            <div className="card-header">Product Variation Configuration</div>
            <div className="card-body">
              <div className="toggle-item">
                <label className="toggle-switch"><input type="checkbox" checked={formData.colorsEnabled} onChange={e => { handleChange('colorsEnabled', e.target.checked); if (!e.target.checked) setFormData(prev => ({ ...prev, variants: [] })); }} /><span className="toggle-slider"></span></label>
                <span className="toggle-label">Enable Color Variation</span>
              </div>
              {formData.colorsEnabled && (
                <div className="mb-3">
                  <label className="form-label">Colors (comma separated)</label>
                  <input type="text" className="form-control" placeholder="e.g., Red, Blue, Green" value={formData.colorInput} onChange={e => handleChange('colorInput', e.target.value)} />
                </div>
              )}
              <div className="mb-3">
                <label className="form-label fw-bold">Attributes</label>
                {formData.attributes.map((attr, idx) => (
                  <div key={idx} className="row g-2 mb-2">
                    <div className="col-5"><input type="text" className="form-control" placeholder="Attribute name" value={attr.name} onChange={e => updateAttribute(idx, 'name', e.target.value)} /></div>
                    <div className="col-5"><input type="text" className="form-control" placeholder="Values (comma separated)" value={attr.values} onChange={e => updateAttribute(idx, 'values', e.target.value)} /></div>
                    <div className="col-2">{formData.attributes.length > 1 && <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeAttribute(idx)}><i className="bi bi-trash"></i></button>}</div>
                  </div>
                ))}
                <button type="button" className="btn btn-sm btn-outline-primary" onClick={addAttribute}>+ Add Attribute</button>
              </div>
              <button type="button" className="btn btn-primary mt-2" onClick={generateVariants} disabled={!formData.colorsEnabled || generatingVariants}>{generatingVariants ? 'Generating...' : 'Generate Variants'}</button>
            </div>
          </div>

          {/* Variants Table */}
          {formData.colorsEnabled && formData.variants.length > 0 && (
            <div className="form-card">
              <div className="card-header">Product Variants</div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-bordered align-middle">
                    <thead>
                      <tr>
                        <th>Variant</th>
                        <th>Price (₹)</th>
                        <th>SKU</th>
                        <th>Quantity</th>
                        <th>Photo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.variants.map((variant, idx) => (
                        <tr key={idx}>
                          <td>{variant.variant}</td>
                          <td><input type="number" className="form-control" value={variant.price} onChange={e => updateVariant(idx, 'price', parseFloat(e.target.value))} /></td>
                          <td><input type="text" className="form-control" value={variant.sku} onChange={e => updateVariant(idx, 'sku', e.target.value)} /></td>
                          <td><input type="number" className="form-control" value={variant.quantity} onChange={e => updateVariant(idx, 'quantity', parseInt(e.target.value))} /></td>
                          <td><input type="file" className="form-control" accept="image/*" onChange={e => updateVariant(idx, 'photo', e.target.files[0])} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN (unchanged) */}
        <div className="col-md-6">
          {/* Product Settings (toggles) */}
          <div className="form-card">
            <div className="card-header">Product Settings</div>
            <div className="card-body">
              <div className="toggle-item"><label className="toggle-switch"><input type="checkbox" checked={formData.published} onChange={e => handleChange('published', e.target.checked)} /><span className="toggle-slider"></span></label><span className="toggle-label">Published</span></div>
              <div className="toggle-item"><label className="toggle-switch"><input type="checkbox" checked={formData.featured} onChange={e => handleChange('featured', e.target.checked)} /><span className="toggle-slider"></span></label><span className="toggle-label">Featured</span></div>
              <div className="toggle-item"><label className="toggle-switch"><input type="checkbox" checked={formData.todaysDeal} onChange={e => handleChange('todaysDeal', e.target.checked)} /><span className="toggle-slider"></span></label><span className="toggle-label">Today's Deal</span></div>
            </div>
          </div>

          {/* Flash Sale */}
          <div className="form-card">
            <div className="card-header">Flash Sale</div>
            <div className="card-body">
              <div className="mb-3"><label className="form-label">Choose Flash Title</label><select className="form-select" value={formData.flashTitle} onChange={e => handleChange('flashTitle', e.target.value)}><option value="">Select Flash Title</option><option value="Flash Sale">Flash Sale</option><option value="Flash Deal">Flash Deal</option><option value="Electronic">Electronic</option><option value="Winter Sale">Winter Sale</option></select></div>
              <div className="row g-2"><div className="col-6"><label className="form-label">Discount</label><input type="number" className="form-control" value={formData.discount} onChange={e => handleChange('discount', e.target.value)} /></div><div className="col-6"><label className="form-label">Discount Type</label><select className="form-select" value={formData.discountType} onChange={e => handleChange('discountType', e.target.value)}><option value="percent">Percent</option><option value="fixed">Fixed</option></select></div><div className="col-6"><label className="form-label">Start Date</label><input type="date" className="form-control" value={formData.discountStartDate} onChange={e => handleChange('discountStartDate', e.target.value)} /></div><div className="col-6"><label className="form-label">End Date</label><input type="date" className="form-control" value={formData.discountEndDate} onChange={e => handleChange('discountEndDate', e.target.value)} /></div></div>
            </div>
          </div>

          {/* Refund */}
          <div className="form-card">
            <div className="card-header">Refund</div>
            <div className="card-body">
              <div className="toggle-item"><label className="toggle-switch"><input type="checkbox" checked={formData.refundable} onChange={e => handleChange('refundable', e.target.checked)} /><span className="toggle-slider"></span></label><span className="toggle-label">Refundable</span></div>
              <div className="text-muted mb-2" style={{ fontSize: '0.8rem' }}>Show notes in refund section in product description page</div>
              <div className="mt-2"><label className="form-label">Note (Add from preset)</label><div className="preset-note-box"><p className="mb-0">{formData.refundNote}</p></div><button type="button" className="btn btn-sm btn-outline-primary mt-2" onClick={() => router.push('/super-admin/product-managment/refund-presets')}>+ Add New Preset</button></div>
            </div>
          </div>

          {/* Warranty */}
          <div className="form-card">
            <div className="card-header">Warranty</div>
            <div className="card-body">
              <div className="toggle-item"><label className="toggle-switch"><input type="checkbox" checked={formData.warrantyEnabled} onChange={e => handleChange('warrantyEnabled', e.target.checked)} /><span className="toggle-slider"></span></label><span className="toggle-label">Enable warranty</span></div>
              <div className="mt-2"><label className="form-label">Select Warranty</label><select className="form-select" value={formData.warrantyType} onChange={e => handleChange('warrantyType', e.target.value)}><option value="">Select Warranty</option><option value="1 year">1 year</option><option value="2 years">2 years</option><option value="3 years">3 years</option><option value="Lifetime">Lifetime</option></select></div>
              <div className="text-muted mb-2" style={{ fontSize: '0.8rem' }}>Show notes in warranty section</div>
              <div className="mt-2"><label className="form-label">Notes (Add from Preset)</label><div className="preset-note-box"><p className="mb-0">{formData.warrantyNote}</p></div><button type="button" className="btn btn-sm btn-outline-primary mt-2" onClick={() => router.push('/super-admin/product-managment/warranty-presets')}>+ Add New Notes</button></div>
            </div>
          </div>

          {/* Shipping */}
          <div className="form-card">
            <div className="card-header">Shipping</div>
            <div className="card-body">
              <div className="mb-3"><label className="form-label fw-bold">Shipping Configuration</label>
                <div className="form-check"><input className="form-check-input" type="checkbox" checked={formData.freeShipping} onChange={e => handleChange('freeShipping', e.target.checked)} /><label className="form-check-label">Free Shipping</label></div>
                <div className="form-check"><input className="form-check-input" type="checkbox" checked={formData.flatRate} onChange={e => handleChange('flatRate', e.target.checked)} /><label className="form-check-label">Flat Rate</label></div>
                <div className="form-check"><input className="form-check-input" type="checkbox" checked={formData.quantityMultiply} onChange={e => handleChange('quantityMultiply', e.target.checked)} /><label className="form-check-label">Is Product Quantity Multiply</label></div>
              </div>
              <div className="mb-3"><label className="form-label fw-bold">Estimated Shipping Time</label>
                <div className="mb-2"><label className="form-label">Shipping Days</label><input type="text" className="form-control" placeholder="e.g., 7-15 days" value={formData.shippingDays} onChange={e => handleChange('shippingDays', e.target.value)} /></div>
                <div className="form-check"><input className="form-check-input" type="checkbox" checked={formData.showShippingTime} onChange={e => handleChange('showShippingTime', e.target.checked)} /><label className="form-check-label">Show estimated shipping time in product description page</label></div>
                <div className="form-check"><input className="form-check-input" type="checkbox" checked={formData.showShippingNote} onChange={e => handleChange('showShippingNote', e.target.checked)} /><label className="form-check-label">Show notes in shipping time section</label></div>
              </div>
              <div className="mt-2"><label className="form-label">Notes (Add from Preset)</label><div className="preset-note-box"><p className="mb-0">{formData.shippingNote}</p></div><button type="button" className="btn btn-sm btn-outline-primary mt-2" onClick={() => router.push('/super-admin/product-managment/shipping-presets')}>+ Add New Notes</button></div>
            </div>
          </div>

          {/* Cash on Delivery – toggle */}
          <div className="form-card">
            <div className="card-header">Cash on Delivery</div>
            <div className="card-body">
              <div className="toggle-item">
                <label className="toggle-switch"><input type="checkbox" checked={formData.codAvailable} onChange={e => handleChange('codAvailable', e.target.checked)} /><span className="toggle-slider"></span></label>
                <span className="toggle-label">Cash on delivery available</span>
              </div>
              <div className="text-muted mb-2" style={{ fontSize: '0.8rem' }}>Show notes in cash on delivery section</div>
              <div className="mt-2"><label className="form-label">Notes (Add from Preset)</label><div className="preset-note-box"><p className="mb-0">{formData.codNote}</p></div><button type="button" className="btn btn-sm btn-outline-primary mt-2" onClick={() => router.push('/super-admin/product-managment/cod-presets')}>+ Add New Preset</button></div>
            </div>
          </div>

          {/* HSN & GST */}
          <div className="form-card">
            <div className="card-header">HSN & GST</div>
            <div className="card-body">
              <div className="mb-3"><label className="form-label">HSN Code</label><input type="text" className="form-control" value={formData.hsnCode} onChange={e => handleChange('hsnCode', e.target.value)} /></div>
              <div className="mb-3"><label className="form-label">GST Rate (%)</label><input type="number" step="0.01" className="form-control" value={formData.gstRate} onChange={e => handleChange('gstRate', e.target.value)} /></div>
            </div>
          </div>

          {/* Stock & Order Display Settings */}
          <div className="form-card">
            <div className="card-header">Stock & Order Display Settings</div>
            <div className="card-body">
              <div className="mb-3"><label className="form-label fw-bold">Hide Stock Visibility State</label>
                <div className="form-check"><input className="form-check-input" type="radio" name="hideStockState" value="none" checked={formData.hideStockState === 'none'} onChange={e => handleChange('hideStockState', e.target.value)} /><label className="form-check-label">Show Stock Quantity</label></div>
                <div className="form-check"><input className="form-check-input" type="radio" name="hideStockState" value="text_only" checked={formData.hideStockState === 'text_only'} onChange={e => handleChange('hideStockState', e.target.value)} /><label className="form-check-label">Show Stock With Text Only</label></div>
              </div>
              <div className="mb-3"><label className="form-label">Low Stock Quantity Warning</label><input type="number" className="form-control" value={formData.lowStockWarning} onChange={e => handleChange('lowStockWarning', parseInt(e.target.value))} /></div>
              <div className="mb-3"><label className="form-label">Quantity (default in cart)</label><input type="number" className="form-control" value={formData.defaultQuantity} onChange={e => handleChange('defaultQuantity', parseInt(e.target.value))} /></div>
            </div>
          </div>

          {/* Frequently Bought */}
          <div className="form-card">
            <div className="card-header">Frequently Bought</div>
            <div className="card-body">
              {formData.frequentlyBought.map((item, idx) => (
                <div key={idx} className="row g-2 mb-2 align-items-end">
                  <div className="col-5"><select className="form-select" value={item.product} onChange={e => updateFrequentlyBought(idx, 'product', e.target.value)}><option value="">Select Product</option><option>Paracetamol 500mg</option><option>Vitamin C Tablets</option></select></div>
                  <div className="col-5"><select className="form-select" value={item.category} onChange={e => updateFrequentlyBought(idx, 'category', e.target.value)}><option value="">Select Category</option><option>Medicine</option><option>Supplements</option></select></div>
                  <div className="col-2">{formData.frequentlyBought.length > 1 && <button type="button" className="btn btn-sm btn-danger" onClick={() => removeFrequentlyBought(idx)}>Remove</button>}</div>
                </div>
              ))}
              <button type="button" className="btn btn-sm btn-outline-primary" onClick={addFrequentlyBought}>+ Add More</button>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-end gap-2 mt-4 mb-5">
          <button type="button" className="btn-secondary" onClick={() => router.back()}>Cancel</button>
          <button type="button" className="btn-save" onClick={handleSaveAndUnpublish} disabled={saving}>{saving ? 'Saving...' : 'Save & Unpublish'}</button>
          <button type="button" className="btn-save" onClick={handleSaveAndPublish} disabled={saving}>{saving ? 'Saving...' : 'Save & Publish'}</button>
          <button type="button" className="btn-save" onClick={handleSaveAsDraft} disabled={saving}>{saving ? 'Saving...' : 'Save As Draft'}</button>
        </div>
      </form>
    </div>
  );
}
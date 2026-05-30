'use client';

import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './add-product.css';

export default function AddProductPage() {
  const [formData, setFormData] = useState({
    // Basic Info
    productName: '',
    mainCategory: '',
    brand: '',
    // Configuration
    relatedCategories: [],
    unit: '',
    weight: '',
    minPurchaseQty: 1,
    // Tags
    tags: [],
    tagInput: '',
    // Settings
    published: true,
    featured: false,
    todaysDeal: false,
    flashSaleTitle: '',
    flashDiscount: '',
    flashDiscountType: 'percent',
    refundable: false,
    refundNote: 'This product is eligible for return within 7 days of delivery.',
    // Files
    thumbnail: null,
    galleryImages: [],
    // Description
    description: '',
    // SEO
    metaTitle: '',
    metaDescription: '',
    metaImage: null,
    // Shipping
    freeShipping: true,
    flatRate: false,
    quantityMultiply: false,
    shippingDays: '',
    shippingNote: 'This product is shipped within 2-3 business days.',
    // COD
    codAvailable: false,
    codNote: 'Cash on delivery available for orders within India.',
    // Price & Stock
    colors: [],
    attributes: [],
    unitPrice: 0,
    discountDateRange: { start: '', end: '' },
    discount: 0,
    discountType: 'percent',
    stock: 0,
    sku: '',
    externalLink: '',
    externalLinkText: '',
    hsnCode: '',
    gstRate: 0,
    hideStock: 'none',
    lowStockWarning: 0,
    quantity: 1,
    frequentlyBought: [],
  });

  // Medical categories list
  const medicalCategories = [
    'Medicine (Prescription)',
    'Medicine (OTC)',
    'Medical Equipment',
    'Supplements & Vitamins',
    'Ayurveda & Herbal',
    'Diagnostics & Monitoring',
    'Personal Care',
    'First Aid',
    'Mobility Aids',
  ];

  const medicalBrands = [
    'Cipla',
    'Sun Pharma',
    'Pfizer',
    'Omron',
    'Dr. Trust',
    'Dabur',
    'Himalaya',
    'Philips Healthcare',
    'Abbott',
    'GSK',
  ];

  const medicalUnits = [
    'Tablet',
    'Capsule',
    'ml',
    'mg',
    'g',
    'Patch',
    'Spray',
    'Strip',
    'Bottle',
    'Inhaler',
    'Vial',
  ];

  const medicalAttributes = [
    { name: 'Dosage Form', values: ['Tablet', 'Capsule', 'Liquid', 'Injection', 'Cream', 'Ointment'] },
    { name: 'Strength', values: ['100mg', '250mg', '500mg', '1g', '10mg/ml'] },
    { name: 'Pack Size', values: ['10 tablets', '20 tablets', '50 tablets', '30ml', '100ml'] },
    { name: 'Active Ingredient', values: ['Paracetamol', 'Ibuprofen', 'Amoxicillin', 'Cetirizine'] },
    { name: 'Prescription Required', values: ['Yes', 'No'] },
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Tags
  const addTag = () => {
    if (formData.tagInput.trim() && !formData.tags.includes(formData.tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, prev.tagInput.trim()],
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

  // Gallery
  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      galleryImages: [...prev.galleryImages, ...files],
    }));
  };
  const removeGalleryImage = (index) => {
    setFormData(prev => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, i) => i !== index),
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
    console.log('Medical Product Data:', formData);
    alert('Product submitted (demo). Connect to API.');
    // API call would go here
  };

  return (
    <div className="container-fluid py-4" style={{ maxWidth: '1400px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">Add New Medical Product</h2>
        <button type="submit" form="productForm" className="btn btn-primary px-4">
          Save Product
        </button>
      </div>

      <form id="productForm" onSubmit={handleSubmit}>
        {/* ---------- SECTION 1: BASIC INFORMATION ---------- */}
        <div className="form-section">
          <div className="form-section-header">Product Basic Information</div>
          <div className="form-section-body">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Product Name *</label>
                <input type="text" className="form-control" required placeholder="e.g., Paracetamol 500mg Tablets" value={formData.productName} onChange={e => handleChange('productName', e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Select Main Category *</label>
                <select className="form-select" required value={formData.mainCategory} onChange={e => handleChange('mainCategory', e.target.value)}>
                  <option value="">Select Main Category</option>
                  {medicalCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Brand / Manufacturer</label>
                <select className="form-select" value={formData.brand} onChange={e => handleChange('brand', e.target.value)}>
                  <option value="">Select Brand</option>
                  {medicalBrands.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ---------- SECTION 2: PRODUCT CONFIGURATION ---------- */}
        <div className="form-section">
          <div className="form-section-header">Product Configuration</div>
          <div className="form-section-body">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Related Categories *</label>
                <select className="form-select" multiple size="3">
                  {medicalCategories.map(cat => <option key={cat}>{cat}</option>)}
                </select>
                <small className="text-muted">Hold Ctrl/Cmd to select multiple</small>
              </div>
              <div className="col-md-3">
                <label className="form-label">Unit *</label>
                <select className="form-select" value={formData.unit} onChange={e => handleChange('unit', e.target.value)}>
                  <option value="">Select Unit</option>
                  {medicalUnits.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Weight (In Kg) / Volume</label>
                <input type="number" step="0.01" className="form-control" placeholder="e.g., 0.5" value={formData.weight} onChange={e => handleChange('weight', e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Minimum Purchase Qty *</label>
                <input type="number" className="form-control" min="1" value={formData.minPurchaseQty} onChange={e => handleChange('minPurchaseQty', e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        {/* ---------- SECTION 3: BARCODE & TAGS ---------- */}
        <div className="form-section">
          <div className="form-section-header">Barcode & Tags</div>
          <div className="form-section-body">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Barcode</label>
                <button type="button" className="btn btn-outline-secondary w-100">Generate</button>
              </div>
              <div className="col-md-6">
                <label className="form-label">Tags *</label>
                <div className="tag-input-container">
                  {formData.tags.map(tag => (
                    <span key={tag} className="tag">{tag} <i className="bi bi-x-circle" onClick={() => removeTag(tag)}></i></span>
                  ))}
                  <input type="text" className="tag-input" placeholder="Type and hit enter to add a tag (e.g., fever, pain relief)"
                    value={formData.tagInput}
                    onChange={e => handleChange('tagInput', e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                </div>
                <small className="text-muted">These keywords help customers find the product via search.</small>
              </div>
            </div>
          </div>
        </div>

        {/* ---------- SECTION 4: PRODUCT SETTINGS ---------- */}
        <div className="form-section">
          <div className="form-section-header">Product Settings</div>
          <div className="form-section-body">
            <div className="row g-3">
              <div className="col-md-4">
                <div className="form-check"><input className="form-check-input" type="checkbox" checked={formData.published} onChange={e => handleChange('published', e.target.checked)} /><label className="form-check-label">Published</label></div>
                <div className="form-check"><input className="form-check-input" type="checkbox" checked={formData.featured} onChange={e => handleChange('featured', e.target.checked)} /><label className="form-check-label">Featured</label></div>
                <div className="form-check"><input className="form-check-input" type="checkbox" checked={formData.todaysDeal} onChange={e => handleChange('todaysDeal', e.target.checked)} /><label className="form-check-label">Today's Deal</label></div>
              </div>
              <div className="col-md-8">
                <label className="form-label">Flash Sale</label>
                <div className="row g-2">
                  <div className="col-4"><select className="form-select" value={formData.flashSaleTitle} onChange={e => handleChange('flashSaleTitle', e.target.value)}><option>Choose Flash Title</option><option>Summer Health Offer</option><option>Monsoon Immunity Boost</option></select></div>
                  <div className="col-4"><input type="number" className="form-control" placeholder="Discount" value={formData.flashDiscount} onChange={e => handleChange('flashDiscount', e.target.value)} /></div>
                  <div className="col-4"><select className="form-select" value={formData.flashDiscountType} onChange={e => handleChange('flashDiscountType', e.target.value)}><option value="percent">Percent</option><option value="fixed">Fixed</option></select></div>
                </div>
              </div>
            </div>
            <hr className="my-3" />
            <div className="row">
              <div className="col-md-6">
                <div className="form-check"><input className="form-check-input" type="checkbox" checked={formData.refundable} onChange={e => handleChange('refundable', e.target.checked)} /><label className="form-check-label">Refundable</label></div>
                <div className="form-check"><input className="form-check-input" type="checkbox" /><label>Show refund notes on product page</label></div>
              </div>
              <div className="col-md-6">
                <label className="form-label">Refund Note</label>
                <textarea rows="2" className="form-control" value={formData.refundNote} onChange={e => handleChange('refundNote', e.target.value)}></textarea>
              </div>
            </div>
          </div>
        </div>

        {/* ---------- SECTION 5: FILES & MEDIA ---------- */}
        <div className="form-section">
          <div className="form-section-header">Files & Media</div>
          <div className="form-section-body">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Add Thumbnail Image</label>
                <input type="file" className="form-control" accept="image/*" onChange={e => handleChange('thumbnail', e.target.files[0])} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Add Gallery Images *</label>
                <input type="file" className="form-control" multiple accept="image/*" onChange={handleGalleryChange} />
                <div className="gallery-preview">
                  {formData.galleryImages.map((img, idx) => (
                    <div key={idx} className="gallery-item" style={{ backgroundImage: `url(${URL.createObjectURL(img)})`, backgroundSize: 'cover' }} onClick={() => removeGalleryImage(idx)}>
                      <i className="bi bi-trash text-white bg-dark rounded-circle p-1"></i>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-3 text-end"><button type="button" className="btn btn-sm btn-outline-secondary">Add New Preset</button></div>
          </div>
        </div>

        {/* ---------- SECTION 6: PRODUCT DESCRIPTION ---------- */}
        <div className="form-section">
          <div className="form-section-header">Product Description</div>
          <div className="form-section-body">
            <textarea className="form-control" rows="6" placeholder="Include usage instructions, ingredients, precautions, etc." value={formData.description} onChange={e => handleChange('description', e.target.value)}></textarea>
          </div>
        </div>

        {/* ---------- SECTION 7: SEO META TAGS ---------- */}
        <div className="form-section">
          <div className="form-section-header">SEO Meta Tags</div>
          <div className="form-section-body">
            <div className="mb-3"><label className="form-label">Meta Title</label><input type="text" className="form-control" placeholder="e.g., Buy Paracetamol 500mg Online" value={formData.metaTitle} onChange={e => handleChange('metaTitle', e.target.value)} /></div>
            <div className="mb-3"><label className="form-label">Meta Description</label><textarea rows="2" className="form-control" placeholder="Brief description for search engines" value={formData.metaDescription} onChange={e => handleChange('metaDescription', e.target.value)}></textarea></div>
            <div><label className="form-label">Meta Image</label><input type="file" className="form-control" onChange={e => handleChange('metaImage', e.target.files[0])} /></div>
          </div>
        </div>

        {/* ---------- SECTION 8: SHIPPING ---------- */}
        <div className="form-section">
          <div className="form-section-header">Shipping</div>
          <div className="form-section-body">
            <div className="row g-3">
              <div className="col-md-4">
                <div className="form-check"><input className="form-check-input" type="checkbox" checked={formData.freeShipping} onChange={e => handleChange('freeShipping', e.target.checked)} /><label>Free Shipping</label></div>
                <div className="form-check"><input className="form-check-input" type="checkbox" checked={formData.flatRate} onChange={e => handleChange('flatRate', e.target.checked)} /><label>Flat Rate</label></div>
                <div className="form-check"><input className="form-check-input" type="checkbox" checked={formData.quantityMultiply} onChange={e => handleChange('quantityMultiply', e.target.checked)} /><label>Is Product Quantity Multiply</label></div>
              </div>
              <div className="col-md-4">
                <label>Estimated Shipping Time</label>
                <input type="text" className="form-control" placeholder="e.g., 3-5 days" value={formData.shippingDays} onChange={e => handleChange('shippingDays', e.target.value)} />
                <div className="form-check mt-2"><input type="checkbox" /><label>Show on product page</label></div>
              </div>
              <div className="col-md-4">
                <label>Shipping Notes</label>
                <textarea rows="3" className="form-control" value={formData.shippingNote} onChange={e => handleChange('shippingNote', e.target.value)}></textarea>
              </div>
            </div>
          </div>
        </div>

        {/* ---------- SECTION 9: CASH ON DELIVERY ---------- */}
        <div className="form-section">
          <div className="form-section-header">Cash on Delivery</div>
          <div className="form-section-body">
            <div className="row g-3">
              <div className="col-md-6">
                <div className="form-check"><input className="form-check-input" type="checkbox" checked={formData.codAvailable} onChange={e => handleChange('codAvailable', e.target.checked)} /><label>Cash on delivery available</label></div>
                <div className="form-check"><input type="checkbox" /><label>Show notes in COD section</label></div>
              </div>
              <div className="col-md-6">
                <label>COD Notes</label>
                <textarea rows="3" className="form-control" value={formData.codNote} onChange={e => handleChange('codNote', e.target.value)}></textarea>
              </div>
            </div>
          </div>
        </div>

        {/* ---------- SECTION 10: PRODUCT PRICE + STOCK ---------- */}
        <div className="form-section">
          <div className="form-section-header">Product price + stock</div>
          <div className="form-section-body">
            <div className="row g-3">
              <div className="col-md-6">
                <label>Colors</label>
                <select className="form-select" multiple size="3"><option>Not applicable</option><option>White (for devices)</option><option>Black</option></select>
                <small className="text-muted">Most medical products don't have color variations</small>
              </div>
              <div className="col-md-6">
                <label>Attributes</label>
                <select className="form-select" multiple size="3">
                  {medicalAttributes.map(attr => <option key={attr.name}>{attr.name}</option>)}
                </select>
              </div>
              <div className="col-md-3"><label>Unit price * (₹)</label><input type="number" className="form-control" value={formData.unitPrice} onChange={e => handleChange('unitPrice', e.target.value)} /></div>
              <div className="col-md-3"><label>Discount Date Range</label><input type="date" className="form-control" placeholder="Start" /> to <input type="date" className="form-control mt-1" placeholder="End" /></div>
              <div className="col-md-3"><label>Discount (%)</label><input type="number" className="form-control" value={formData.discount} onChange={e => handleChange('discount', e.target.value)} /></div>
              <div className="col-md-3"><label>Discount Type</label><select className="form-select" value={formData.discountType} onChange={e => handleChange('discountType', e.target.value)}><option>Percent</option><option>Fixed</option></select></div>
              <div className="col-md-3"><label>Stock</label><input type="number" className="form-control" value={formData.stock} onChange={e => handleChange('stock', e.target.value)} /></div>
              <div className="col-md-3"><label>SKU</label><div className="input-group"><input type="text" className="form-control" value={formData.sku} onChange={e => handleChange('sku', e.target.value)} /><button type="button" className="btn btn-outline-secondary">Generate</button></div></div>
              <div className="col-md-3"><label>Product External Link (e.g., FDA info)</label><input type="url" className="form-control" placeholder="External link" value={formData.externalLink} onChange={e => handleChange('externalLink', e.target.value)} /></div>
              <div className="col-md-3"><label>Link Button Text</label><input type="text" className="form-control" placeholder="e.g., More Info" value={formData.externalLinkText} onChange={e => handleChange('externalLinkText', e.target.value)} /></div>
            </div>
            <hr />
            <div className="row g-3">
              <div className="col-md-3"><label>HSN Code</label><input type="text" className="form-control" value={formData.hsnCode} onChange={e => handleChange('hsnCode', e.target.value)} /></div>
              <div className="col-md-3"><label>GST Rate (%)</label><input type="number" className="form-control" step="0.01" value={formData.gstRate} onChange={e => handleChange('gstRate', e.target.value)} /></div>
            </div>
            <hr />
            <div className="row g-3">
              <div className="col-md-4">
                <label>Hide Stock Visibility State</label>
                <select className="form-select" value={formData.hideStock} onChange={e => handleChange('hideStock', e.target.value)}>
                  <option value="none">Show Stock Quantity</option>
                  <option value="text_only">Show Stock With Text Only</option>
                </select>
              </div>
              <div className="col-md-4"><label>Low Stock Quantity Warning</label><input type="number" className="form-control" value={formData.lowStockWarning} onChange={e => handleChange('lowStockWarning', e.target.value)} /></div>
              <div className="col-md-4"><label>Quantity (default in cart)</label><input type="number" className="form-control" value={formData.quantity} onChange={e => handleChange('quantity', e.target.value)} /></div>
            </div>
            <hr />
            <div className="mt-3">
              <label>Frequently Bought Together</label>
              {formData.frequentlyBought.map((item, idx) => (
                <div key={idx} className="row g-2 mb-2 align-items-end">
                  <div className="col-5"><select className="form-select" value={item.product} onChange={e => updateFrequentlyBought(idx, 'product', e.target.value)}><option>Select Product</option><option>Paracetamol 500mg</option><option>Vitamin C Tablets</option></select></div>
                  <div className="col-5"><select className="form-select" value={item.category} onChange={e => updateFrequentlyBought(idx, 'category', e.target.value)}><option>Select Category</option><option>Medicine</option><option>Supplements</option></select></div>
                  <div className="col-2"><button type="button" className="btn btn-sm btn-danger" onClick={() => removeFrequentlyBought(idx)}>Remove</button></div>
                </div>
              ))}
              <button type="button" className="btn btn-sm btn-outline-primary" onClick={addFrequentlyBought}>+ Add More</button>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-end gap-2 mt-4 mb-5">
          <button type="button" className="btn btn-secondary">Cancel</button>
          <button type="submit" className="btn btn-primary px-5">Save Product</button>
        </div>
      </form>
    </div>
  );
}
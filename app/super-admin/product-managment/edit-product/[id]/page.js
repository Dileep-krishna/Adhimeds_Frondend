'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './edit-product.css';
import { getProductByIdAPI, updateProductAPI } from '../../../../services/productService';
import SERVERURL from '../../../../services/serverURL';

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    productName: '',
    mainCategory: '',
    brand: '',
    relatedCategories: [],
    unit: '',
    weight: '',
    minPurchaseQty: 1,
    tags: [],
    tagInput: '',
    published: true,
    featured: false,
    todaysDeal: false,
    refundable: false,
    refundNote: 'This product is eligible for return within 7 days of delivery.',
    thumbnail: null,
    galleryImages: [],
    description: '',
    metaTitle: '',
    metaDescription: '',
    metaImage: null,
    freeShipping: true,
    flatRate: false,
    quantityMultiply: false,
    shippingDays: '',
    shippingNote: 'This product is shipped within 2-3 business days.',
    codAvailable: false,
    codNote: 'Cash on delivery available for orders within India.',
    attributes: [],
    unitPrice: 0,
    discount: 0,
    discountType: 'percent',
    discountStartDate: '',
    discountEndDate: '',
    stock: 0,
    sku: '',
    barcode: '',
    externalLink: '',
    externalLinkText: '',
    hsnCode: '',
    gstRate: 0,
    hideStock: 'none',
    lowStockWarning: 0,
    quantity: 1,
    frequentlyBought: [],
  });

  // Store existing image filenames to show previews
  const [existingThumbnail, setExistingThumbnail] = useState('');
  const [existingMetaImage, setExistingMetaImage] = useState('');
  const [existingGalleryImages, setExistingGalleryImages] = useState([]);

  // Helper to get full image URL
  const getImageUrl = (filename) => {
    if (!filename) return null;
    return `${SERVERURL}/imgUploads/${filename}`;
  };

  // Medical categories, units, attributes
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

  const medicalUnits = [
    'Tablet', 'Capsule', 'ml', 'mg', 'g', 'Patch', 'Spray', 'Strip', 'Bottle', 'Inhaler', 'Vial',
  ];

  const medicalAttributes = [
    { name: 'Dosage Form', values: ['Tablet', 'Capsule', 'Liquid', 'Injection', 'Cream', 'Ointment'] },
    { name: 'Strength', values: ['100mg', '250mg', '500mg', '1g', '10mg/ml'] },
    { name: 'Pack Size', values: ['10 tablets', '20 tablets', '50 tablets', '30ml', '100ml'] },
    { name: 'Active Ingredient', values: ['Paracetamol', 'Ibuprofen', 'Amoxicillin', 'Cetirizine'] },
    { name: 'Prescription Required', values: ['Yes', 'No'] },
  ];

  // Fetch product data
  useEffect(() => {
    console.log("🔍 Edit page mounted. ID from useParams():", id);
    if (!id) {
      console.error("❌ No product ID in URL");
      toast.error("Invalid product ID – missing from URL");
      router.push('/super-admin/product-managment/all-products');
      return;
    }

    const fetchProduct = async () => {
      setLoading(true);
      try {
        console.log(`📡 Calling getProductByIdAPI with ID: ${id}`);
        const response = await getProductByIdAPI(id);
        console.log("📦 API response:", response);

        if (response.success && response.data) {
          const product = response.data;
          console.log("✅ Product loaded:", product);

          // Store existing image filenames for preview
          setExistingThumbnail(product.thumbnail || '');
          setExistingMetaImage(product.metaImage || '');
          setExistingGalleryImages(product.galleryImages || []);

          // Populate formData with the fetched product
          setFormData({
            productName: product.productName || '',
            mainCategory: product.mainCategory || '',
            brand: product.brand || '',
            relatedCategories: product.relatedCategories || [],
            unit: product.unit || '',
            weight: product.weight || '',
            minPurchaseQty: product.minPurchaseQty || 1,
            tags: product.tags || [],
            tagInput: '',
            published: product.published ?? true,
            featured: product.featured ?? false,
            todaysDeal: product.todaysDeal ?? false,
            refundable: product.refundable ?? false,
            refundNote: product.refundNote || 'This product is eligible for return within 7 days of delivery.',
            thumbnail: null,
            galleryImages: [],
            description: product.description || '',
            metaTitle: product.metaTitle || '',
            metaDescription: product.metaDescription || '',
            metaImage: null,
            freeShipping: product.freeShipping ?? true,
            flatRate: product.flatRate ?? false,
            quantityMultiply: product.quantityMultiply ?? false,
            shippingDays: product.shippingDays || '',
            shippingNote: product.shippingNote || 'This product is shipped within 2-3 business days.',
            codAvailable: product.codAvailable ?? false,
            codNote: product.codNote || 'Cash on delivery available for orders within India.',
            attributes: product.attributes || [],
            unitPrice: product.unitPrice || 0,
            discount: product.discount || 0,
            discountType: product.discountType || 'percent',
            discountStartDate: product.discountStartDate ? new Date(product.discountStartDate).toISOString().split('T')[0] : '',
            discountEndDate: product.discountEndDate ? new Date(product.discountEndDate).toISOString().split('T')[0] : '',
            stock: product.stock || 0,
            sku: product.sku || '',
            barcode: product.barcode || '',
            externalLink: product.externalLink || '',
            externalLinkText: product.externalLinkText || '',
            hsnCode: product.hsnCode || '',
            gstRate: product.gstRate || 0,
            hideStock: product.hideStock || 'none',
            lowStockWarning: product.lowStockWarning || 0,
            quantity: product.quantity || 1,
            frequentlyBought: product.frequentlyBought || [],
          });
        } else {
          console.error("❌ API returned success=false:", response.message);
          toast.error(response.message || "Failed to load product");
          router.push("/super-admin/product-managment/all-products");
        }
      } catch (error) {
        console.error("🔥 Fetch error:", error);
        toast.error("Server error – check console for details");
        router.push("/super-admin/product-managment/all-products");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, router]);

  // Handlers
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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

  const generateBarcode = () => {
    const randomCode = Math.random().toString(36).substring(2, 12).toUpperCase();
    handleChange('barcode', randomCode);
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formData.productName || !formData.mainCategory || !formData.brand) {
    toast.error('Please fill in all required fields (*)');
    return;
  }

  setSaving(true);
  try {
    const payload = { ...formData };
    delete payload.thumbnail;
    delete payload.metaImage;
    delete payload.galleryImages;
    delete payload.tagInput;

    const numericFields = ['weight', 'minPurchaseQty', 'unitPrice', 'discount', 'stock', 'lowStockWarning', 'quantity', 'gstRate'];
    numericFields.forEach(field => {
      if (payload[field] !== undefined) payload[field] = Number(payload[field]) || 0;
    });

    console.log("📤 Sending update payload:", JSON.stringify(payload, null, 2)); // ✅ ADD THIS

    const response = await updateProductAPI(id, payload);
    console.log("📥 Update response:", response); // ✅ ADD THIS

    if (response.success) {
      toast.success('Product updated successfully!');
      router.push('/super-admin/product-managment/all-product');
    } else {
      toast.error(response.message || 'Failed to update product');
    }
  } catch (error) {
    console.error('Update error:', error);
    toast.error('Network or server error');
  } finally {
    setSaving(false);
  }
};

  if (loading) {
    return <div className="container-fluid py-4 text-center">Loading product data...</div>;
  }

  return (
    <div className="container-fluid py-4" style={{ maxWidth: '1400px' }}>
      <Toaster position="top-right" />
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">Edit Medical Product</h2>
        <button type="submit" form="productForm" className="btn btn-primary px-4" disabled={saving}>
          {saving ? 'Updating...' : 'Update Product'}
        </button>
      </div>

      <form id="productForm" onSubmit={handleSubmit}>
        {/* SECTION 1: BASIC INFORMATION */}
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
                <label className="form-label">Brand / Manufacturer *</label>
                <input type="text" className="form-control" required placeholder="e.g., Cipla, Sun Pharma, Himalaya" value={formData.brand} onChange={e => handleChange('brand', e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: PRODUCT CONFIGURATION */}
        <div className="form-section">
          <div className="form-section-header">Product Configuration</div>
          <div className="form-section-body">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Related Categories</label>
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

        {/* SECTION 3: BARCODE & TAGS */}
        <div className="form-section">
          <div className="form-section-header">Barcode & Tags</div>
          <div className="form-section-body">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Barcode</label>
                <div className="input-group">
                  <input type="text" className="form-control" placeholder="Enter barcode manually or generate" value={formData.barcode} onChange={e => handleChange('barcode', e.target.value)} />
                  <button type="button" className="btn btn-outline-secondary" onClick={generateBarcode}>Generate</button>
                </div>
              </div>
              <div className="col-md-6">
                <label className="form-label">Tags *</label>
                <div className="tag-input-container">
                  {formData.tags.map(tag => (
                    <span key={tag} className="tag">{tag} <i className="bi bi-x-circle" onClick={() => removeTag(tag)}></i></span>
                  ))}
                  <input type="text" className="tag-input" placeholder="Type and hit enter to add a tag (e.g., fever, pain relief)" value={formData.tagInput} onChange={e => handleChange('tagInput', e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())} />
                </div>
                <small className="text-muted">These keywords help customers find the product via search.</small>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: PRODUCT SETTINGS */}
        <div className="form-section">
          <div className="form-section-header">Product Settings</div>
          <div className="form-section-body">
            <div className="row g-3">
              <div className="col-md-4">
                <div className="form-check"><input className="form-check-input" type="checkbox" checked={formData.published} onChange={e => handleChange('published', e.target.checked)} /><label className="form-check-label">Published</label></div>
                <div className="form-check"><input className="form-check-input" type="checkbox" checked={formData.featured} onChange={e => handleChange('featured', e.target.checked)} /><label className="form-check-label">Featured</label></div>
                <div className="form-check"><input className="form-check-input" type="checkbox" checked={formData.todaysDeal} onChange={e => handleChange('todaysDeal', e.target.checked)} /><label className="form-check-label">Today's Deal</label></div>
              </div>
            </div>
            <hr className="my-3" />
            <div className="row">
              <div className="col-md-6"><div className="form-check"><input className="form-check-input" type="checkbox" checked={formData.refundable} onChange={e => handleChange('refundable', e.target.checked)} /><label className="form-check-label">Refundable</label></div></div>
              <div className="col-md-6"><label className="form-label">Refund Note</label><textarea rows="2" className="form-control" value={formData.refundNote} onChange={e => handleChange('refundNote', e.target.value)} /></div>
            </div>
          </div>
        </div>

        {/* SECTION 5: FILES & MEDIA */}
        <div className="form-section">
          <div className="form-section-header">Files & Media</div>
          <div className="form-section-body">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Current Thumbnail</label>
                {existingThumbnail && (
                  <div className="mb-2">
                    <img src={getImageUrl(existingThumbnail)} alt="Thumbnail" width="100" className="img-thumbnail" />
                    <div className="text-muted small">Upload a new image to replace it</div>
                  </div>
                )}
                <label className="form-label">Replace Thumbnail (optional)</label>
                <input type="file" className="form-control" accept="image/*" onChange={e => handleChange('thumbnail', e.target.files[0])} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Current Gallery Images</label>
                {existingGalleryImages.length > 0 && (
                  <div className="d-flex flex-wrap gap-2 mb-2">
                    {existingGalleryImages.map((img, idx) => (
                      <img key={idx} src={getImageUrl(img)} alt={`Gallery ${idx}`} width="60" height="60" style={{ objectFit: 'cover', borderRadius: '4px' }} />
                    ))}
                    <div className="text-muted small w-100">Upload new images to replace the whole gallery (old will be removed)</div>
                  </div>
                )}
                <label className="form-label">Add New Gallery Images (optional)</label>
                <input type="file" className="form-control" multiple accept="image/*" onChange={handleGalleryChange} />
                <div className="gallery-preview">
                  {formData.galleryImages.map((img, idx) => (
                    <div key={idx} className="gallery-item" style={{ backgroundImage: `url(${img instanceof File ? URL.createObjectURL(img) : ''})`, backgroundSize: 'cover' }} onClick={() => removeGalleryImage(idx)}>
                      <i className="bi bi-trash text-white bg-dark rounded-circle p-1"></i>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 6: PRODUCT DESCRIPTION */}
        <div className="form-section">
          <div className="form-section-header">Product Description</div>
          <div className="form-section-body">
            <textarea className="form-control" rows="6" placeholder="Include usage instructions, ingredients, precautions, etc." value={formData.description} onChange={e => handleChange('description', e.target.value)} />
          </div>
        </div>

        {/* SECTION 7: SEO META TAGS */}
        <div className="form-section">
          <div className="form-section-header">SEO Meta Tags</div>
          <div className="form-section-body">
            <div className="mb-3"><label className="form-label">Meta Title</label><input type="text" className="form-control" placeholder="e.g., Buy Paracetamol 500mg Online" value={formData.metaTitle} onChange={e => handleChange('metaTitle', e.target.value)} /></div>
            <div className="mb-3"><label className="form-label">Meta Description</label><textarea rows="2" className="form-control" placeholder="Brief description for search engines" value={formData.metaDescription} onChange={e => handleChange('metaDescription', e.target.value)} /></div>
            <div>
              <label className="form-label">Current Meta Image</label>
              {existingMetaImage && (
                <div className="mb-2">
                  <img src={getImageUrl(existingMetaImage)} alt="Meta Image" width="100" className="img-thumbnail" />
                  <div className="text-muted small">Upload a new image to replace it</div>
                </div>
              )}
              <label className="form-label">Replace Meta Image (optional)</label>
              <input type="file" className="form-control" onChange={e => handleChange('metaImage', e.target.files[0])} />
            </div>
          </div>
        </div>

        {/* SECTION 8: SHIPPING */}
        <div className="form-section">
          <div className="form-section-header">Shipping</div>
          <div className="form-section-body">
            <div className="row g-3">
              <div className="col-md-4">
                <div className="form-check"><input className="form-check-input" type="checkbox" checked={formData.freeShipping} onChange={e => handleChange('freeShipping', e.target.checked)} /><label>Free Shipping</label></div>
                <div className="form-check"><input className="form-check-input" type="checkbox" checked={formData.flatRate} onChange={e => handleChange('flatRate', e.target.checked)} /><label>Flat Rate</label></div>
                <div className="form-check"><input className="form-check-input" type="checkbox" checked={formData.quantityMultiply} onChange={e => handleChange('quantityMultiply', e.target.checked)} /><label>Is Product Quantity Multiply</label></div>
              </div>
              <div className="col-md-4"><label>Estimated Shipping Time</label><input type="text" className="form-control" placeholder="e.g., 3-5 days" value={formData.shippingDays} onChange={e => handleChange('shippingDays', e.target.value)} /></div>
              <div className="col-md-4"><label>Shipping Notes</label><textarea rows="3" className="form-control" value={formData.shippingNote} onChange={e => handleChange('shippingNote', e.target.value)} /></div>
            </div>
          </div>
        </div>

        {/* SECTION 9: CASH ON DELIVERY */}
        <div className="form-section">
          <div className="form-section-header">Cash on Delivery</div>
          <div className="form-section-body">
            <div className="row g-3">
              <div className="col-md-6"><div className="form-check"><input className="form-check-input" type="checkbox" checked={formData.codAvailable} onChange={e => handleChange('codAvailable', e.target.checked)} /><label>Cash on delivery available</label></div></div>
              <div className="col-md-6"><label>COD Notes</label><textarea rows="3" className="form-control" value={formData.codNote} onChange={e => handleChange('codNote', e.target.value)} /></div>
            </div>
          </div>
        </div>

        {/* SECTION 10: PRODUCT PRICE + STOCK */}
        <div className="form-section">
          <div className="form-section-header">Product price + stock</div>
          <div className="form-section-body">
            <div className="row g-3">
              <div className="col-md-6"><label>Attributes</label><select className="form-select" multiple size="3">{medicalAttributes.map(attr => <option key={attr.name}>{attr.name}</option>)}</select></div>
              <div className="col-md-3"><label>Unit price * (₹)</label><input type="number" className="form-control" value={formData.unitPrice} onChange={e => handleChange('unitPrice', e.target.value)} /></div>
              <div className="col-md-3"><label>Discount (%)</label><input type="number" className="form-control" value={formData.discount} onChange={e => handleChange('discount', e.target.value)} /></div>
              <div className="col-md-3"><label>Discount Type</label><select className="form-select" value={formData.discountType} onChange={e => handleChange('discountType', e.target.value)}><option value="percent">Percent</option><option value="fixed">Fixed</option></select></div>
              <div className="col-md-3"><label>Discount Start Date</label><input type="date" className="form-control" value={formData.discountStartDate} onChange={e => handleChange('discountStartDate', e.target.value)} /></div>
              <div className="col-md-3"><label>Discount End Date</label><input type="date" className="form-control" value={formData.discountEndDate} onChange={e => handleChange('discountEndDate', e.target.value)} /></div>
              <div className="col-md-3"><label>Stock</label><input type="number" className="form-control" value={formData.stock} onChange={e => handleChange('stock', e.target.value)} /></div>
              <div className="col-md-3"><label>SKU</label><div className="input-group"><input type="text" className="form-control" value={formData.sku} onChange={e => handleChange('sku', e.target.value)} /><button type="button" className="btn btn-outline-secondary">Generate</button></div></div>
              <div className="col-md-3"><label>Product External Link</label><input type="url" className="form-control" placeholder="External link" value={formData.externalLink} onChange={e => handleChange('externalLink', e.target.value)} /></div>
              <div className="col-md-3"><label>Link Button Text</label><input type="text" className="form-control" placeholder="e.g., More Info" value={formData.externalLinkText} onChange={e => handleChange('externalLinkText', e.target.value)} /></div>
            </div>
            <hr />
            <div className="row g-3">
              <div className="col-md-3"><label>HSN Code</label><input type="text" className="form-control" value={formData.hsnCode} onChange={e => handleChange('hsnCode', e.target.value)} /></div>
              <div className="col-md-3"><label>GST Rate (%)</label><input type="number" className="form-control" step="0.01" value={formData.gstRate} onChange={e => handleChange('gstRate', e.target.value)} /></div>
            </div>
            <hr />
            <div className="row g-3">
              <div className="col-md-4"><label>Hide Stock Visibility State</label><select className="form-select" value={formData.hideStock} onChange={e => handleChange('hideStock', e.target.value)}><option value="none">Show Stock Quantity</option><option value="text_only">Show Stock With Text Only</option></select></div>
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
          <button type="button" className="btn btn-secondary" onClick={() => router.back()}>Cancel</button>
          <button type="submit" className="btn btn-primary px-5" disabled={saving}>{saving ? 'Updating...' : 'Update Product'}</button>
        </div>
      </form>
    </div>
  );
}
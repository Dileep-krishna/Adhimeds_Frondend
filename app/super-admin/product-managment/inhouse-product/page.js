'use client';
import React, { useState } from 'react';
import './inhouse.css';

function InhouseProductsPage() {
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [products, setProducts] = useState([
    { id: 1, name: 'Paracetamol 500mg', brand: 'Adhimeds', category: 'Medicine', price: 49, stock: 150, status: 'Active', image: null },
    { id: 2, name: 'Vitamin D3 2000IU', brand: 'Adhimeds', category: 'Supplements', price: 299, stock: 80, status: 'Active', image: null },
    { id: 3, name: 'BP Monitor', brand: 'Adhimeds', category: 'Equipment', price: 2499, stock: 12, status: 'Inactive', image: null },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    brand: 'Adhimeds',
    category: '',
    price: '',
    stock: '',
    status: 'Active',
    description: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const categories = ['Medicine', 'Supplements', 'Equipment', 'Ayurveda', 'Personal Care', 'Diagnostics'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      brand: 'Adhimeds',
      category: '',
      price: '',
      stock: '',
      status: 'Active',
      description: '',
    });
    setImageFile(null);
    setImagePreview(null);
    setIsEditMode(false);
    setCurrentProduct(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setIsEditMode(true);
    setCurrentProduct(product);
    setFormData({
      name: product.name,
      brand: product.brand,
      category: product.category,
      price: product.price,
      stock: product.stock,
      status: product.status,
      description: product.description || '',
    });
    setImagePreview(product.image);
    setImageFile(null);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.category || !formData.price) {
      alert('Please fill required fields: Name, Category, Price');
      return;
    }
    const newProduct = {
      id: isEditMode ? currentProduct.id : Date.now(),
      name: formData.name,
      brand: formData.brand,
      category: formData.category,
      price: Number(formData.price),
      stock: Number(formData.stock),
      status: formData.status,
      description: formData.description,
      image: imagePreview || (currentProduct?.image || null),
    };
    if (isEditMode) {
      setProducts(products.map(p => p.id === currentProduct.id ? newProduct : p));
    } else {
      setProducts([...products, newProduct]);
    }
    setShowModal(false);
    resetForm();
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this product permanently?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  return (
    <div className="inhouse-container">
      <div className="header-actions">
        <h4 className="page-title">In‑House Products</h4>
        <button className="btn-add" onClick={openAddModal}>
          + Add New Product
        </button>
      </div>

      <div className="table-responsive">
        <table className="med-table">
          <thead>
            <tr>
              <th>Thumb</th>
              <th>Name / Brand</th>
              <th>Category</th>
              <th>Price (₹)</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Options</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td>
                  {product.image ? (
                    <img src={product.image} className="product-thumb" alt="thumb" />
                  ) : (
                    <div className="product-thumb placeholder">No img</div>
                  )}
                </td>
                <td>
                  <div className="fw-bold">{product.name}</div>
                  <small className="text-primary">{product.brand}</small>
                </td>
                <td>{product.category}</td>
                <td>₹{product.price}</td>
                <td>{product.stock}</td>
                <td>
                  <span className={`badge ${product.status === 'Active' ? 'badge-success' : 'badge-secondary'}`}>
                    {product.status}
                  </span>
                </td>
                <td>
                  <button className="btn-icon edit" onClick={() => openEditModal(product)}>
                    <i className="bi bi-pencil"></i>
                  </button>
                  <button className="btn-icon delete" onClick={() => handleDelete(product.id)}>
                    <i className="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan="7" className="text-center">No in‑house products found. Add one!</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5>{isEditMode ? 'Edit Product' : 'Add In‑House Product'}</h5>
              <button className="close-modal" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Product Name *</label>
                <input type="text" name="name" className="form-control" value={formData.name} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Brand (In‑House)</label>
                <input type="text" name="brand" className="form-control" value={formData.brand} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Category *</label>
                <select name="category" className="form-control" value={formData.category} onChange={handleInputChange}>
                  <option value="">Select Category</option>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Price (₹) *</label>
                    <input type="number" name="price" className="form-control" value={formData.price} onChange={handleInputChange} />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Stock Quantity</label>
                    <input type="number" name="stock" className="form-control" value={formData.stock} onChange={handleInputChange} />
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select name="status" className="form-control" value={formData.status} onChange={handleInputChange}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" className="form-control" rows="3" value={formData.description} onChange={handleInputChange}></textarea>
              </div>
              <div className="form-group">
                <label>Product Image</label>
                <input type="file" className="form-control" accept="image/*" onChange={handleImageChange} />
                {imagePreview && <img src={imagePreview} className="image-preview mt-2" alt="preview" />}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-save" onClick={handleSave}>{isEditMode ? 'Update' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InhouseProductsPage;
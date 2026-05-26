"use client";

import { useState } from "react";
import "./products.css";

export default function Products() {
  const [products, setProducts] = useState([
    { id: 1, name: "Paracetamol 500mg", category: "Tablets", price: 50, stock: 100, status: "active" },
    { id: 2, name: "Amoxicillin 250mg", category: "Capsules", price: 120, stock: 45, status: "active" },
    { id: 3, name: "Cough Syrup", category: "Syrups", price: 160, stock: 8, status: "lowstock" },
    { id: 4, name: "Vitamin C Tablets", category: "Tablets", price: 150, stock: 200, status: "active" },
    { id: 5, name: "Insulin Pen", category: "Injections", price: 850, stock: 3, status: "lowstock" },
    { id: 6, name: "Dolo 650", category: "Tablets", price: 45, stock: 0, status: "outofstock" },
    { id: 7, name: "Cetrizine", category: "Tablets", price: 70, stock: 25, status: "active" },
  ]);

  const categories = ["Tablets", "Capsules", "Syrups", "Injections", "Ointments"];

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    category: categories[0],
    price: "",
    stock: "",
  });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getStockBadge = (stock, status) => {
    if (status === "outofstock" || stock === 0) return <span className="badge-stock out">Out of Stock</span>;
    if (status === "lowstock" || stock < 10) return <span className="badge-stock low">Low Stock</span>;
    return <span className="badge-stock in">In Stock</span>;
  };

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        category: product.category,
        price: product.price,
        stock: product.stock,
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: "", category: categories[0], price: "", stock: "" });
    }
    setShowModal(true);
  };

  const saveProduct = () => {
    if (!formData.name || !formData.price || !formData.stock) return;
    const status = formData.stock === 0 ? "outofstock" : formData.stock < 10 ? "lowstock" : "active";
    if (editingProduct) {
      setProducts(
        products.map((p) =>
          p.id === editingProduct.id
            ? { ...p, ...formData, status, price: Number(formData.price), stock: Number(formData.stock) }
            : p
        )
      );
    } else {
      const newId = Math.max(0, ...products.map((p) => p.id)) + 1;
      setProducts([
        ...products,
        {
          id: newId,
          ...formData,
          price: Number(formData.price),
          stock: Number(formData.stock),
          status,
        },
      ]);
    }
    setShowModal(false);
  };

  const deleteProduct = (id) => {
    setProducts(products.filter((p) => p.id !== id));
    setDeleteConfirm(null);
  };

  return (
    <div className="products-container">
      {/* Header */}
      <div className="products-header">
        <div>
          <h1 className="page-title"><i className="bi bi-box-seam"></i> Products</h1>
          <p className="page-subtitle">Manage your inventory and product listings</p>
        </div>
        <button className="btn-primary-glow" onClick={() => openModal()}>
          <i className="bi bi-plus-circle"></i> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="search-box">
          <i className="bi bi-search"></i>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label><i className="bi bi-tags"></i> Category:</label>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="table-wrapper">
        <table className="products-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td><strong>{product.name}</strong></td>
                <td>{product.category}</td>
                <td>₹{product.price}</td>
                <td>{product.stock}</td>
                <td>{getStockBadge(product.stock, product.status)}</td>
                <td>
                  <div className="action-buttons">
                    <button className="action-icon view" onClick={() => setViewingProduct(product)}>
                      <i className="bi bi-eye"></i>
                    </button>
                    <button className="action-icon edit" onClick={() => openModal(product)}>
                      <i className="bi bi-pencil-square"></i>
                    </button>
                    <button className="action-icon delete" onClick={() => setDeleteConfirm(product.id)}>
                      <i className="bi bi-trash3"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredProducts.length === 0 && (
          <div className="empty-state">
            <i className="bi bi-box"></i>
            <p>No products found</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><i className="bi bi-box-seam"></i> {editingProduct ? "Edit Product" : "Add New Product"}</h3>
              <button className="close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Product Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Paracetamol"
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price (₹)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="form-group">
                  <label>Stock Quantity</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={saveProduct}>
                {editingProduct ? "Update" : "Add"} Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Product Details Modal */}
      {viewingProduct && (
        <div className="modal-overlay" onClick={() => setViewingProduct(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><i className="bi bi-info-circle"></i> Product Details</h3>
              <button className="close" onClick={() => setViewingProduct(null)}>&times;</button>
            </div>
            <div className="modal-body view-body">
              <div className="detail-row"><span>Product ID:</span><strong>{viewingProduct.id}</strong></div>
              <div className="detail-row"><span>Name:</span><strong>{viewingProduct.name}</strong></div>
              <div className="detail-row"><span>Category:</span><strong>{viewingProduct.category}</strong></div>
              <div className="detail-row"><span>Price:</span><strong>₹{viewingProduct.price}</strong></div>
              <div className="detail-row"><span>Stock:</span><strong>{viewingProduct.stock}</strong></div>
              <div className="detail-row">
                <span>Status:</span>
                <span className={`badge-stock ${viewingProduct.status === "active" ? "in" : viewingProduct.status === "lowstock" ? "low" : "out"}`}>
                  {viewingProduct.status === "active" ? "Active" : viewingProduct.status === "lowstock" ? "Low Stock" : "Out of Stock"}
                </span>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setViewingProduct(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><i className="bi bi-exclamation-triangle"></i> Confirm Delete</h3>
              <button className="close" onClick={() => setDeleteConfirm(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this product? This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn-danger" onClick={() => deleteProduct(deleteConfirm)}>Delete Product</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
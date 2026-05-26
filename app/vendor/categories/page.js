"use client";

import { useState } from "react";
import "./categories.css"; // optional animations

export default function Categories() {
  const [categories, setCategories] = useState([
    { id: 1, name: "Tablets", status: "active", productCount: 24 },
    { id: 2, name: "Syrups", status: "active", productCount: 12 },
    { id: 3, name: "Injections", status: "inactive", productCount: 5 },
    { id: 4, name: "Capsules", status: "active", productCount: 18 },
    { id: 5, name: "Ointments", status: "inactive", productCount: 7 },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: "", status: "active" });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Filter categories
  const filteredCategories = categories.filter(cat => {
    const matchesSearch = cat.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || cat.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Open add/edit modal
  const openModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ name: category.name, status: category.status });
    } else {
      setEditingCategory(null);
      setFormData({ name: "", status: "active" });
    }
    setShowModal(true);
  };

  // Save category
  const saveCategory = () => {
    if (!formData.name.trim()) return;
    if (editingCategory) {
      setCategories(categories.map(c => c.id === editingCategory.id ? { ...c, ...formData } : c));
    } else {
      const newId = Math.max(0, ...categories.map(c => c.id)) + 1;
      setCategories([...categories, { id: newId, ...formData, productCount: 0 }]);
    }
    setShowModal(false);
  };

  // Delete category
  const deleteCategory = (id) => {
    setCategories(categories.filter(c => c.id !== id));
    setDeleteConfirm(null);
  };

  // Toggle status
  const toggleStatus = (id) => {
    setCategories(categories.map(c => c.id === id ? { ...c, status: c.status === "active" ? "inactive" : "active" } : c));
  };

  return (
    <div className="categories-container">
      {/* Header */}
      <div className="categories-header">
        <div>
          <h1 className="page-title"><i className="bi bi-tags"></i> Categories</h1>
          <p className="page-subtitle">Manage your product categories</p>
        </div>
        <button className="btn-primary-glow" onClick={() => openModal()}>
          <i className="bi bi-plus-circle"></i> Add Category
        </button>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="search-box">
          <i className="bi bi-search"></i>
          <input type="text" placeholder="Search categories..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="filter-group">
          <label><i className="bi bi-funnel"></i> Status:</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Categories Table */}
      <div className="table-wrapper">
        <table className="categories-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Category Name</th>
              <th>Products</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.map(category => (
              <tr key={category.id}>
                <td>{category.id}</td>
                <td><strong>{category.name}</strong></td>
                <td>{category.productCount}</td>
                <td>
                  <button className={`status-toggle ${category.status}`} onClick={() => toggleStatus(category.id)}>
                    {category.status === "active" ? "Active" : "Inactive"}
                  </button>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="action-icon edit" onClick={() => openModal(category)}><i className="bi bi-pencil-square"></i></button>
                    <button className="action-icon delete" onClick={() => setDeleteConfirm(category.id)}><i className="bi bi-trash3"></i></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredCategories.length === 0 && (
          <div className="empty-state">
            <i className="bi bi-folder-x"></i>
            <p>No categories found</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><i className="bi bi-tag"></i> {editingCategory ? "Edit Category" : "New Category"}</h3>
              <button className="close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Category Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g., Tablets" autoFocus />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={saveCategory}>{editingCategory ? "Update" : "Create"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content delete-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><i className="bi bi-exclamation-triangle"></i> Confirm Delete</h3>
              <button className="close" onClick={() => setDeleteConfirm(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this category? Products in this category will be uncategorized.</p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn-danger" onClick={() => deleteCategory(deleteConfirm)}>Delete Category</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
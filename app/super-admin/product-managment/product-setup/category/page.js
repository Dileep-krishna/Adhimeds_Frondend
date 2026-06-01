"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";
import "./categories.css";
import SERVERURL from "../../../../services/serverURL";

export default function CategoriesPage() {
  const [showModal, setShowModal] = useState(false);
  const [showView, setShowView] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    parent: "",
    order: 0,
    metaTitle: "",
    metaDescription: "",
  });

  const [bannerFile, setBannerFile] = useState(null);
  const [iconFile, setIconFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [iconPreview, setIconPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  const BASE_URL = `${SERVERURL}/category`;

  const getImageUrl = (filename) => {
    if (!filename) return null;
    return `${SERVERURL}/imgUploads/${filename}`;
  };

  const getParentName = (cat) => {
    if (!cat.parent) return "No Parent";
    if (typeof cat.parent === "string") {
      const found = categories.find(c => c._id === cat.parent);
      return found ? found.name : "Unknown";
    }
    return cat.parent.name || "No Parent";
  };

  const getParentId = (cat) => {
    if (!cat.parent) return "";
    if (typeof cat.parent === "string") return cat.parent;
    return cat.parent._id || "";
  };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}?limit=100`);
      setCategories(res.data.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    return () => {
      [bannerPreview, iconPreview, coverPreview].forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [bannerPreview, iconPreview, coverPreview]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (setFile, setPreview) => (e) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      if (setPreview) setPreview(URL.createObjectURL(file));
    }
  };

  const handleAdd = async () => {
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("order", Number(formData.order));
      data.append("metaTitle", formData.metaTitle);
      data.append("metaDescription", formData.metaDescription);
      if (formData.parent) data.append("parent", formData.parent);
      if (bannerFile) data.append("banner", bannerFile);
      if (iconFile) data.append("icon", iconFile);
      if (coverFile) data.append("coverImage", coverFile);

      await axios.post(BASE_URL, data);
      fetchCategories();
      setShowModal(false);
      resetModal();
    } catch (err) {
      console.error(err);
      alert("Add failed");
    }
  };

  const handleUpdate = async () => {
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("order", Number(formData.order));
      data.append("metaTitle", formData.metaTitle);
      data.append("metaDescription", formData.metaDescription);
      if (formData.parent) data.append("parent", formData.parent);
      if (bannerFile) data.append("banner", bannerFile);
      if (iconFile) data.append("icon", iconFile);
      if (coverFile) data.append("coverImage", coverFile);

      await axios.put(`${BASE_URL}/${selectedCategory._id}`, data);
      fetchCategories();
      setShowModal(false);
      resetModal();
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category permanently?")) return;
    try {
      await axios.delete(`${BASE_URL}/${id}`);
      fetchCategories();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  const resetModal = () => {
    setFormData({
      name: "",
      parent: "",
      order: 0,
      metaTitle: "",
      metaDescription: "",
    });
    setBannerFile(null);
    setIconFile(null);
    setCoverFile(null);
    [bannerPreview, iconPreview, coverPreview].forEach(url => {
      if (url) URL.revokeObjectURL(url);
    });
    setBannerPreview(null);
    setIconPreview(null);
    setCoverPreview(null);
    setIsEdit(false);
    setSelectedCategory(null);
  };

  const openAddModal = () => {
    resetModal();
    setShowModal(true);
  };

  const openEditModal = (cat) => {
    setIsEdit(true);
    setSelectedCategory(cat);
    setFormData({
      name: cat.name,
      parent: getParentId(cat),
      order: cat.order,
      metaTitle: cat.metaTitle || "",
      metaDescription: cat.metaDescription || "",
    });
    if (cat.banner) setBannerPreview(getImageUrl(cat.banner));
    if (cat.icon) setIconPreview(getImageUrl(cat.icon));
    if (cat.coverImage) setCoverPreview(getImageUrl(cat.coverImage));
    setShowModal(true);
  };

  const openView = (cat) => {
    setSelectedCategory(cat);
    setShowView(true);
  };

  const filteredCategories = categories.filter(cat => {
    if (searchTerm && !cat.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="categories-container">
      <div className="header-actions">
        <h4 className="page-title">📂 Category Management</h4>
        <button className="btn-add" onClick={openAddModal}>+ Add Category</button>
      </div>

      {/* Filter Bar (search only) */}
      <div className="filter-bar">
        <input type="text" className="search-input" placeholder="🔍 Search by name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      {loading ? (
        <div className="loading-spinner">Loading categories...</div>
      ) : (
        <div className="table-responsive">
          <table className="med-table">
            <thead>
              <tr>
                <th>ICON</th>
                <th>NAME</th>
                <th>PARENT CATEGORY</th>
                <th>ORDER LEVEL</th>
                <th>META TITLE</th>
                <th>OPTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map(cat => (
                <tr key={cat._id}>
                  <td>
                    {cat.icon ? (
                      <img src={getImageUrl(cat.icon)} className="rounded-circle" width="40" height="40" style={{ objectFit: "cover" }} alt="icon" />
                    ) : (
                      <div className="bg-secondary bg-opacity-25 rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: "40px", height: "40px" }}>
                        <i className="bi bi-image text-secondary"></i>
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      {cat.icon && <img src={getImageUrl(cat.icon)} width="24" height="24" className="rounded-circle" alt="icon" />}
                      <span className="fw-semibold">{cat.name}</span>
                    </div>
                  </td>
                  <td>{getParentName(cat)}</td>
                  <td>{cat.order}</td>
                  <td>{cat.metaTitle?.substring(0, 30) || "-"}</td>
                  <td className="actions-cell">
                    <button className="btn-view" onClick={() => openView(cat)}>View</button>
                    <button className="btn-icon edit" onClick={() => openEditModal(cat)} title="Edit"><i className="bi bi-pencil"></i></button>
                    <button className="btn-icon delete" onClick={() => handleDelete(cat._id)} title="Delete"><i className="bi bi-trash"></i></button>
                  </td>
                </tr>
              ))}
              {filteredCategories.length === 0 && (
                <tr><td colSpan="6" className="text-center">No categories found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ADD/EDIT MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h5>{isEdit ? "Edit Category" : "Add Category"}</h5>
              <button className="close-modal" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Name *</label>
                <input name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Parent Category</label>
                <select name="parent" value={formData.parent} onChange={handleChange}>
                  <option value="">No Parent</option>
                  {categories.filter(c => !isEdit || c._id !== selectedCategory?._id).map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Ordering Number</label>
                <input type="number" name="order" value={formData.order} onChange={handleChange} />
                <small>Higher number = higher priority</small>
              </div>
              <div className="form-group">
                <label>Banner</label>
                <input type="file" accept="image/*" onChange={handleFileChange(setBannerFile, setBannerPreview)} />
                <small>Recommended size: 150x150px</small>
                {bannerPreview && <img src={bannerPreview} className="preview-img" alt="banner" />}
              </div>
              <div className="form-group">
                <label>Icon</label>
                <input type="file" accept="image/*" onChange={handleFileChange(setIconFile, setIconPreview)} />
                <small>Recommended size: 16x16px</small>
                {iconPreview && <img src={iconPreview} className="preview-icon" alt="icon" />}
              </div>
              <div className="form-group">
                <label>Cover Image</label>
                <input type="file" accept="image/*" onChange={handleFileChange(setCoverFile, setCoverPreview)} />
                <small>Recommended size: 260x260px</small>
                {coverPreview && <img src={coverPreview} className="preview-img" alt="cover" />}
              </div>
              <div className="form-group">
                <label>Meta Title</label>
                <input name="metaTitle" value={formData.metaTitle} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Meta Description</label>
                <textarea name="metaDescription" value={formData.metaDescription} onChange={handleChange} rows="3" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-save" onClick={isEdit ? handleUpdate : handleAdd}>{isEdit ? "Update" : "Save"}</button>
            </div>
          </div>
        </div>
      )}

      {/* ATTRACTIVE SIDE VIEW DRAWER */}
      <AnimatePresence>
        {showView && selectedCategory && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="sidebar-backdrop"
              onClick={() => setShowView(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
              className="view-sidebar"
            >
              <div className="sidebar-header">
                <h4>{selectedCategory.name}</h4>
                <button className="btn-close" onClick={() => setShowView(false)}>✕</button>
              </div>
              <div className="sidebar-body">
                <ul className="list-group">
                  <li className="list-group-item"><strong>Parent Category</strong> <span>{getParentName(selectedCategory)}</span></li>
                  <li className="list-group-item"><strong>Order Priority</strong> <span>{selectedCategory.order}</span></li>
                  <li className="list-group-item"><strong>Meta Title</strong> <span>{selectedCategory.metaTitle || "—"}</span></li>
                  <li className="list-group-item"><strong>Meta Description</strong> <span>{selectedCategory.metaDescription || "—"}</span></li>
                </ul>

                <div className="image-section">
                  <div className="image-card">
                    <div className="image-label">🏞️ Banner Image</div>
                    {selectedCategory.banner ? (
                      <img src={getImageUrl(selectedCategory.banner)} alt="banner" />
                    ) : (
                      <div className="placeholder-icon">No banner uploaded</div>
                    )}
                  </div>
                  <div className="image-card">
                    <div className="image-label">🔘 Icon</div>
                    {selectedCategory.icon ? (
                      <img src={getImageUrl(selectedCategory.icon)} alt="icon" style={{ width: "80px", height: "80px", margin: "0 auto", display: "block" }} />
                    ) : (
                      <div className="placeholder-icon">No icon uploaded</div>
                    )}
                  </div>
                  <div className="image-card">
                    <div className="image-label">📷 Cover Image</div>
                    {selectedCategory.coverImage ? (
                      <img src={getImageUrl(selectedCategory.coverImage)} alt="cover" />
                    ) : (
                      <div className="placeholder-icon">No cover image uploaded</div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
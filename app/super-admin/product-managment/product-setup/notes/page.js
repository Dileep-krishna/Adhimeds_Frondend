'use client';
import React, { useState } from 'react';
import './notes.css';

function NotesPage() {
  const [activeFilter, setActiveFilter] = useState('all'); // all, inhouse, seller
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentNote, setCurrentNote] = useState(null);
  const [notes, setNotes] = useState([
    { id: 1, user: 'In-House', type: 'Shipping', description: 'This is a demo shipping note for Active eCommerce CMS, developed by Active IT Zone Limited, a Premium Item on CodeCanyon.', sellerCanAccess: false },
    { id: 2, user: 'In-House', type: 'Refund', description: 'This is a demo refund note for Active eCommerce CMS, developed by Active IT Zone Limited, a Premium Item on CodeCanyon.', sellerCanAccess: false },
    { id: 3, user: 'In-House', type: 'Warranty', description: 'This is a demo warranty note for Active eCommerce CMS, developed by Active IT Zone Limited, a Premium Item on CodeCanyon.', sellerCanAccess: false },
    { id: 4, user: 'In-House', type: 'Delivery', description: 'This is a demo delivery note for Active eCommerce CMS, developed by Active IT Zone Limited, a Premium Item on CodeCanyon.', sellerCanAccess: false },
  ]);

  const [formData, setFormData] = useState({
    user: 'In-House',
    type: '',
    description: '',
    sellerCanAccess: false,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const noteTypes = ['Shipping', 'Refund', 'Warranty', 'Delivery', 'Medical Advice', 'Prescription', 'Lab Result'];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
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
      user: 'In-House',
      type: '',
      description: '',
      sellerCanAccess: false,
    });
    setImageFile(null);
    setImagePreview(null);
    setIsEditMode(false);
    setCurrentNote(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (note) => {
    setIsEditMode(true);
    setCurrentNote(note);
    setFormData({
      user: note.user,
      type: note.type,
      description: note.description,
      sellerCanAccess: note.sellerCanAccess,
    });
    // If the note had an image stored, you would set preview here
    setImagePreview(null);
    setImageFile(null);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.type || !formData.description) {
      alert('Please fill all required fields (Type and Description)');
      return;
    }
    const newNote = {
      id: isEditMode ? currentNote.id : Date.now(),
      user: formData.user,
      type: formData.type,
      description: formData.description,
      sellerCanAccess: formData.sellerCanAccess,
      // In a real app you would upload the image and store the URL
      image: imagePreview || (currentNote?.image || null),
    };
    if (isEditMode) {
      setNotes(notes.map(n => n.id === currentNote.id ? newNote : n));
    } else {
      setNotes([...notes, newNote]);
    }
    setShowModal(false);
    resetForm();
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this note permanently?')) {
      setNotes(notes.filter(n => n.id !== id));
    }
  };

  const filteredNotes = notes.filter(note => {
    if (activeFilter === 'inhouse') return note.user === 'In-House';
    if (activeFilter === 'seller') return note.user === 'Seller';
    return true;
  });

  return (
    <div className="notes-container">
      {/* Top Bar */}
      <div className="header-actions">
        <h4 className="page-title">All Notes</h4>
        <button className="btn-add" onClick={openAddModal}>
          + Add Note
        </button>
      </div>

      {/* Filter Row */}
      <div className="filter-bar">
        <div className="filter-buttons">
          <button className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}>All</button>
          <button className={`filter-btn ${activeFilter === 'inhouse' ? 'active' : ''}`} onClick={() => setActiveFilter('inhouse')}>In-House</button>
          <button className={`filter-btn ${activeFilter === 'seller' ? 'active' : ''}`} onClick={() => setActiveFilter('seller')}>Seller</button>
        </div>
        <div className="text-muted small">Seller Can Add Note? – This is a global setting (not implemented here)</div>
      </div>

      {/* Notes Table */}
      <div className="table-responsive">
        <table className="med-table">
          <thead>
            <tr>
              <th>#</th>
              <th>User</th>
              <th>Type</th>
              <th>Description</th>
              <th>Seller Can Access?</th>
              <th>Options</th>
            </tr>
          </thead>
          <tbody>
            {filteredNotes.map((note, idx) => (
              <tr key={note.id}>
                <td>{idx + 1}</td>
                <td>{note.user}</td>
                <td>{note.type}</td>
                <td>{note.description}</td>
                <td>
                  <span className={`badge ${note.sellerCanAccess ? 'badge-success' : 'badge-secondary'}`}>
                    {note.sellerCanAccess ? 'Yes' : 'No'}
                  </span>
                </td>
                <td>
                  <button className="btn-icon edit" onClick={() => openEditModal(note)}>
                    <i className="bi bi-pencil"></i>
                  </button>
                  <button className="btn-icon delete" onClick={() => handleDelete(note.id)}>
                    <i className="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
            {filteredNotes.length === 0 && (
              <tr><td colSpan="6" className="text-center">No notes found. Add one!</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal with Image Upload */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5>{isEditMode ? 'Edit Note' : 'Add New Note'}</h5>
              <button className="close-modal" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>User Type</label>
                <select name="user" className="form-control" value={formData.user} onChange={handleInputChange}>
                  <option value="In-House">In-House</option>
                  <option value="Seller">Seller</option>
                </select>
              </div>
              <div className="form-group">
                <label>Note Type *</label>
                <select name="type" className="form-control" value={formData.type} onChange={handleInputChange}>
                  <option value="">Select Type</option>
                  {noteTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea name="description" className="form-control" rows="4" value={formData.description} onChange={handleInputChange}></textarea>
              </div>
              <div className="form-group">
                <label>Attach Image (optional)</label>
                <input type="file" className="form-control" accept="image/*" onChange={handleImageChange} />
                {imagePreview && (
                  <div className="mt-2">
                    <img src={imagePreview} alt="preview" className="image-preview" />
                  </div>
                )}
              </div>
              <div className="form-group">
                <label className="d-flex align-items-center gap-2">
                  <input type="checkbox" name="sellerCanAccess" checked={formData.sellerCanAccess} onChange={handleInputChange} />
                  Seller Can Access This Note
                </label>
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

export default NotesPage;
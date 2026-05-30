'use client';
import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './custom.css';

export default function CustomLabelPage() {
  // Mock data
  const [labels, setLabels] = useState([
    { id: 1, name: 'Top Choice', addedBy: 'In-House', sellerAccess: false },
    { id: 2, name: 'Free Shipping', addedBy: 'In-House', sellerAccess: false },
    { id: 3, name: 'Doctor Recommended', addedBy: 'Seller', sellerAccess: true },
  ]);

  const [filter, setFilter] = useState('all'); // all, inhouse, seller
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentLabel, setCurrentLabel] = useState(null);
  const [labelName, setLabelName] = useState('');
  const [addedBy, setAddedBy] = useState('In-House');
  const [sellerAccess, setSellerAccess] = useState(false);
  const [quickAddValue, setQuickAddValue] = useState('');

  // Filter labels
  const filteredLabels = labels.filter(label => {
    if (filter === 'inhouse') return label.addedBy === 'In-House';
    if (filter === 'seller') return label.addedBy === 'Seller';
    return true;
  });

  // Quick add (Type & Enter)
  const handleQuickAdd = (e) => {
    if (e.key === 'Enter' && quickAddValue.trim()) {
      const newLabel = {
        id: Date.now(),
        name: quickAddValue.trim(),
        addedBy: 'In-House', // default for quick add
        sellerAccess: false,
      };
      setLabels([...labels, newLabel]);
      setQuickAddValue('');
    }
  };

  // Modal handlers
  const openAddModal = () => {
    setIsEdit(false);
    setLabelName('');
    setAddedBy('In-House');
    setSellerAccess(false);
    setShowModal(true);
  };

  const openEditModal = (label) => {
    setIsEdit(true);
    setCurrentLabel(label);
    setLabelName(label.name);
    setAddedBy(label.addedBy);
    setSellerAccess(label.sellerAccess);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEdit(false);
    setCurrentLabel(null);
    setLabelName('');
    setAddedBy('In-House');
    setSellerAccess(false);
  };

  const saveLabel = () => {
    if (!labelName.trim()) {
      alert('Label name is required');
      return;
    }
    if (isEdit) {
      setLabels(labels.map(l => l.id === currentLabel.id ? {
        ...l,
        name: labelName.trim(),
        addedBy,
        sellerAccess,
      } : l));
    } else {
      const newLabel = {
        id: Date.now(),
        name: labelName.trim(),
        addedBy,
        sellerAccess,
      };
      setLabels([...labels, newLabel]);
    }
    closeModal();
  };

  const deleteLabel = (id) => {
    if (window.confirm('Delete this custom label permanently?')) {
      setLabels(labels.filter(l => l.id !== id));
    }
  };

  // Global setting (demo)
  const [globalSetting, setGlobalSetting] = useState('all'); // all, inhouse, seller – for "Sellers Can Create Custom Label?"

  return (
    <div className="custom-label-container">
      {/* Header */}
      <div className="header-actions">
        <h4 className="page-title">Custom Label</h4>
        <button className="btn-add" onClick={openAddModal}>
          <i className="bi bi-plus-circle me-1"></i> Add New Custom Label
        </button>
      </div>

      {/* Global Setting Row */}
      <div className="global-setting mb-4">
        <label className="fw-bold me-3">Sellers Can Create Custom Label?</label>
        <div className="btn-group" role="group">
          <button className={`btn btn-sm ${globalSetting === 'all' ? 'btn-success' : 'btn-outline-success'}`} onClick={() => setGlobalSetting('all')}>All</button>
          <button className={`btn btn-sm ${globalSetting === 'inhouse' ? 'btn-success' : 'btn-outline-success'}`} onClick={() => setGlobalSetting('inhouse')}>In-House</button>
          <button className={`btn btn-sm ${globalSetting === 'seller' ? 'btn-success' : 'btn-outline-success'}`} onClick={() => setGlobalSetting('seller')}>Seller</button>
        </div>
        <small className="text-muted ms-3">(Global setting – demo only)</small>
      </div>

      {/* Filter Row (for table) */}
      <div className="filter-bar mb-3">
        <span className="me-2">Filter by Added By:</span>
        <div className="btn-group" role="group">
          <button className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setFilter('all')}>All</button>
          <button className={`btn btn-sm ${filter === 'inhouse' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setFilter('inhouse')}>In-House</button>
          <button className={`btn btn-sm ${filter === 'seller' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setFilter('seller')}>Seller</button>
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="med-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Label</th>
              <th>Added By</th>
              <th>Seller Can Access?</th>
              <th>Options</th>
            </tr>
          </thead>
          <tbody>
            {filteredLabels.map((label, idx) => (
              <tr key={label.id}>
                <td>{idx + 1}</td>
                <td><strong>{label.name}</strong></td>
                <td>{label.addedBy}</td>
                <td>
                  <span className={`badge ${label.sellerAccess ? 'badge-success' : 'badge-secondary'}`}>
                    {label.sellerAccess ? 'Yes' : 'No'}
                  </span>
                </td>
                <td>
                  <button className="btn-icon edit" onClick={() => openEditModal(label)}>
                    <i className="bi bi-pencil"></i>
                  </button>
                  <button className="btn-icon delete" onClick={() => deleteLabel(label.id)}>
                    <i className="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
            {filteredLabels.length === 0 && (
              <tr><td colSpan="5" className="text-center py-4 text-muted">No custom labels found. Add one!</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Quick Add Input (Type & Enter) */}
      <div className="quick-add mt-4">
        <label className="fw-bold me-2">Add New Custom Label</label>
        <input
          type="text"
          className="quick-input"
          placeholder="Type & Enter"
          value={quickAddValue}
          onChange={(e) => setQuickAddValue(e.target.value)}
          onKeyDown={handleQuickAdd}
        />
      </div>

      <div className="footer-note text-center mt-4">
        <small className="text-muted">© Active eCommerce CMS v11.0.0 (Medical Platform)</small>
      </div>

      {/* Modal for Add/Edit */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5>{isEdit ? 'Edit Custom Label' : 'Add Custom Label'}</h5>
              <button className="close-modal" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Label Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={labelName}
                  onChange={(e) => setLabelName(e.target.value)}
                  placeholder="e.g., Doctor's Choice"
                />
              </div>
              <div className="form-group">
                <label>Added By</label>
                <select className="form-select" value={addedBy} onChange={(e) => setAddedBy(e.target.value)}>
                  <option value="In-House">In-House</option>
                  <option value="Seller">Seller</option>
                </select>
              </div>
              <div className="form-group form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="sellerAccess"
                  checked={sellerAccess}
                  onChange={(e) => setSellerAccess(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="sellerAccess">Seller Can Access This Label</label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={closeModal}>Cancel</button>
              <button className="btn-save" onClick={saveLabel}>{isEdit ? 'Update' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
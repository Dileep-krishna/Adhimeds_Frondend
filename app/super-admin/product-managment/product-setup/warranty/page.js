"use client";

import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./warranty.css";

// Mock initial warranty data (replace with API call later)
const initialWarranties = [
  { id: 1, text: "1 Year", logo: null },
  { id: 2, text: "2 Year", logo: null },
  { id: 3, text: "3 Year", logo: null },
  { id: 4, text: "5 Year", logo: null },
];

export default function WarrantyPage() {
  const [warranties, setWarranties] = useState(initialWarranties);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentWarranty, setCurrentWarranty] = useState(null);
  const [warrantyText, setWarrantyText] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [dimensionError, setDimensionError] = useState("");

  // Reset form
  const resetForm = () => {
    setWarrantyText("");
    setLogoFile(null);
    setLogoPreview(null);
    setDimensionError("");
    setIsEditMode(false);
    setCurrentWarranty(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (warranty) => {
    setIsEditMode(true);
    setCurrentWarranty(warranty);
    setWarrantyText(warranty.text);
    setLogoPreview(warranty.logo || null);
    setLogoFile(null);
    setDimensionError("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  // Validate image dimensions (40x40)
  const validateImageDimensions = (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        if (img.width === 40 && img.height === 40) {
          resolve(true);
        } else {
          reject(`Image must be exactly 40x40px. Current: ${img.width}x${img.height}`);
        }
      };
      img.onerror = () => reject("Invalid image file");
      img.src = url;
    });
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await validateImageDimensions(file);
      setLogoFile(file);
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
      setDimensionError("");
    } catch (err) {
      setDimensionError(err);
      setLogoFile(null);
      setLogoPreview(null);
    }
  };

  // Save warranty (add or update)
  const saveWarranty = () => {
    if (!warrantyText.trim()) {
      alert("Please enter warranty text");
      return;
    }

    let logoBase64 = null;
    if (logoFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newWarranty = {
          id: isEditMode ? currentWarranty.id : Date.now(),
          text: warrantyText.trim(),
          logo: reader.result,
        };
        if (isEditMode) {
          setWarranties(warranties.map(w => w.id === currentWarranty.id ? newWarranty : w));
        } else {
          setWarranties([...warranties, newWarranty]);
        }
        closeModal();
      };
      reader.readAsDataURL(logoFile);
    } else {
      // No new logo uploaded – keep existing logo if editing
      const newWarranty = {
        id: isEditMode ? currentWarranty.id : Date.now(),
        text: warrantyText.trim(),
        logo: isEditMode ? currentWarranty.logo : null,
      };
      if (isEditMode) {
        setWarranties(warranties.map(w => w.id === currentWarranty.id ? newWarranty : w));
      } else {
        setWarranties([...warranties, newWarranty]);
      }
      closeModal();
    }
  };

  // Delete warranty
  const deleteWarranty = (id) => {
    if (window.confirm("Delete this warranty permanently?")) {
      setWarranties(warranties.filter(w => w.id !== id));
    }
  };

  return (
    <div className="warranty-container">
      <div className="header-actions">
        <h4 className="page-title">All Warranties</h4>
        <button className="btn-add" onClick={openAddModal}>
          + Add New Warranty
        </button>
      </div>

      <div className="table-responsive">
        <table className="med-table">
          <thead>
            <tr>
              <th>Warranty Text</th>
              <th>Logo (40x40)</th>
              <th>Options</th>
            </tr>
          </thead>
          <tbody>
            {warranties.map(w => (
              <tr key={w.id}>
                <td><strong>{w.text}</strong></td>
                <td>
                  {w.logo ? (
                    <img src={w.logo} alt="logo" className="warranty-logo" />
                  ) : (
                    <span className="text-muted">No logo</span>
                  )}
                </td>
                <td>
                  <button className="btn-icon edit" onClick={() => openEditModal(w)}>
                    <i className="bi bi-pencil"></i>
                  </button>
                  <button className="btn-icon delete" onClick={() => deleteWarranty(w.id)}>
                    <i className="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
            {warranties.length === 0 && (
              <tr><td colSpan="3" className="text-center">No warranties added yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5>{isEditMode ? "Edit Warranty" : "Add New Warranty"}</h5>
              <button className="close-modal" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Warranty Text</label>
                <input
                  type="text"
                  className="form-control"
                  value={warrantyText}
                  onChange={(e) => setWarrantyText(e.target.value)}
                  placeholder="e.g., 1 Year, Lifetime"
                />
              </div>
              <div className="form-group">
                <label>Logo (40x40px)</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={handleLogoChange}
                />
                <small className="text-muted">Minimum dimensions required: 40px width X 40px height.</small>
                {dimensionError && <div className="text-danger small mt-1">{dimensionError}</div>}
                {logoPreview && (
                  <div className="mt-2">
                    <img src={logoPreview} alt="preview" className="logo-preview" />
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={closeModal}>Cancel</button>
              <button className="btn-save" onClick={saveWarranty}>
                {isEditMode ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
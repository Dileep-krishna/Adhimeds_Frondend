"use client";

import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./attribute.css";

// Initial medical attributes data
const initialMedicalAttributes = [
  { name: "Dosage Form", values: ["Tablet", "Capsule", "Liquid", "Injection", "Cream", "Ointment", "Syrup", "Inhaler"] },
  { name: "Strength", values: ["100mg", "250mg", "500mg", "750mg", "1g", "10mg/ml", "20mg/ml"] },
  { name: "Pack Size", values: ["10 tablets", "20 tablets", "50 tablets", "100 tablets", "30 ml", "100 ml", "200 ml"] },
  { name: "Active Ingredient", values: ["Paracetamol", "Ibuprofen", "Amoxicillin", "Cetirizine", "Omeprazole", "Atorvastatin", "Metformin"] },
  { name: "Prescription Required", values: ["Yes", "No"] },
  { name: "Storage Condition", values: ["Room Temperature", "Refrigerated (2-8°C)", "Protect from Light", "Dry Place"] },
  { name: "Shelf Life (Months)", values: ["12", "18", "24", "36", "48"] },
  { name: "Route of Administration", values: ["Oral", "Topical", "Intravenous", "Intramuscular", "Subcutaneous", "Inhalation"] },
  { name: "Category (Therapeutic Class)", values: ["Analgesic", "Antibiotic", "Antihistamine", "Antacid", "Antihypertensive", "Antidiabetic", "Antiviral"] },
  { name: "Unit", values: ["Tablet", "Capsule", "ml", "mg", "g", "Patch", "Spray"] },
  { name: "Flavour (for syrups)", values: ["Strawberry", "Orange", "Grape", "Mint", "Unflavoured", "Cherry"] },
  { name: "Manufacturer", values: ["Cipla", "Sun Pharma", "Pfizer", "Novartis", "GlaxoSmithKline", "Abbott", "Dr. Reddy's"] },
];

export default function AttributesPage() {
  const [attributes, setAttributes] = useState(initialMedicalAttributes);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [attributeName, setAttributeName] = useState("");
  const [attributeValues, setAttributeValues] = useState([""]);

  // Open modal for adding new attribute
  const openAddModal = () => {
    setIsEditMode(false);
    setAttributeName("");
    setAttributeValues([""]);
    setShowModal(true);
  };

  // Open modal for editing existing attribute
  const openEditModal = (index) => {
    const attr = attributes[index];
    setIsEditMode(true);
    setEditIndex(index);
    setAttributeName(attr.name);
    setAttributeValues([...attr.values]);
    setShowModal(true);
  };

  // Close modal and reset form
  const closeModal = () => {
    setShowModal(false);
    setAttributeName("");
    setAttributeValues([""]);
    setIsEditMode(false);
    setEditIndex(null);
  };

  // Handle attribute name change
  const handleNameChange = (e) => {
    setAttributeName(e.target.value);
  };

  // Handle value input change
  const handleValueChange = (idx, newValue) => {
    const updated = [...attributeValues];
    updated[idx] = newValue;
    setAttributeValues(updated);
  };

  // Add a new empty value field
  const addMoreValue = () => {
    setAttributeValues([...attributeValues, ""]);
  };

  // Remove a value field at given index
  const removeValue = (idx) => {
    const updated = attributeValues.filter((_, i) => i !== idx);
    setAttributeValues(updated);
  };

  // Save attribute (create or update)
  const saveAttribute = () => {
    if (!attributeName.trim()) {
      alert("Attribute name is required");
      return;
    }
    const filteredValues = attributeValues.filter(v => v.trim() !== "");
    if (filteredValues.length === 0) {
      alert("At least one attribute value is required");
      return;
    }

    const newAttribute = {
      name: attributeName.trim(),
      values: filteredValues,
    };

    if (isEditMode) {
      // Update existing attribute
      const updatedAttributes = [...attributes];
      updatedAttributes[editIndex] = newAttribute;
      setAttributes(updatedAttributes);
    } else {
      // Add new attribute
      setAttributes([...attributes, newAttribute]);
    }
    closeModal();
  };

  // Delete attribute
  const deleteAttribute = (index) => {
    if (window.confirm(`Delete attribute "${attributes[index].name}" permanently?`)) {
      const updated = attributes.filter((_, i) => i !== index);
      setAttributes(updated);
    }
  };

  return (
    <div className="attributes-container">
      <div className="header-actions">
        <h4 className="page-title">Medical Attributes</h4>
        <button className="btn-add" onClick={openAddModal}>
          + Add New Attribute
        </button>
      </div>

      <div className="table-responsive">
        <table className="med-table">
          <thead>
            <tr>
              <th>Attribute Name</th>
              <th>Possible Values</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {attributes.map((attr, idx) => (
              <tr key={idx}>
                <td><strong>{attr.name}</strong></td>
                <td>
                  <div className="value-chips">
                    {attr.values.map((val, i) => (
                      <span key={i} className="value-chip">{val}</span>
                    ))}
                  </div>
                </td>
                <td>
                  <button className="btn-icon edit" onClick={() => openEditModal(idx)}>
                    <i className="bi bi-pencil"></i>
                  </button>
                  <button className="btn-icon delete" onClick={() => deleteAttribute(idx)}>
                    <i className="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for Add / Edit */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5>{isEditMode ? "Edit Attribute" : "Attribute Information"}</h5>
              <button className="close-modal" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Attribute Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={attributeName}
                  onChange={handleNameChange}
                  placeholder="e.g., Dosage Form"
                />
              </div>
              <div className="form-group">
                <label>Attribute Values</label>
                {attributeValues.map((val, idx) => (
                  <div key={idx} className="value-input-group">
                    <input
                      type="text"
                      className="form-control"
                      value={val}
                      onChange={(e) => handleValueChange(idx, e.target.value)}
                      placeholder="Enter Attribute Value"
                    />
                    {attributeValues.length > 1 && (
                      <button
                        type="button"
                        className="btn-remove-value"
                        onClick={() => removeValue(idx)}
                      >
                        <i className="bi bi-x-circle"></i>
                      </button>
                    )}
                  </div>
                ))}
                <button className="btn-add-more" onClick={addMoreValue}>
                  + Add More
                </button>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={closeModal}>Cancel</button>
              <button className="btn-save" onClick={saveAttribute}>
                {isEditMode ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
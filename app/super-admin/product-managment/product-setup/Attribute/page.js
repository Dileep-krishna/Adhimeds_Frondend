"use client";

import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./attribute.css";
import { createAttributeAPI, deleteAttributeAPI, getAttributesAPI, updateAttributeAPI } from "../../../../services/attributeAPI";
// adjust path as needed

export default function AttributesPage() {
  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [attributeName, setAttributeName] = useState("");
  const [attributeValues, setAttributeValues] = useState([""]);

  // Fetch attributes from API
  const fetchAttributes = async () => {
    setLoading(true);
    try {
      const response = await getAttributesAPI();
      if (response.success) {
        setAttributes(response.data);
        setError(null);
      } else {
        setError("Failed to load attributes");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttributes();
  }, []);

  // Open modal for adding
  const openAddModal = () => {
    setIsEditMode(false);
    setEditId(null);
    setAttributeName("");
    setAttributeValues([""]);
    setShowModal(true);
  };

  // Open modal for editing
  const openEditModal = (attribute) => {
    setIsEditMode(true);
    setEditId(attribute._id);
    setAttributeName(attribute.name);
    setAttributeValues([...attribute.values]);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setAttributeName("");
    setAttributeValues([""]);
    setIsEditMode(false);
    setEditId(null);
  };

  const handleNameChange = (e) => setAttributeName(e.target.value);
  const handleValueChange = (idx, newValue) => {
    const updated = [...attributeValues];
    updated[idx] = newValue;
    setAttributeValues(updated);
  };
  const addMoreValue = () => setAttributeValues([...attributeValues, ""]);
  const removeValue = (idx) => {
    const updated = attributeValues.filter((_, i) => i !== idx);
    setAttributeValues(updated);
  };

  // Save attribute (create or update)
  const saveAttribute = async () => {
    if (!attributeName.trim()) {
      alert("Attribute name is required");
      return;
    }
    const filteredValues = attributeValues.filter(v => v.trim() !== "");
    if (filteredValues.length === 0) {
      alert("At least one attribute value is required");
      return;
    }

    const payload = {
      name: attributeName.trim(),
      values: filteredValues,
    };

    try {
      let response;
      if (isEditMode) {
        response = await updateAttributeAPI(editId, payload);
      } else {
        response = await createAttributeAPI(payload);
      }

      if (response.success) {
        fetchAttributes(); // refresh list
        closeModal();
      } else {
        alert(response.message || "Operation failed");
      }
    } catch (err) {
      console.error(err);
      alert("Server error. Please try again.");
    }
  };

  // Delete attribute
  const deleteAttribute = async (id, name) => {
    if (window.confirm(`Delete attribute "${name}" permanently?`)) {
      try {
        const response = await deleteAttributeAPI(id);
        if (response.success) {
          fetchAttributes();
        } else {
          alert(response.message || "Delete failed");
        }
      } catch (err) {
        console.error(err);
        alert("Server error. Could not delete.");
      }
    }
  };

  if (loading) {
    return (
      <div className="attributes-container text-center py-5">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading attributes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="attributes-container text-center py-5">
        <div className="alert alert-danger">{error}</div>
        <button className="btn btn-primary" onClick={fetchAttributes}>Retry</button>
      </div>
    );
  }

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
            {attributes.map((attr) => (
              <tr key={attr._id}>
                <td><strong>{attr.name}</strong></td>
                <td>
                  <div className="value-chips">
                    {attr.values.map((val, i) => (
                      <span key={i} className="value-chip">{val}</span>
                    ))}
                  </div>
                </td>
                <td>
                  <button className="btn-icon edit" onClick={() => openEditModal(attr)}>
                    <i className="bi bi-pencil"></i>
                  </button>
                  <button className="btn-icon delete" onClick={() => deleteAttribute(attr._id, attr.name)}>
                    <i className="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal (unchanged UI, only uses backend IDs now) */}
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
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";

import "./warranty.css";
import { createWarrantyAPI, deleteWarrantyAPI, getWarrantiesAPI, updateWarrantyAPI } from "../../../../services/warrentyAPI";
import SERVERURL from "../../../../services/serverURL";

export default function WarrantyPage() {
  const [warranties, setWarranties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentWarranty, setCurrentWarranty] = useState(null);
  const [warrantyText, setWarrantyText] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const previewUrlRef = useRef(null);

  const getLogoUrl = (logo) => {
    if (!logo) return null;
    if (logo.startsWith("data:")) return logo;
    if (logo.startsWith("http")) return logo;
    return `${SERVERURL}/${logo}`;
  };

  const fetchWarranties = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getWarrantiesAPI();
      if (response.success) {
        setWarranties(response.data);
      } else {
        toast.error(response.message || "Failed to load warranties");
      }
    } catch (err) {
      console.error("Fetch warranties error:", err);
      toast.error("Network error while fetching warranties");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWarranties();
  }, [fetchWarranties]);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  const resetForm = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setWarrantyText("");
    setLogoFile(null);
    setLogoPreview(null);
    setIsEditMode(false);
    setCurrentWarranty(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (warranty) => {
    resetForm();
    setIsEditMode(true);
    setCurrentWarranty(warranty);
    setWarrantyText(warranty.text);
    const logoUrl = getLogoUrl(warranty.logo);
    setLogoPreview(logoUrl);
    setLogoFile(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  // ✅ No dimension validation – accept any image size
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Revoke previous preview URL if any
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }

    setLogoFile(file);
    const previewUrl = URL.createObjectURL(file);
    previewUrlRef.current = previewUrl;
    setLogoPreview(previewUrl);
  };

  const saveWarranty = async () => {
    if (!warrantyText.trim()) {
      toast.warn("Please enter warranty text");
      return;
    }

    setIsSaving(true);
    try {
      let response;
      const payloadText = warrantyText.trim();

      if (isEditMode) {
        if (logoFile) {
          const formData = new FormData();
          formData.append("text", payloadText);
          formData.append("logo", logoFile);
          response = await updateWarrantyAPI(currentWarranty._id, formData);
        } else {
          response = await updateWarrantyAPI(currentWarranty._id, { text: payloadText });
        }
      } else {
        if (logoFile) {
          const formData = new FormData();
          formData.append("text", payloadText);
          formData.append("logo", logoFile);
          response = await createWarrantyAPI(formData);
        } else {
          response = await createWarrantyAPI({ text: payloadText, logo: null });
        }
      }

      if (response.success) {
        toast.success(isEditMode ? "Warranty updated" : "Warranty created");
        await fetchWarranties();
        closeModal();
      } else {
        toast.error(response.message || "Operation failed");
      }
    } catch (err) {
      console.error("Save warranty error:", err);
      toast.error("Something went wrong while saving");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteWarranty = async (id) => {
    if (!window.confirm("Delete this warranty permanently?")) return;
    try {
      const response = await deleteWarrantyAPI(id);
      if (response.success) {
        toast.success("Warranty deleted");
        fetchWarranties();
      } else {
        toast.error(response.message || "Delete failed");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Network error while deleting");
    }
  };

  return (
    <div className="warranty-container">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="header-actions">
        <h4 className="page-title">All Warranties</h4>
        <button className="btn-add" onClick={openAddModal}>
          + Add New Warranty
        </button>
      </div>

      <div className="table-responsive">
        {loading ? (
          <div className="text-center py-4">Loading warranties...</div>
        ) : (
          <table className="med-table">
            <thead>
              <tr>
                <th>Warranty Text</th>
                <th>Logo</th>
                <th>Options</th>
              </tr>
            </thead>
            <tbody>
              {warranties.map((w) => (
                <tr key={w._id}>
                  <td><strong>{w.text}</strong></td>
                  <td>
                    {w.logo ? (
                      <img
                        src={getLogoUrl(w.logo)}
                        alt="logo"
                        className="warranty-logo"
                        onError={(e) => {
                          console.error(`Failed to load logo: ${getLogoUrl(w.logo)}`);
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      <span className="text-muted">No logo</span>
                    )}
                  </td>
                  <td>
                    <button className="btn-icon edit" onClick={() => openEditModal(w)}>
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button className="btn-icon delete" onClick={() => deleteWarranty(w._id)}>
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
              {warranties.length === 0 && !loading && (
                <tr><td colSpan="3" className="text-center">No warranties added yet.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

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
                <label>Logo (any size)</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={handleLogoChange}
                />
                <small className="text-muted">Upload an image (any dimensions).</small>
                {logoPreview && (
                  <div className="mt-2">
                    <img src={logoPreview} alt="preview" className="logo-preview" />
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={closeModal}>Cancel</button>
              <button className="btn-save" onClick={saveWarranty} disabled={isSaving}>
                {isSaving ? "Saving..." : (isEditMode ? "Update" : "Save")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
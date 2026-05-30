'use client';
import React, { useState } from 'react';
import './sizechart.css';

function MedicalSizeChart() {
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedChart, setSelectedChart] = useState(null);

  const [charts, setCharts] = useState([
    {
      id: 1,
      name: "Blood Pressure Cuff Sizing",
      category: "Equipment",
      description: "Cuff sizes for accurate BP measurement.",
      measurementType: "cm",
      measurementPoints: ["Arm Circumference"],
      sizeOptions: ["Small (22-26 cm)", "Medium (27-34 cm)", "Large (35-44 cm)"],
      dosageRange: "",
      images: [],
    },
    {
      id: 2,
      name: "Pediatric Paracetamol Dosage",
      category: "Medicine",
      description: "Weight-based dosage for syrup.",
      measurementType: "kg",
      measurementPoints: ["Weight"],
      sizeOptions: ["5-10 kg", "11-20 kg", "21-30 kg"],
      dosageRange: "2.5 ml, 5 ml, 7.5 ml",
      images: [],
    },
  ]);

  const [formData, setFormData] = useState({
    chartName: '',
    category: '',
    medicalCondition: '',
    measurementType: 'cm',
    sizeOptions: [],
    measurementPoints: [],
    dosageRange: '',
    sizeDescription: '',
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const categories = ['Medicine', 'Equipment', 'Dosage Chart', 'Supplements', 'Ayurveda'];
  const measurementPointsList = ['Arm Circumference', 'Chest', 'Waist', 'Hip', 'Height', 'Weight', 'Head Circumference'];
  const sizeOptionsList = ['Small', 'Medium', 'Large', 'X-Large', 'Extra Large', 'Pediatric', 'Adult'];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      if (name === 'measurementPoints') {
        let updated = [...formData.measurementPoints];
        if (checked) updated.push(value);
        else updated = updated.filter(v => v !== value);
        setFormData({ ...formData, measurementPoints: updated });
      } else if (name === 'sizeOptions') {
        let updated = [...formData.sizeOptions];
        if (checked) updated.push(value);
        else updated = updated.filter(v => v !== value);
        setFormData({ ...formData, sizeOptions: updated });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleSave = () => {
    if (!formData.chartName) {
      alert('Chart Name is required');
      return;
    }
    const newChart = {
      id: charts.length + 1,
      name: formData.chartName,
      category: formData.category,
      description: formData.sizeDescription,
      measurementType: formData.measurementType,
      measurementPoints: formData.measurementPoints,
      sizeOptions: formData.sizeOptions,
      dosageRange: formData.dosageRange,
      medicalCondition: formData.medicalCondition,
      images: imagePreviews,
    };
    setCharts([...charts, newChart]);
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      chartName: '',
      category: '',
      medicalCondition: '',
      measurementType: 'cm',
      sizeOptions: [],
      measurementPoints: [],
      dosageRange: '',
      sizeDescription: '',
    });
    setImageFiles([]);
    setImagePreviews([]);
  };

  const handleShow = (chart) => {
    setSelectedChart(chart);
    setShowViewModal(true);
  };

  const deleteChart = (id) => {
    if (window.confirm('Delete this size chart?')) {
      setCharts(charts.filter(c => c.id !== id));
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold">Medical Size & Dosage Charts</h5>
        <button className="btn btn-purple" onClick={() => setShowModal(true)}>
          Add New Chart
        </button>
      </div>

      <div className="card shadow-sm p-3">
        <h6 className="mb-3">All Medical Charts</h6>
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>#</th>
                <th>Chart Name</th>
                <th>Category</th>
                <th>Details</th>
                <th className="text-center">Options</th>
              </tr>
            </thead>
            <tbody>
              {charts.map((chart, index) => (
                <tr key={chart.id}>
                  <td>{index + 1}</td>
                  <td>{chart.name}</td>
                  <td>{chart.category}</td>
                  <td>
                    <button className="btn btn-sm btn-purple" onClick={() => handleShow(chart)}>
                      Show
                    </button>
                  </td>
                  <td className="text-center">
                    <button className="btn btn-icon edit me-2">✏️</button>
                    <button className="btn btn-icon delete" onClick={() => deleteChart(chart.id)}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Medical Chart Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-container modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5>Add New Medical Chart</h5>
              <button className="close-modal" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Chart Name *</label>
                    <input type="text" name="chartName" className="form-control" value={formData.chartName} onChange={handleInputChange} />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Category *</label>
                    <select name="category" className="form-control" value={formData.category} onChange={handleInputChange}>
                      <option value="">Select Category</option>
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                </div>
                <div className="col-md-12">
                  <div className="form-group">
                    <label>Medical Condition / Usage</label>
                    <input type="text" name="medicalCondition" className="form-control" value={formData.medicalCondition} onChange={handleInputChange} placeholder="e.g., Hypertension, Pediatric Fever" />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Images (Size Guide / Dosage Infographic)</label>
                <input type="file" className="form-control" accept="image/*" multiple onChange={handleImageChange} />
                <small className="text-muted">These images will be shown in the product size/dosage guide.</small>
                <div className="image-previews mt-2">
                  {imagePreviews.map((src, idx) => (
                    <img key={idx} src={src} alt="preview" className="img-thumbnail me-2" style={{ width: '60px', height: '60px', objectFit: 'cover' }} />
                  ))}
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Measurement Type</label>
                    <div>
                      <label className="me-3">
                        <input type="radio" name="measurementType" value="cm" checked={formData.measurementType === 'cm'} onChange={handleInputChange} /> cm
                      </label>
                      <label>
                        <input type="radio" name="measurementType" value="inches" checked={formData.measurementType === 'inches'} onChange={handleInputChange} /> inches
                      </label>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Dosage / Value Range (if applicable)</label>
                    <input type="text" name="dosageRange" className="form-control" value={formData.dosageRange} onChange={handleInputChange} placeholder="e.g., 2.5 ml, 5 ml, 10 ml" />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Measurement Points (for equipment sizing)</label>
                <div className="checkbox-group">
                  {measurementPointsList.map(point => (
                    <label key={point} className="me-3">
                      <input type="checkbox" name="measurementPoints" value={point} onChange={handleInputChange} /> {point}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Size Options (e.g., Small, Medium, Large)</label>
                <div className="checkbox-group">
                  {sizeOptionsList.map(option => (
                    <label key={option} className="me-3">
                      <input type="checkbox" name="sizeOptions" value={option} onChange={handleInputChange} /> {option}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Size / Dosage Description</label>
                <textarea name="sizeDescription" className="form-control" rows="3" value={formData.sizeDescription} onChange={handleInputChange} placeholder="Additional instructions or conversion notes..."></textarea>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-save" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedChart && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5>{selectedChart.name}</h5>
              <button className="close-modal" onClick={() => setShowViewModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p><strong>Category:</strong> {selectedChart.category}</p>
              <p><strong>Condition/Usage:</strong> {selectedChart.medicalCondition || '—'}</p>
              <p><strong>Measurement Type:</strong> {selectedChart.measurementType}</p>
              <p><strong>Measurement Points:</strong> {selectedChart.measurementPoints?.join(', ') || '—'}</p>
              <p><strong>Size Options:</strong> {selectedChart.sizeOptions?.join(', ') || '—'}</p>
              <p><strong>Dosage Range:</strong> {selectedChart.dosageRange || '—'}</p>
              <p><strong>Description:</strong> {selectedChart.description || '—'}</p>
              {selectedChart.images && selectedChart.images.length > 0 && (
                <div>
                  <strong>Images:</strong>
                  <div className="mt-2">
                    {selectedChart.images.map((img, idx) => (
                      <img key={idx} src={img} alt="chart" className="img-thumbnail me-2" style={{ width: '100px' }} />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowViewModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MedicalSizeChart;
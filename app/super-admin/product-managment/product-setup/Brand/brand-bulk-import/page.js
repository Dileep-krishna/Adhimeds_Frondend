'use client';
import React, { useState } from 'react';
import './brand-bulk-import.css';

function BulkImport() {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = () => {
    if (!file) {
      alert('Please select a CSV file first.');
      return;
    }
    console.log('Uploading file:', file);
    // TODO: implement actual upload API call
    alert(`Uploading ${file.name} ...`);
  };

  const downloadSkeleton = () => {
    // Create CSV content (example headers)
    const headers = ['name', 'slug', 'logo', 'meta_title', 'meta_description'];
    const csvContent = headers.join(',') + '\n';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'brand_skeleton.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadExample = () => {
    // Example data rows
    const headers = ['name', 'slug', 'logo', 'meta_title', 'meta_description'];
    const exampleRows = [
      ['Nike', 'nike', 'nike-logo.png', 'Nike Official Brand', 'Best sports brand'],
      ['Adidas', 'adidas', 'adidas-logo.png', 'Adidas Originals', 'German sportswear'],
    ];
    const csvContent = [
      headers.join(','),
      ...exampleRows.map(row => row.join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'brand_example.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mt-4">
      {/* Page Title */}
      <div className="page-header">
        <h4>Brand Bulk Upload</h4>
        <p className="text-muted">Upload brands in bulk using CSV file</p>
      </div>

      <div className="card main-card">
        {/* Step 1 Instructions */}
        <div className="steps-section">
          <h6><strong>Step 1:</strong></h6>
          <ol>
            <li>Download the skeleton file and fill it with proper data.</li>
            <li>You can download the example file to understand how the data must be filled.</li>
            <li>Once you have downloaded and filled the skeleton file, upload it in the form below and submit.</li>
          </ol>
        </div>

        {/* Download Buttons */}
        <div className="download-buttons">
          <button className="btn btn-outline-primary me-3" onClick={downloadSkeleton}>
            <i className="bi bi-download"></i> Download CSV
          </button>
          <button className="btn btn-outline-secondary" onClick={downloadExample}>
            <i className="bi bi-file-earmark-text"></i> Download Example
          </button>
        </div>

        <hr />

        {/* Upload Section */}
        <div className="upload-section">
          <h6>Upload Brand File</h6>
          <div className="file-upload-box">
            <input
              type="file"
              id="brandFile"
              accept=".csv, .xlsx"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <label htmlFor="brandFile" className="file-label">
              <i className="bi bi-cloud-upload"></i> Choose File
            </label>
            {file && <span className="ms-3 text-success">{file.name}</span>}
            <p className="text-muted mt-2 small">Supported formats: .csv, .xlsx</p>
          </div>
          <button className="btn btn-primary mt-3" onClick={handleSubmit}>
            Upload CSV
          </button>
        </div>

        <div className="footer-note text-center mt-4">
          <small className="text-muted">© Active eCommerce CMS v11.0.0</small>
        </div>
      </div>
    </div>
  );
}

export default BulkImport;
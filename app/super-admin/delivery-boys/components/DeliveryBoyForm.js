'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const keralaDistricts = [
  'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha',
  'Kottayam', 'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad',
  'Malappuram', 'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod',
];

export default function DeliveryBoyForm({ title, initialData = {}, onSubmit, isSubmitting, submitLabel }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    email: initialData.email || '',
    phone: initialData.phone || '',
    password: '',
    aadharNumber: initialData.aadharNumber || '',
    aadharImage: null,
    licenseNumber: initialData.licenseNumber || '',
    licenseImage: null,
    bikeNumber: initialData.bikeNumber || '',
    district: initialData.district || 'Thiruvananthapuram',
    status: initialData.status || 'active',
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert('Please fill in Name and Phone Number');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="container-fluid p-0 bg-light min-vh-100">
      <div className="container py-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="h3 mb-0">
            <i className="bi bi-person-badge text-success me-2"></i>
            {title}
          </h2>
          <button className="btn btn-outline-secondary" onClick={() => router.back()}>
            <i className="bi bi-arrow-left me-1"></i> Back
          </button>
        </div>

        {/* Form Card */}
        <div className="card shadow-sm border-0">
          <div className="card-body p-4">
            <form onSubmit={handleSubmit}>
              {/* Two‑column grid starts here */}
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Full Name <span className="text-danger">*</span></label>
                  <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Rajesh Kumar" required />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Email</label>
                  <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} placeholder="example@gmail.com" />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Phone Number <span className="text-danger">*</span></label>
                  <input type="tel" className="form-control" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 98765 43210" required />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Password {!initialData.name && <span className="text-danger">*</span>}
                  </label>
                  <input type="password" className="form-control" name="password" value={formData.password} onChange={handleChange} placeholder={initialData.name ? 'Leave blank to keep unchanged' : 'Enter password'} />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Aadhar Number</label>
                  <input type="text" className="form-control" name="aadharNumber" value={formData.aadharNumber} onChange={handleChange} placeholder="1234 1234 1234" />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Aadhar Image</label>
                  <input type="file" className="form-control" name="aadharImage" onChange={handleChange} accept="image/*" />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">License Number</label>
                  <input type="text" className="form-control" name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} placeholder="KL123456" />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">License Image</label>
                  <input type="file" className="form-control" name="licenseImage" onChange={handleChange} accept="image/*" />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Bike Number</label>
                  <input type="text" className="form-control" name="bikeNumber" value={formData.bikeNumber} onChange={handleChange} placeholder="KL07AB1234" />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">District</label>
                  <select className="form-select" name="district" value={formData.district} onChange={handleChange}>
                    {keralaDistricts.map((d) => <option key={d}>{d}</option>)}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Status</label>
                  <select className="form-select" name="status" value={formData.status} onChange={handleChange}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
              </div> {/* end row */}

              {/* Buttons */}
              <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                <button type="button" className="btn btn-secondary" onClick={() => router.back()}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-success" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                      Saving...
                    </>
                  ) : (
                    submitLabel
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
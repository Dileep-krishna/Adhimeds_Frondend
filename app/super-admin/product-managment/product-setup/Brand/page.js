'use client';
import React, { useState } from 'react';
import './brand.css';
import { useRouter } from 'next/navigation';
;
function Page() {

    const router = useRouter()
    const [showModal, setShowModal] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [editIndex, setEditIndex] = useState(null);

    const [brands, setBrands] = useState([
        { name: "Sun Pharma", products: 5, date: "14 Dec, 2025", category: "Medicine" },
        { name: "Cipla", products: 0, date: "13 Dec, 2025", category: "Respiratory" },
    ]);

    const [formData, setFormData] = useState({
        name: '',
        logo: null,
        category: '',
        metaTitle: '',
        metaDescription: '',
        metaKeywords: '',
    });

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setFormData({
            ...formData,
            [name]: files ? files[0] : value,
        });
    };

    // ✅ ADD / UPDATE
    const handleSubmit = () => {
        if (editIndex !== null) {
            const updated = [...brands];
            updated[editIndex].name = formData.name;
            setBrands(updated);
            setEditIndex(null);
        } else {
            const newBrand = {
                name: formData.name,
                products: 0,
                date: new Date().toLocaleDateString(),
                category: formData.category || "General",
            };
            setBrands([...brands, newBrand]);
        }

        setFormData({
            name: '',
            logo: null,
            metaTitle: '',
            metaDescription: '',
            metaKeywords: '',
        });

        setShowModal(false);
    };

    // ✅ DELETE
    const handleDelete = (index) => {
        const filtered = brands.filter((_, i) => i !== index);
        setBrands(filtered);
    };

    // ✅ EDIT
    const handleEdit = (index) => {
        setFormData({
            ...formData,
            name: brands[index].name,
        });
        setEditIndex(index);
        setShowModal(true);
    };

    // ✅ FILTER UNUSED
    const filteredBrands =
        activeTab === 'unused'
            ? brands.filter((b) => b.products === 0)
            : brands;

    return (
        <div className="container mt-4">

            {/* Header */}
            <div className="d-flex justify-content-between mb-3">
                <h5>Medical Brands</h5>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    + Add Brand
                </button>
            </div>

            {/* Tabs */}
            <div className="mb-3">
                <button
                    className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveTab('all')}
                >
                    All Brands
                </button>

                <button
                    className={`tab-btn ms-2 ${activeTab === 'unused' ? 'active' : ''}`}
                    onClick={() => setActiveTab('unused')}
                >
                    Unused Brands
                </button>
                <button
                    className="tab-btn ms-2"
                    onClick={() => router.push('/super-admin/product-managment/product-setup/Brand/brand-bulk-import')}
                >
                    Bulk Import Brands
                </button>
            </div>

            {/* Table */}
            <div className="card p-3 shadow-sm">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Products</th>
                            <th>Date</th>
                            <th>Category</th>
                            <th className="text-center">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredBrands.map((brand, index) => (
                            <tr key={index}>
                                <td>{brand.name}</td>
                                <td>{brand.products}</td>
                                <td>{brand.date}</td>
                                <td>{brand.category}</td>

                                <td className="text-center">
                                    <button
                                        className="btn btn-sm btn-warning me-1"
                                        onClick={() => handleEdit(index)}
                                    >
                                        Edit
                                    </button>

                                    <button
                                        className="btn btn-sm btn-danger me-1"
                                        onClick={() => handleDelete(index)}
                                    >
                                        Delete
                                    </button>

                                    <button className="btn btn-sm btn-info">
                                        View Products
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal show d-block modal-bg">
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">

                            <div className="modal-header">
                                <h5>{editIndex !== null ? "Edit Brand" : "Add Brand"}</h5>
                                <button className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>

                            <div className="modal-body">
                                <div className="mb-3">
                                    <label>Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label>Logo</label>
                                    <input
                                        type="file"
                                        className="form-control"
                                        name="logo"
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label>Category</label>
                                    <select
                                        className="form-control"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Category</option>
                                        <option value="Medicine">Medicine</option>
                                        <option value="Healthcare">Healthcare</option>
                                        <option value="Equipment">Equipment</option>
                                        <option value="Supplements">Supplements</option>
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label>Meta Title</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="metaTitle"
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label>Meta Description</label>
                                    <textarea
                                        className="form-control"
                                        name="metaDescription"
                                        onChange={handleChange}
                                    ></textarea>
                                </div>

                                <div className="mb-3">
                                    <label>Meta Keywords</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="metaKeywords"
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button className="btn btn-primary" onClick={handleSubmit}>
                                    Save
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default Page;
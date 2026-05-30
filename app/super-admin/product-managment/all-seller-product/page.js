'use client';
import React, { useState } from 'react';
import './seller-product.css';

function ProductsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [filterSeller, setFilterSeller] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortBy, setSortBy] = useState('');

  // Sample medical products
  const [products, setProducts] = useState([
    { id: 1, name: "Paracetamol Tablets", brand: "Cipla", category: "Medicine", price: 50, rating: 4, stock: 20, published: true, featured: false, todayDeal: false, seller: "Cipla Ltd", type: "physical", image: "https://via.placeholder.com/50" },
    { id: 2, name: "Vitamin D Capsules", brand: "Sun Pharma", category: "Supplements", price: 120, rating: 5, stock: 10, published: true, featured: true, todayDeal: false, seller: "Sun Pharma", type: "physical", image: "https://via.placeholder.com/50" },
    { id: 3, name: "Digital Health Guide", brand: "HealthEbooks", category: "E-books", price: 299, rating: 4, stock: 100, published: true, featured: false, todayDeal: true, seller: "HealthEbooks", type: "digital", image: "https://via.placeholder.com/50" },
    { id: 4, name: "Blood Pressure Monitor", brand: "Omron", category: "Devices", price: 2500, rating: 4, stock: 5, published: false, featured: false, todayDeal: false, seller: "Omron Healthcare", type: "physical", image: "https://via.placeholder.com/50" },
    { id: 5, name: "Ayurvedic Immunity Kit", brand: "Dabur", category: "Ayurveda", price: 899, rating: 5, stock: 15, published: true, featured: true, todayDeal: true, seller: "Dabur", type: "physical", image: "https://via.placeholder.com/50" },
  ]);

  // Unique sellers for filter
  const sellers = [...new Set(products.map(p => p.seller))];
  const categories = [...new Set(products.map(p => p.category))];

  // Filter products based on tab, seller, category
  const filteredProducts = products.filter(p => {
    if (activeTab !== 'all' && p.type !== activeTab) return false;
    if (filterSeller && p.seller !== filterSeller) return false;
    if (filterCategory && p.category !== filterCategory) return false;
    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'rating-high') return b.rating - a.rating;
    if (sortBy === 'rating-low') return a.rating - b.rating;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
    if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
    return 0;
  });

  // Handle checkbox selection
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedProducts(sortedProducts.map(p => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedProducts.includes(id)) {
      setSelectedProducts(selectedProducts.filter(pid => pid !== id));
    } else {
      setSelectedProducts([...selectedProducts, id]);
    }
  };

  // Bulk actions
  const handleBulkAction = (action) => {
    if (selectedProducts.length === 0) {
      alert("Select at least one product");
      return;
    }
    let updated = [...products];
    if (action === 'delete') {
      if (window.confirm(`Delete ${selectedProducts.length} product(s)?`)) {
        updated = products.filter(p => !selectedProducts.includes(p.id));
        setProducts(updated);
        setSelectedProducts([]);
      }
    } else if (action === 'publish') {
      updated = products.map(p => selectedProducts.includes(p.id) ? { ...p, published: true } : p);
      setProducts(updated);
    } else if (action === 'featured') {
      updated = products.map(p => selectedProducts.includes(p.id) ? { ...p, featured: true } : p);
      setProducts(updated);
    } else if (action === 'todayDeal') {
      updated = products.map(p => selectedProducts.includes(p.id) ? { ...p, todayDeal: true } : p);
      setProducts(updated);
    }
    // Optionally show success message
  };

  // Individual toggle handlers
  const togglePublished = (id) => {
    setProducts(products.map(p => p.id === id ? { ...p, published: !p.published } : p));
  };
  const toggleFeatured = (id) => {
    setProducts(products.map(p => p.id === id ? { ...p, featured: !p.featured } : p));
  };
  const toggleTodayDeal = (id) => {
    setProducts(products.map(p => p.id === id ? { ...p, todayDeal: !p.todayDeal } : p));
  };

  const deleteProduct = (id) => {
    if (window.confirm("Delete this product?")) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  // Render stars
  const renderStars = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <div className="container-fluid mt-3">
      <h5 className="fw-bold">All Medical Products</h5>

      {/* Tabs */}
      <div className="tabs mb-3">
        <button className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>All Products</button>
        <button className={`tab-btn ${activeTab === 'physical' ? 'active' : ''}`} onClick={() => setActiveTab('physical')}>Physical Products</button>
        <button className={`tab-btn ${activeTab === 'digital' ? 'active' : ''}`} onClick={() => setActiveTab('digital')}>Digital Products</button>
      </div>

      {/* Filters */}
      <div className="card p-3 mb-3">
        <div className="row g-2">
          <div className="col-md-2">
            <select className="form-control" value={filterSeller} onChange={(e) => setFilterSeller(e.target.value)}>
              <option value="">All Sellers</option>
              {sellers.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="col-md-2">
            <select className="form-control" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="col-md-3">
            <select className="form-control" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="">Sort by</option>
              <option value="rating-high">Rating (High to Low)</option>
              <option value="rating-low">Rating (Low to High)</option>
              <option value="price-high">Price (High to Low)</option>
              <option value="price-low">Price (Low to High)</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
            </select>
          </div>
          <div className="col-md-3">
            <div className="d-flex gap-2">
              <select className="form-control" onChange={(e) => handleBulkAction(e.target.value)} defaultValue="">
                <option value="" disabled>Bulk Action</option>
                <option value="publish">Publish</option>
                <option value="featured">Mark Featured</option>
                <option value="todayDeal">Mark Today's Deal</option>
                <option value="delete">Delete</option>
              </select>
              <button className="btn btn-outline-secondary" onClick={() => setSelectedProducts([])}>Clear</button>
            </div>
          </div>
          <div className="col-md-2">
            <input className="form-control" placeholder="Search products..." />
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="card p-3">
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th><input type="checkbox" onChange={handleSelectAll} checked={selectedProducts.length === sortedProducts.length && sortedProducts.length > 0} /></th>
                <th>Thumb</th>
                <th>Name / Brand</th>
                <th>Category</th>
                <th>Ratings</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Published</th>
                <th>Featured</th>
                <th>Today's Deal</th>
                <th>Options</th>
              </tr>
            </thead>
            <tbody>
              {sortedProducts.map(p => (
                <tr key={p.id}>
                  <td><input type="checkbox" checked={selectedProducts.includes(p.id)} onChange={() => handleSelectOne(p.id)} /></td>
                  <td><img src={p.image} className="product-img" alt="thumb" /></td>
                  <td>
                    <div className="fw-bold">{p.name}</div>
                    <small className="text-primary">{p.brand}</small>
                  </td>
                  <td>{p.category}</td>
                  <td>
                    <div>{renderStars(p.rating)}</div>
                    <small>{p.rating} / 5</small>
                  </td>
                  <td>₹{p.price}</td>
                  <td>{p.stock}</td>
                  <td><input type="checkbox" checked={p.published} onChange={() => togglePublished(p.id)} /></td>
                  <td><input type="checkbox" checked={p.featured} onChange={() => toggleFeatured(p.id)} /></td>
                  <td><input type="checkbox" checked={p.todayDeal} onChange={() => toggleTodayDeal(p.id)} /></td>
                  <td>
                    <button className="btn btn-sm btn-light me-1" onClick={() => alert(`Edit ${p.name}`)}>✏️</button>
                    <button className="btn btn-sm btn-light" onClick={() => deleteProduct(p.id)}>🗑️</button>
                  </td>
                </tr>
              ))}
              {sortedProducts.length === 0 && (
                <tr><td colSpan="11" className="text-center">No products found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ProductsPage;
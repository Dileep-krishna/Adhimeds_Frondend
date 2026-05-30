'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './all-products.css';

export default function AllProductsPage() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { id: 'all-products', label: 'All products', icon: 'bi-grid-3x3-gap-fill', path: '/super-admin/product-managment/all-products' },
    { id: 'inhouse', label: 'Inhouse Products', icon: 'bi-house-door-fill', path: '/super-admin/product-managment/inhouse-product' },
    { id: 'seller', label: 'Seller Products', icon: 'bi-people-fill', path: '/super-admin/product-managment/all-seller-product' },
    { id: 'add-physical', label: 'Add New Physical Products', icon: 'bi-plus-circle-fill', path: '/super-admin/product-managment/add-product' },
    { id: 'add-digital', label: 'Add New Digital Products', icon: 'bi-cloud-download-fill', path: '/super-admin/product-managment/add-digital-product' },
  ];

  const [products, setProducts] = useState([
    { id: 1, name: 'Paracetamol 500mg', brand: 'Cipla', category: 'Medicine', rating: 5, price: 49, discount: 0, published: true, featured: false, todayDeal: false },
    { id: 2, name: 'Amoxicillin 250mg', brand: 'GSK', category: 'Antibiotic', rating: 4, price: 120, discount: 5, published: true, featured: false, todayDeal: false },
    { id: 3, name: 'BP Monitor (Upper Arm)', brand: 'Omron', category: 'Equipment', rating: 5, price: 2499, discount: 10, published: true, featured: true, todayDeal: false },
    { id: 4, name: 'Vitamin D3 2000IU', brand: 'Sun Pharma', category: 'Supplements', rating: 4, price: 299, discount: 0, published: true, featured: false, todayDeal: true },
    { id: 5, name: 'Digital Thermometer', brand: 'Dr. Trust', category: 'Equipment', rating: 4, price: 399, discount: 5, published: true, featured: false, todayDeal: false },
    { id: 6, name: 'Ayurvedic Immunity Kit', brand: 'Dabur', category: 'Ayurveda', rating: 5, price: 899, discount: 15, published: true, featured: true, todayDeal: false },
    { id: 7, name: 'Nebulizer Machine', brand: 'Philips', category: 'Equipment', rating: 5, price: 3599, discount: 8, published: false, featured: false, todayDeal: false },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterOption, setFilterOption] = useState('');
  const [sortOption, setSortOption] = useState('');

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (searchTerm) result = result.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    if (filterOption === 'published') result = result.filter(p => p.published);
    if (filterOption === 'featured') result = result.filter(p => p.featured);
    if (filterOption === 'todayDeal') result = result.filter(p => p.todayDeal);
    if (filterOption === 'discount') result = result.filter(p => p.discount > 0);
    if (sortOption === 'price-asc') result.sort((a,b) => a.price - b.price);
    if (sortOption === 'price-desc') result.sort((a,b) => b.price - a.price);
    if (sortOption === 'rating-desc') result.sort((a,b) => b.rating - a.rating);
    if (sortOption === 'name-asc') result.sort((a,b) => a.name.localeCompare(b.name));
    return result;
  }, [products, searchTerm, filterOption, sortOption]);

  const togglePublished = (id) => setProducts(products.map(p => p.id === id ? { ...p, published: !p.published } : p));
  const toggleFeatured = (id) => setProducts(products.map(p => p.id === id ? { ...p, featured: !p.featured } : p));
  const toggleTodayDeal = (id) => setProducts(products.map(p => p.id === id ? { ...p, todayDeal: !p.todayDeal } : p));
  const handleDelete = (id) => { if (window.confirm('Delete this product permanently?')) setProducts(products.filter(p => p.id !== id)); };
  const handleAddNew = () => router.push('/super-admin/product-managment/add-product');

  return (
    <div className="all-products-container">
      <div className="top-nav">
        <div className="nav-scroll">
          {navItems.map(item => (
            <Link key={item.id} href={item.path} className={`nav-link ${pathname === item.path ? 'active' : ''}`}>
              <i className={`bi ${item.icon} me-2`}></i>{item.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="header-actions">
        <h4 className="page-title">All Products</h4>
        <button className="btn-add" onClick={handleAddNew}>
          <i className="bi bi-plus-circle me-1"></i> Add New Product
        </button>
      </div>

      <div className="filter-bar">
        <div className="row g-2 align-items-end">
          <div className="col-md-4">
            <input type="text" className="form-control" placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="col-md-3">
            <select className="form-select" value={filterOption} onChange={(e) => setFilterOption(e.target.value)}>
              <option value="">Filter</option>
              <option value="published">Published</option>
              <option value="featured">Featured</option>
              <option value="todayDeal">Today's Deal</option>
              <option value="discount">Has Discount</option>
            </select>
          </div>
          <div className="col-md-3">
            <select className="form-select" value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
              <option value="">Sort</option>
              <option value="price-asc">Price (Low to High)</option>
              <option value="price-desc">Price (High to Low)</option>
              <option value="rating-desc">Highest Rated</option>
              <option value="name-asc">Name (A-Z)</option>
            </select>
          </div>
          <div className="col-md-2">
            <button className="btn btn-outline-secondary w-100" onClick={() => { setSearchTerm(''); setFilterOption(''); setSortOption(''); }}>Reset</button>
          </div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="med-table">
          <thead>...</thead>
          <tbody>
            {filteredProducts.map(product => (
              <tr key={product.id}>
                <td><div className="fw-bold">{product.name}</div><small>{product.brand}</small></td>
                <td>{product.brand}</td>
                <td>{product.category}</td>
                <td><div>{'⭐'.repeat(product.rating)}</div><small>{product.rating} out of 5</small></td>
                <td>₹{product.price}</td>
                <td>{product.discount > 0 ? `${product.discount}%` : '—'}</td>
                <td><i className="bi bi-info-circle text-secondary"></i></td>
                <td><input type="checkbox" checked={product.published} onChange={() => togglePublished(product.id)} /></td>
                <td><input type="checkbox" checked={product.featured} onChange={() => toggleFeatured(product.id)} /></td>
                <td><input type="checkbox" checked={product.todayDeal} onChange={() => toggleTodayDeal(product.id)} /></td>
                <td>
                  <button className="btn-icon edit" onClick={() => alert(`Edit ${product.name}`)}><i className="bi bi-pencil"></i></button>
                  <button className="btn-icon delete" onClick={() => handleDelete(product.id)}><i className="bi bi-trash"></i></button>
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && <tr><td colSpan="11" className="text-center py-4">No products found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
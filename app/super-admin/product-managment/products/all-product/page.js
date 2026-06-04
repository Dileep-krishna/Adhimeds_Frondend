'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './all-products.css';
import { deleteProductAPI, getProductsAPI, updateProductAPI } from '../../../../services/productService';
import { getAllCustomReviewsAPI } from '../../../../services/customReviewService';
import SERVERURL from '../../../../services/serverURL';

export default function AllProductsPage() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { id: 'all-products', label: 'All products', icon: 'bi-grid-3x3-gap-fill', path: '/super-admin/product-managment/all-products' },
    { id: 'inhouse', label: 'Inhouse Products', icon: 'bi-house-door-fill', path: '/super-admin/product-managment/inhouse-product' },
    { id: 'seller', label: 'Seller Products', icon: 'bi-people-fill', path: '/super-admin/product-managment/all-seller-product' },
  ];

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOption, setFilterOption] = useState('');
  const [sortOption, setSortOption] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // Side modal state
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const [productsRes, reviewsRes] = await Promise.all([
        getProductsAPI(),
        getAllCustomReviewsAPI(),
      ]);

      if (!productsRes.success) throw new Error(productsRes.message || 'Failed to load products');
      
      const productsData = productsRes.data;
      const allReviews = reviewsRes.success ? reviewsRes.data : [];

      // Group reviews by productId and calculate average rating
      const reviewsByProduct = {};
      allReviews.forEach(review => {
        const pid = review.productId?._id || review.productId;
        if (!reviewsByProduct[pid]) reviewsByProduct[pid] = [];
        reviewsByProduct[pid].push(review);
      });

      const productsWithRating = productsData.map(product => {
        const productReviews = reviewsByProduct[product._id] || [];
        const totalRating = productReviews.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = productReviews.length ? parseFloat((totalRating / productReviews.length).toFixed(1)) : 0;
        return {
          ...product,
          avgRating,
          reviewCount: productReviews.length,
        };
      });

      setProducts(productsWithRating);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Server error while loading products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const getImageUrl = (filename) => {
    if (!filename) return null;
    return `${SERVERURL}/imgUploads/${filename}`;
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (searchTerm) {
      result = result.filter(p => p.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  p.brand?.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (filterOption === 'published') result = result.filter(p => p.published === true);
    if (filterOption === 'featured') result = result.filter(p => p.featured === true);
    if (filterOption === 'todayDeal') result = result.filter(p => p.todaysDeal === true);
    if (filterOption === 'discount') result = result.filter(p => p.discount > 0);
    if (sortOption === 'price-asc') result.sort((a, b) => (a.unitPrice || 0) - (b.unitPrice || 0));
    if (sortOption === 'price-desc') result.sort((a, b) => (b.unitPrice || 0) - (a.unitPrice || 0));
    if (sortOption === 'rating-desc') result.sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0));
    if (sortOption === 'name-asc') result.sort((a, b) => (a.productName || '').localeCompare(b.productName || ''));
    return result;
  }, [products, searchTerm, filterOption, sortOption]);

  const togglePublished = async (id, currentStatus) => {
    try {
      const response = await updateProductAPI(id, { published: !currentStatus });
      if (response.success) {
        toast.success(`Product ${!currentStatus ? 'published' : 'unpublished'}`);
        fetchProducts();
      } else {
        toast.error(response.message || 'Update failed');
      }
    } catch (error) {
      toast.error('Server error');
    }
  };

  const toggleFeatured = async (id, currentStatus) => {
    try {
      const response = await updateProductAPI(id, { featured: !currentStatus });
      if (response.success) {
        toast.success(`Product ${!currentStatus ? 'featured' : 'unfeatured'}`);
        fetchProducts();
      } else {
        toast.error(response.message || 'Update failed');
      }
    } catch (error) {
      toast.error('Server error');
    }
  };

  const toggleTodayDeal = async (id, currentStatus) => {
    try {
      const response = await updateProductAPI(id, { todaysDeal: !currentStatus });
      if (response.success) {
        toast.success(`Product ${!currentStatus ? 'added to' : 'removed from'} Today's Deal`);
        fetchProducts();
      } else {
        toast.error(response.message || 'Update failed');
      }
    } catch (error) {
      toast.error('Server error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product permanently?')) return;
    try {
      const response = await deleteProductAPI(id);
      if (response.success) {
        toast.success('Product deleted successfully');
        fetchProducts();
      } else {
        toast.error(response.message || 'Delete failed');
      }
    } catch (error) {
      toast.error('Server error');
    }
  };

  const handleEdit = (id) => {
    router.push(`/super-admin/product-managment/edit-product/${id}`);
  };

  const openInfoModal = (product) => {
    setSelectedProduct(product);
    setShowInfoModal(true);
  };

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const closeDropdown = () => setDropdownOpen(false);

  return (
    <div className="all-products-container">
      <Toaster position="top-right" />
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
        <div className="transparent-dropdown">
          <button className="transparent-add-btn" onClick={toggleDropdown}>
            <i className="bi bi-plus-circle"></i> Add New
          </button>
          {dropdownOpen && (
            <ul className="transparent-dropdown-menu">
              <li>
                <Link href="/super-admin/product-managment/products/add-product" className="dropdown-item" onClick={closeDropdown}>
                  <i className="bi bi-box-seam me-2"></i> New Product
                </Link>
              </li>
              <li>
                <Link href="/super-admin/product-managment/product-setup/category" className="dropdown-item" onClick={closeDropdown}>
                  <i className="bi bi-tags me-2"></i> New Category
                </Link>
              </li>
              <li>
                <Link href="/super-admin/product-managment/draft-products" className="dropdown-item" onClick={closeDropdown}>
                  <i className="bi bi-file-earmark-text me-2"></i> Draft
                </Link>
              </li>
              <li>
                <Link href="/super-admin/product-managment/product-setup/Brand" className="dropdown-item" onClick={closeDropdown}>
                  <i className="bi bi-building me-2"></i> New Brand
                </Link>
              </li>
            </ul>
          )}
        </div>
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
        {loading ? (
          <div className="text-center py-5">Loading products...</div>
        ) : (
          <table className="med-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Brand</th>
                <th>Category</th>
                <th>Rating</th>
                <th>Price (₹)</th>
                <th>Discount</th>
                <th>Info</th>
                <th>Published</th>
                <th>Featured</th>
                <th>Today's Deal</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product._id}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      {product.thumbnail && (
                        <img src={getImageUrl(product.thumbnail)} alt={product.productName} width="40" height="40" style={{ objectFit: 'cover', borderRadius: '8px' }} />
                      )}
                      <div>
                        <div className="fw-bold">{product.productName}</div>
                        <small>{product.brand}</small>
                      </div>
                    </div>
                  </td>
                  <td>{product.brand}</td>
                  <td>{product.mainCategory}</td>
                  <td>
                    {product.avgRating > 0 ? (
                      <div>
                        <div className="stars">{'⭐'.repeat(Math.floor(product.avgRating))}</div>
                        <small>{product.avgRating}/5 ({product.reviewCount} reviews)</small>
                      </div>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>₹{product.unitPrice}</td>
                  <td>{product.discount > 0 ? `${product.discount}%` : '—'}</td>
                  <td>
                    <button className="btn-icon info" onClick={() => openInfoModal(product)} title="View Details">
                      <i className="bi bi-info-circle"></i>
                    </button>
                  </td>
                  <td>
                    <label className="switch">
                      <input type="checkbox" checked={product.published || false} onChange={() => togglePublished(product._id, product.published)} />
                      <span className="slider round"></span>
                    </label>
                  </td>
                  <td>
                    <label className="switch">
                      <input type="checkbox" checked={product.featured || false} onChange={() => toggleFeatured(product._id, product.featured)} />
                      <span className="slider round"></span>
                    </label>
                  </td>
                  <td>
                    <label className="switch">
                      <input type="checkbox" checked={product.todaysDeal || false} onChange={() => toggleTodayDeal(product._id, product.todaysDeal)} />
                      <span className="slider round"></span>
                    </label>
                  </td>
                  <td>
                    <button className="btn-icon edit" onClick={() => handleEdit(product._id)}><i className="bi bi-pencil"></i></button>
                    <button className="btn-icon delete" onClick={() => handleDelete(product._id)}><i className="bi bi-trash"></i></button>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr><td colSpan="11" className="text-center py-4">No products found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* SIDE MODAL for Product Details */}
      <AnimatePresence>
        {showInfoModal && selectedProduct && (
          <>
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="side-modal info-modal"
            >
              <div className="side-modal-header">
                <h5>Product Details</h5>
                <button className="close-modal" onClick={() => setShowInfoModal(false)}>×</button>
              </div>
              <div className="side-modal-body">
                <div className="product-detail-card">
                  {selectedProduct.thumbnail && (
                    <div className="text-center mb-3">
                      <img 
                        src={getImageUrl(selectedProduct.thumbnail)} 
                        alt={selectedProduct.productName} 
                        className="product-detail-image"
                        style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '1rem' }}
                      />
                    </div>
                  )}
                  <h4>{selectedProduct.productName}</h4>
                  <p><strong>Brand:</strong> {selectedProduct.brand}</p>
                  <p><strong>Category:</strong> {selectedProduct.mainCategory}</p>
                  <p><strong>Unit:</strong> {selectedProduct.unit || 'N/A'}</p>
                  <p><strong>Weight:</strong> {selectedProduct.weight} kg</p>
                  <p><strong>Minimum Qty:</strong> {selectedProduct.minPurchaseQty}</p>
                  <p><strong>Price:</strong> ₹{selectedProduct.unitPrice}</p>
                  <p><strong>Discount:</strong> {selectedProduct.discount > 0 ? `${selectedProduct.discount}%` : 'None'}</p>
                  <p><strong>Stock:</strong> {selectedProduct.stock}</p>
                  <p><strong>SKU:</strong> {selectedProduct.sku || 'N/A'}</p>
                  <p><strong>Barcode:</strong> {selectedProduct.barcode || 'N/A'}</p>
                  <p><strong>HSN Code:</strong> {selectedProduct.hsnCode || 'N/A'}</p>
                  <p><strong>GST Rate:</strong> {selectedProduct.gstRate || 0}%</p>
                  <p><strong>Rating:</strong> {selectedProduct.avgRating > 0 ? `${selectedProduct.avgRating}/5 (${selectedProduct.reviewCount} reviews)` : 'No reviews yet'}</p>
                  {selectedProduct.description && (
                    <div className="mt-3">
                      <strong>Description:</strong>
                      <p className="mt-1">{selectedProduct.description}</p>
                    </div>
                  )}
                  {selectedProduct.galleryImages?.length > 0 && (
                    <div className="mt-3">
                      <strong>Gallery Images:</strong>
                      <div className="d-flex flex-wrap gap-2 mt-2">
                        {selectedProduct.galleryImages.map((img, idx) => (
                          <img key={idx} src={getImageUrl(img)} alt="gallery" width="60" height="60" style={{ objectFit: 'cover', borderRadius: '8px' }} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
            <div className="side-overlay" onClick={() => setShowInfoModal(false)} />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
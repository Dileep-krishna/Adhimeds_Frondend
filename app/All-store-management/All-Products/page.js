'use client';

import { useState, useEffect, useMemo, useCallback, useRef, memo, useTransition } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './All-Products.css';
import SERVERURL from '../../services/serverURL';
import { getProductsAPI } from '../../services/productService';
import { getAllCustomReviewsAPI } from '../../services/customReviewService';

// Custom debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// Pagination hook
function usePagination(totalItems, itemsPerPage = 10) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [totalPages, currentPage]);
  
  const goToPage = (page) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNumber);
  };
  
  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);
  
  return { currentPage, totalPages, goToPage, nextPage, prevPage, setCurrentPage };
}

// Memoized product row – includes View, Store Access, and Pin buttons
const ProductRow = memo(({ product, onViewProduct, onToggleStoreAccess, onTogglePin, isPinned, getImageUrl }) => {
  const thumbnailUrl = getImageUrl(product.thumbnail);
  
  return (
    <tr key={product._id}>
      <td>
        <div className="d-flex align-items-center gap-2">
          {thumbnailUrl && (
            <img
              src={thumbnailUrl}
              alt={product.productName}
              width="40"
              height="40"
              loading="lazy"
              decoding="async"
              style={{ objectFit: 'cover', borderRadius: '8px' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
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
        ) : '—'}
      </td>
      <td>₹{product.unitPrice}</td>
      <td>{product.discount > 0 ? `${product.discount}%` : '—'}</td>
      <td>
        <button 
          className="btn-icon view-btn" 
          onClick={() => onViewProduct(product)}
          title="View Details"
          style={{ background: 'none', border: 'none', color: '#0a2f2a', fontSize: '1.2rem', cursor: 'pointer' }}
        >
          <i className="bi bi-eye"></i>
        </button>
      </td>
      <td>
        <button
          className="btn-icon pin-btn"
          onClick={() => onTogglePin(product._id)}
          title="Pin to top"
          style={{ background: 'none', border: 'none', color: isPinned ? '#f59e0b' : '#94a3b8', fontSize: '1.2rem', cursor: 'pointer' }}
        >
          <i className={`bi ${isPinned ? 'bi-star-fill' : 'bi-star'}`}></i>
        </button>
      </td>
      <td>
        <button
          className="btn-icon store-access-btn"
          onClick={() => onToggleStoreAccess(product)}
          title="Enable/Disable for store"
          style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '1.2rem', cursor: 'pointer' }}
        >
          <i className="bi bi-shop"></i>
        </button>
      </td>
    </tr>
  );
});
ProductRow.displayName = 'ProductRow';

// Skeleton loader row (9 columns – added Pin column)
const SkeletonRow = memo(() => (
  <tr className="skeleton-row">
    <td><div className="skeleton" style={{ width: '120px', height: '40px' }}></div></td>
    <td><div className="skeleton" style={{ width: '80px', height: '20px' }}></div></td>
    <td><div className="skeleton" style={{ width: '100px', height: '20px' }}></div></td>
    <td><div className="skeleton" style={{ width: '80px', height: '20px' }}></div></td>
    <td><div className="skeleton" style={{ width: '60px', height: '20px' }}></div></td>
    <td><div className="skeleton" style={{ width: '50px', height: '20px' }}></div></td>
    <td><div className="skeleton" style={{ width: '30px', height: '30px', borderRadius: '50%' }}></div></td>
    <td><div className="skeleton" style={{ width: '30px', height: '30px', borderRadius: '50%' }}></div></td>
    <td><div className="skeleton" style={{ width: '40px', height: '20px' }}></div></td>
  </tr>
));
SkeletonRow.displayName = 'SkeletonRow';

export const dynamic = "force-dynamic";

export default function AllProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOption, setFilterOption] = useState('');
  const [sortOption, setSortOption] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [pinnedProductIds, setPinnedProductIds] = useState([]);
  
  // Product detail modal
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Store access modal – email will be pre‑filled from sessionStorage
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [currentProductForStore, setCurrentProductForStore] = useState(null);
  const [storeEmail, setStoreEmail] = useState('');
  const [enableForStore, setEnableForStore] = useState(true);
  const [updatingStoreAccess, setUpdatingStoreAccess] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [isPending, startTransition] = useTransition();

  const getImageUrl = useCallback((filename) => {
    if (!filename) return null;
    return `${SERVERURL}/imgUploads/${filename}`;
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const [productsRes, reviewsRes] = await Promise.all([
        getProductsAPI(),
        getAllCustomReviewsAPI(),
      ]);

      if (!productsRes.success) throw new Error(productsRes.message || 'Failed to load products');

      const productsData = productsRes.data;
      const allReviews = reviewsRes.success ? reviewsRes.data : [];

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
        return { ...product, avgRating, reviewCount: productReviews.length };
      });

      setProducts(productsWithRating);
      setPinnedProductIds([]);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Server error while loading products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Filter and sort – then apply pinning (pinned items go to the top)
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      result = result.filter(p => 
        p.productName?.toLowerCase().includes(searchLower) ||
        p.brand?.toLowerCase().includes(searchLower)
      );
    }
    if (filterOption === 'published') result = result.filter(p => p.published === true);
    if (filterOption === 'featured') result = result.filter(p => p.featured === true);
    if (filterOption === 'todayDeal') result = result.filter(p => p.todaysDeal === true);
    if (filterOption === 'discount') result = result.filter(p => p.discount > 0);
    
    if (sortOption === 'price-asc') result.sort((a, b) => (a.unitPrice || 0) - (b.unitPrice || 0));
    if (sortOption === 'price-desc') result.sort((a, b) => (b.unitPrice || 0) - (a.unitPrice || 0));
    if (sortOption === 'rating-desc') result.sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0));
    if (sortOption === 'name-asc') result.sort((a, b) => (a.productName || '').localeCompare(b.productName || ''));
    
    const pinnedItems = result.filter(p => pinnedProductIds.includes(p._id));
    const unpinnedItems = result.filter(p => !pinnedProductIds.includes(p._id));
    return [...pinnedItems, ...unpinnedItems];
  }, [products, debouncedSearchTerm, filterOption, sortOption, pinnedProductIds]);

  // Pagination
  const { currentPage, totalPages, goToPage, nextPage, prevPage, setCurrentPage } = usePagination(filteredAndSortedProducts.length, itemsPerPage);
  useEffect(() => setCurrentPage(1), [debouncedSearchTerm, filterOption, sortOption, pinnedProductIds, setCurrentPage]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedProducts, currentPage, itemsPerPage]);

  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage + 1 < maxVisible) startPage = Math.max(1, endPage - maxVisible + 1);
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    return pages;
  }, [currentPage, totalPages]);

  const handleViewProduct = useCallback((product) => {
    setSelectedProduct(product);
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setSelectedProduct(null);
  }, []);

  const handleTogglePin = useCallback((productId) => {
    setPinnedProductIds(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  }, []);

  // Store access handler – pre‑fill email from sessionStorage (or localStorage)
  const handleToggleStoreAccess = useCallback((product) => {
    setCurrentProductForStore(product);
    // Try to get stored email from sessionStorage first, then localStorage
    const storedEmail = sessionStorage.getItem('storeEmail') || localStorage.getItem('storeEmail') || '';
    setStoreEmail(storedEmail);
    setEnableForStore(true);
    setShowStoreModal(true);
  }, []);

  const handleStoreAccessSubmit = async () => {
    if (!storeEmail.trim()) {
      toast.error('Please enter a store email');
      return;
    }
    setUpdatingStoreAccess(true);
    try {
      const resolveUrl = `${SERVERURL}/store/by-email?email=${encodeURIComponent(storeEmail)}`;
      const resolveRes = await fetch(resolveUrl);
      const resolveData = await resolveRes.json();
      if (!resolveData.success) {
        toast.error(resolveData.message || 'Store not found with this email');
        return;
      }
      const storeId = resolveData.storeId;
      const url = `${SERVERURL}/store/product-access/${currentProductForStore._id}/${storeId}`;
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: enableForStore })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Product ${enableForStore ? 'enabled' : 'disabled'} for store ${resolveData.storeName || storeEmail}`);
        setShowStoreModal(false);
      } else {
        toast.error(data.message || 'Failed to update store access');
      }
    } catch (error) {
      console.error('Error updating store access:', error);
      toast.error('Server error');
    } finally {
      setUpdatingStoreAccess(false);
    }
  };

  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setFilterOption('');
    setSortOption('');
    setCurrentPage(1);
    setPinnedProductIds([]);
  }, [setCurrentPage]);

  const handleItemsPerPageChange = useCallback((e) => {
    setItemsPerPage(parseInt(e.target.value, 10));
    setCurrentPage(1);
  }, [setCurrentPage]);

  const handleSearchChange = useCallback((e) => {
    startTransition(() => setSearchTerm(e.target.value));
  }, []);

  const startItem = filteredAndSortedProducts.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, filteredAndSortedProducts.length);

  return (
    <div className="all-products-container">
      <Toaster position="top-right" />

      <div className="header-actions">
        <h4 className="page-title">All Products</h4>
      </div>

      <div className="filter-bar">
        <div className="row g-2 align-items-end">
          <div className="col-md-4">
            <input type="text" className="form-control" placeholder="Search products..." value={searchTerm} onChange={handleSearchChange} />
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
            <button className="btn btn-outline-secondary w-100" onClick={resetFilters}>Reset</button>
          </div>
        </div>
      </div>

      <div className="table-responsive">
        {loading ? (
          <table className="med-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Brand</th>
                <th>Category</th>
                <th>Rating</th>
                <th>Price (₹)</th>
                <th>Discount</th>
                <th>View</th>
                <th>Pin</th>
                <th>Store Access</th>
              </tr>
            </thead>
            <tbody>
              {Array(itemsPerPage).fill(null).map((_, idx) => <SkeletonRow key={idx} />)}
            </tbody>
          </table>
        ) : (
          <>
            <table className="med-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Brand</th>
                  <th>Category</th>
                  <th>Rating</th>
                  <th>Price (₹)</th>
                  <th>Discount</th>
                  <th>View</th>
                  <th>Pin</th>
                  <th>Store Access</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map(product => {
                  const isPinned = pinnedProductIds.includes(product._id);
                  return (
                    <ProductRow
                      key={product._id}
                      product={product}
                      onViewProduct={handleViewProduct}
                      onToggleStoreAccess={handleToggleStoreAccess}
                      onTogglePin={handleTogglePin}
                      isPinned={isPinned}
                      getImageUrl={getImageUrl}
                    />
                  );
                })}
                {paginatedProducts.length === 0 && (
                  <tr><td colSpan={9} className="text-center py-4">No products found.您知道吗?</td></tr>
                )}
              </tbody>
            </table>

            {filteredAndSortedProducts.length > 0 && (
              <div className="pagination-controls">
                <div className="pagination-info">Showing {startItem} to {endItem} of {filteredAndSortedProducts.length} products</div>
                <div className="pagination-actions">
                  <select className="form-select per-page-select" value={itemsPerPage} onChange={handleItemsPerPageChange}>
                    <option value={10}>10 per page</option>
                    <option value={25}>25 per page</option>
                    <option value={50}>50 per page</option>
                    <option value={100}>100 per page</option>
                  </select>
                  <nav>
                    <ul className="pagination mb-0">
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={prevPage} disabled={currentPage === 1}>
                          <i className="bi bi-chevron-left"></i>
                        </button>
                      </li>
                      {pageNumbers.map(pageNum => (
                        <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                          <button className="page-link" onClick={() => goToPage(pageNum)}>{pageNum}</button>
                        </li>
                      ))}
                      <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={nextPage} disabled={currentPage === totalPages}>
                          <i className="bi bi-chevron-right"></i>
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Product Details Modal (unchanged) */}
      <AnimatePresence>
        {showModal && selectedProduct && (
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
                <button className="close-modal" onClick={closeModal}>×</button>
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
                        loading="lazy"
                        decoding="async"
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
                    <div className="mt-3"><strong>Description:</strong><p className="mt-1">{selectedProduct.description}</p></div>
                  )}
                  {selectedProduct.galleryImages?.length > 0 && (
                    <div className="mt-3"><strong>Gallery Images:</strong>
                      <div className="d-flex flex-wrap gap-2 mt-2">
                        {selectedProduct.galleryImages.map((img, idx) => (
                          <img key={idx} src={getImageUrl(img)} alt="gallery" width="60" height="60" style={{ objectFit: 'cover', borderRadius: '8px' }} loading="lazy" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
            <div className="side-overlay" onClick={closeModal} />
          </>
        )}
      </AnimatePresence>

      {/* Store Access Modal – email pre‑filled from sessionStorage */}
      <AnimatePresence>
        {showStoreModal && currentProductForStore && (
          <>
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="side-modal store-access-modal"
              style={{ width: '400px' }}
            >
              <div className="side-modal-header">
                <h5>Store Access for {currentProductForStore.productName}</h5>
                <button className="close-modal" onClick={() => setShowStoreModal(false)}>×</button>
              </div>
              <div className="side-modal-body">
                <div className="form-group mb-3">
                  <label className="form-label">Store Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="e.g., store@example.com"
                    value={storeEmail}
                    onChange={(e) => setStoreEmail(e.target.value)}
                  />
                  <small className="text-muted">Enter the store&#39;s registered email address. (Pre‑filled with logged‑in store email)</small>
                </div>
                <div className="form-group mb-3">
                  <label className="form-label">Action</label>
                  <div className="d-flex gap-3">
                    <label className="d-flex align-items-center gap-2">
                      <input type="radio" value="true" checked={enableForStore === true} onChange={() => setEnableForStore(true)} />
                      Enable product for this store
                    </label>
                    <label className="d-flex align-items-center gap-2">
                      <input type="radio" value="false" checked={enableForStore === false} onChange={() => setEnableForStore(false)} />
                      Disable product for this store
                    </label>
                  </div>
                </div>
                <div className="d-flex justify-content-end gap-2 mt-3">
                  <button className="btn-secondary" onClick={() => setShowStoreModal(false)}>Cancel</button>
                  <button className="btn-primary" onClick={handleStoreAccessSubmit} disabled={updatingStoreAccess}>
                    {updatingStoreAccess ? 'Updating...' : 'Save'}
                  </button>
                </div>
              </div>
            </motion.div>
            <div className="side-overlay" onClick={() => setShowStoreModal(false)} />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
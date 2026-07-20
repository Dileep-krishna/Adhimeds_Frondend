'use client';

import { useState, useEffect, useMemo, useCallback, useTransition, memo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './Store-Product.css';
import { getProductsAPI } from '../../services/productService';
import { getAllCustomReviewsAPI } from '../../services/customReviewService';
import {
  updateStoreProductAccess,
  getStoreProductsAccess,
  deleteStoreProductAccess,   // ✅ new import
} from '../../services/storeManagementAPI';
import SERVERURL from '../../services/serverURL';

// ─── Debounce ───
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// ─── Pagination ───
function usePagination(totalItems, itemsPerPage = 10) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [totalPages, currentPage]);
  const goToPage = (page) => setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);
  return { currentPage, totalPages, goToPage, nextPage, prevPage, setCurrentPage };
}

// ─── Product Row ───
const ProductRow = memo(({ product, onToggle, onView, onEdit, onDelete, isEnabled, updating, getImageUrl }) => {
  const thumbnailUrl = getImageUrl(product.thumbnail);
  return (
    <tr>
      <td>
        <div className="d-flex align-items-center gap-2">
          {thumbnailUrl && (
            <img
              src={thumbnailUrl}
              alt={product.productName}
              width="40"
              height="40"
              loading="lazy"
              style={{ objectFit: 'cover', borderRadius: '8px' }}
              onError={(e) => (e.target.style.display = 'none')}
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
        <button className="action-btn view-btn" onClick={() => onView(product)} title="View Details">
          <i className="bi bi-eye"></i>
        </button>
        <button className="action-btn edit-btn" onClick={() => onEdit(product._id)} title="Edit Product">
          <i className="bi bi-pencil"></i>
        </button>
        <button className="action-btn delete-btn" onClick={() => onDelete(product._id)} title="Remove from my store">
          <i className="bi bi-trash"></i>
        </button>
      </td>
      <td>
        <label className="switch">
          <input
            type="checkbox"
            checked={isEnabled}
            disabled={updating}
            onChange={() => onToggle(product._id, isEnabled)}
          />
          <span className="slider round"></span>
        </label>
        {updating && <span className="ms-2 small">Updating...</span>}
      </td>
    </tr>
  );
});
ProductRow.displayName = 'ProductRow';

// ─── Skeleton ───
const SkeletonRow = memo(() => (
  <tr className="skeleton-row">
    <td><div className="skeleton" style={{ width: '120px', height: '40px' }}></div></td>
    <td><div className="skeleton" style={{ width: '80px', height: '20px' }}></div></td>
    <td><div className="skeleton" style={{ width: '100px', height: '20px' }}></div></td>
    <td><div className="skeleton" style={{ width: '80px', height: '20px' }}></div></td>
    <td><div className="skeleton" style={{ width: '60px', height: '20px' }}></div></td>
    <td><div className="skeleton" style={{ width: '50px', height: '20px' }}></div></td>
    <td><div className="skeleton" style={{ width: '120px', height: '30px' }}></div></td>
    <td><div className="skeleton" style={{ width: '60px', height: '30px' }}></div></td>
  </tr>
));
SkeletonRow.displayName = 'SkeletonRow';

export const dynamic = "force-dynamic";

export default function StoreProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [allMasterProducts, setAllMasterProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOption, setFilterOption] = useState('');
  const [sortOption, setSortOption] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [storeId, setStoreId] = useState(null);
  const [updating, setUpdating] = useState({});
  const isSubmitting = useRef(false);

  // Get storeId from sessionStorage
  useEffect(() => {
    const storedStoreId = sessionStorage.getItem('storeId');
    if (storedStoreId && storedStoreId !== 'null' && storedStoreId !== 'undefined') {
      setStoreId(storedStoreId);
    } else {
      toast.error('Store ID not found. Please log in again.');
      router.push('/store-login');
    }
  }, [router]);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [isPending, startTransition] = useTransition();

  const getImageUrl = useCallback((filename) => {
    if (!filename) return null;
    return `${SERVERURL}/imgUploads/${filename}`;
  }, []);

  // ─── Fetch enabled products (with custom price/stock) ───
  const fetchData = useCallback(async () => {
    if (!storeId) return;
    setLoading(true);
    try {
      console.log('🔵 fetchData called for storeId:', storeId);
      const enabledRes = await getStoreProductsAccess(storeId);
      console.log('📦 enabledRes:', enabledRes);

      if (!enabledRes.success) throw new Error(enabledRes.message);

      console.log('📋 enabledRes.data length:', enabledRes.data?.length);

      let enabledProducts = [];
      if (enabledRes.data && Array.isArray(enabledRes.data)) {
        const enabledAccess = enabledRes.data.filter(access => access.enabled === true);
        enabledProducts = enabledAccess.map(access => {
          console.log('🔎 Access record:', access);
          if (!access.productId) {
            console.warn('⚠️ Missing productId in access record:', access);
            return null;
          }
          return {
            ...access.productId,
            _id: access.productId._id,
            storeAccessId: access._id,
            enabled: access.enabled,
            unitPrice: access.customPrice ?? access.productId.unitPrice,
            stock: access.customStock ?? access.productId.stock,
          };
        }).filter(Boolean);
      }

      console.log('📦 enabledProducts after mapping (only enabled):', enabledProducts);

      const allRes = await getProductsAPI();
      if (!allRes.success) throw new Error(allRes.message);
      let allData = allRes.data;

      const reviewsRes = await getAllCustomReviewsAPI();
      const allReviews = reviewsRes.success ? reviewsRes.data : [];
      const reviewsByProduct = {};
      allReviews.forEach(review => {
        const pid = review.productId?._id || review.productId;
        if (!reviewsByProduct[pid]) reviewsByProduct[pid] = [];
        reviewsByProduct[pid].push(review);
      });

      const attachRatings = (productsArray) => productsArray.map(product => {
        const productReviews = reviewsByProduct[product._id] || [];
        const totalRating = productReviews.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = productReviews.length ? parseFloat((totalRating / productReviews.length).toFixed(1)) : 0;
        return { ...product, avgRating, reviewCount: productReviews.length };
      });

      const ratedEnabled = attachRatings(enabledProducts);
      console.log('⭐ ratedEnabled (enabled only):', ratedEnabled);
      setProducts(ratedEnabled);
      setAllMasterProducts(attachRatings(allData));
      console.log('✅ State updated: products count =', ratedEnabled.length);
    } catch (error) {
      console.error('❌ fetchData error:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    if (storeId) fetchData();
  }, [fetchData, storeId]);

  // ─── Toggle product (enable/disable) ───
  const toggleProduct = async (productId, currentEnabled) => {
    if (isSubmitting.current) return;
    isSubmitting.current = true;

    const newEnabled = !currentEnabled;
    console.log(`🔄 Toggling product ${productId} from ${currentEnabled} to ${newEnabled}`);
    setUpdating(prev => ({ ...prev, [productId]: true }));

    try {
      const response = await updateStoreProductAccess(productId, storeId, newEnabled);
      console.log('📤 Toggle response:', response);
      if (response.success) {
        toast.success(`Product ${newEnabled ? 'enabled' : 'disabled'} for this store`);
        console.log('✅ Toggle succeeded, calling fetchData...');
        await fetchData();
        console.log('✅ fetchData completed');
      } else {
        toast.error(response.message || 'Failed to update');
      }
    } catch (error) {
      console.error('❌ Error toggling product:', error);
      toast.error('Server error');
    } finally {
      setUpdating(prev => ({ ...prev, [productId]: false }));
      isSubmitting.current = false;
    }
  };

  // ─── Delete (PERMANENTLY remove access record) ───
  const handleDelete = async (id) => {
    if (!window.confirm('Remove this product permanently from your store?')) return;
    if (isSubmitting.current) return;
    isSubmitting.current = true;

    setUpdating(prev => ({ ...prev, [id]: true }));
    try {
      // ✅ Call the DELETE endpoint to remove the access record entirely
      const response = await deleteStoreProductAccess(id, storeId);
      if (response.success) {
        toast.success('Product permanently removed from your store');
        await fetchData();
      } else {
        toast.error(response.message || 'Failed to remove product');
      }
    } catch (error) {
      console.error(error);
      toast.error('Server error');
    } finally {
      setUpdating(prev => ({ ...prev, [id]: false }));
      isSubmitting.current = false;
    }
  };

  // ─── View / Edit ───
  const handleView = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };
  const handleEdit = (id) => {
    router.push(`/All-store-management/Store-Product/Store-Product-Edit/${id}`);
  };

  // ─── Filter & sort ───
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];
    if (debouncedSearchTerm) {
      const term = debouncedSearchTerm.toLowerCase();
      result = result.filter(p =>
        p.productName?.toLowerCase().includes(term) ||
        p.brand?.toLowerCase().includes(term)
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
    return result;
  }, [products, debouncedSearchTerm, filterOption, sortOption]);

  const { currentPage, totalPages, goToPage, nextPage, prevPage, setCurrentPage } =
    usePagination(filteredAndSortedProducts.length, itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, filterOption, sortOption, setCurrentPage]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedProducts.slice(start, start + itemsPerPage);
  }, [filteredAndSortedProducts, currentPage, itemsPerPage]);

  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [currentPage, totalPages]);

  const resetFilters = () => {
    setSearchTerm('');
    setFilterOption('');
    setSortOption('');
    setCurrentPage(1);
  };
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value, 10));
    setCurrentPage(1);
  };
  const handleSearchChange = (e) => startTransition(() => setSearchTerm(e.target.value));

  const startItem = filteredAndSortedProducts.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, filteredAndSortedProducts.length);

  if (!storeId) {
    return (
      <div className="store-products-container text-center py-5">
        <div className="spinner-border text-primary" />
        <p className="mt-2">Checking authentication...</p>
      </div>
    );
  }

  return (
    <div className="store-products-container">
      <Toaster position="top-right" />

      <div className="header-actions">
        <h4 className="page-title">My Store Products</h4>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="row g-2 align-items-end">
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              placeholder="Search my products..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div className="col-md-3">
            <select className="form-select" value={filterOption} onChange={(e) => setFilterOption(e.target.value)}>
              <option value="">All Products</option>
              <option value="published">Published Only</option>
              <option value="featured">Featured</option>
              <option value="todayDeal">Today's Deal</option>
              <option value="discount">Has Discount</option>
            </select>
          </div>
          <div className="col-md-3">
            <select className="form-select" value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
              <option value="">Sort by</option>
              <option value="price-asc">Price (Low to High)</option>
              <option value="price-desc">Price (High to Low)</option>
              <option value="rating-desc">Highest Rated</option>
              <option value="name-asc">Name (A-Z)</option>
            </select>
          </div>
          <div className="col-md-2">
            <button className="btn btn-outline-secondary w-100 no-hover-btn" onClick={resetFilters}>Reset</button>
          </div>
        </div>
      </div>

      {/* Table */}
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
                <th>Actions</th>
                <th>Enable / Disable</th>
              </tr>
            </thead>
            <tbody>
              {Array(itemsPerPage).fill(null).map((_, i) => <SkeletonRow key={i} />)}
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
                  <th>Actions</th>
                  <th>Enable / Disable</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map(product => (
                  <ProductRow
                    key={product._id}
                    product={product}
                    onToggle={toggleProduct}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    isEnabled={product.enabled ?? true}
                    updating={updating[product._id]}
                    getImageUrl={getImageUrl}
                  />
                ))}
                {paginatedProducts.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-4">
                      No products are enabled for your store. Enable products from the "All Products" page.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {filteredAndSortedProducts.length > 0 && (
              <div className="pagination-controls">
                <div className="pagination-info">
                  Showing {startItem} to {endItem} of {filteredAndSortedProducts.length} products
                </div>
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
                      {pageNumbers.map(p => (
                        <li key={p} className={`page-item ${currentPage === p ? 'active' : ''}`}>
                          <button className="page-link" onClick={() => goToPage(p)}>{p}</button>
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

      {/* Product Details Modal */}
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
                        style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '1rem' }}
                      />
                    </div>
                  )}
                  <h4>{selectedProduct.productName}</h4>
                  <p><strong>Brand:</strong> {selectedProduct.brand}</p>
                  <p><strong>Category:</strong> {selectedProduct.mainCategory}</p>
                  <p><strong>Unit:</strong> {selectedProduct.unit || 'N/A'}</p>
                  <p><strong>Weight:</strong> {selectedProduct.weight} kg</p>
                  <p><strong>Min Qty:</strong> {selectedProduct.minPurchaseQty}</p>
                  <p><strong>Price:</strong> ₹{selectedProduct.unitPrice}</p>
                  <p><strong>Discount:</strong> {selectedProduct.discount > 0 ? `${selectedProduct.discount}%` : 'None'}</p>
                  <p><strong>Stock:</strong> {selectedProduct.stock}</p>
                  <p><strong>SKU:</strong> {selectedProduct.sku || 'N/A'}</p>
                  <p><strong>Barcode:</strong> {selectedProduct.barcode || 'N/A'}</p>
                  <p><strong>HSN:</strong> {selectedProduct.hsnCode || 'N/A'}</p>
                  <p><strong>GST:</strong> {selectedProduct.gstRate || 0}%</p>
                  <p><strong>Rating:</strong> {selectedProduct.avgRating > 0 ? `${selectedProduct.avgRating}/5 (${selectedProduct.reviewCount} reviews)` : 'No reviews'}</p>
                  {selectedProduct.description && (
                    <div><strong>Description:</strong><p>{selectedProduct.description}</p></div>
                  )}
                  {selectedProduct.galleryImages?.length > 0 && (
                    <div>
                      <strong>Gallery:</strong>
                      <div className="d-flex flex-wrap gap-2 mt-2">
                        {selectedProduct.galleryImages.map((img, idx) => (
                          <img key={idx} src={getImageUrl(img)} width="60" height="60" style={{ objectFit: 'cover', borderRadius: '8px' }} />
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
    </div>
  );
}
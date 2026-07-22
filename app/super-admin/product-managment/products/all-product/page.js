'use client';

import { useState, useMemo, useCallback, useRef, useTransition, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './all-products.css';
import { useDebounce } from '../components/hooks/useDebounce';
import { usePagination } from '../components/hooks/usePagination';
import { useProducts } from '../components/hooks/useProducts';
import { ProductRow } from '../../products/ProductRow';
import { SkeletonRow } from '../../products/SkeletonRow';
import { deleteProductAPI, updateProductAPI } from '../../../../services/productService';
import SERVERURL from '../../../../services/serverURL';

export const dynamic = 'force-dynamic';

export default function AllProductsPage() {
  const router = useRouter();
  const dropdownRef = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOption, setFilterOption] = useState('');
  const [sortOption, setSortOption] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [isPending, startTransition] = useTransition();

  // Data fetching
  const { products, loading, fetchProducts } = useProducts();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Image URL helper
  const getImageUrl = useCallback((filename) => filename ? `${SERVERURL}/imgUploads/${filename}` : null, []);

  // Filter & Sort
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];
    if (debouncedSearchTerm) {
      const q = debouncedSearchTerm.toLowerCase();
      result = result.filter(p =>
        p.productName?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q)
      );
    }
    if (filterOption === 'published') result = result.filter(p => p.published);
    if (filterOption === 'featured') result = result.filter(p => p.featured);
    if (filterOption === 'todayDeal') result = result.filter(p => p.todaysDeal);
    if (filterOption === 'discount') result = result.filter(p => p.discount > 0);

    switch (sortOption) {
      case 'price-asc': result.sort((a, b) => (a.unitPrice || 0) - (b.unitPrice || 0)); break;
      case 'price-desc': result.sort((a, b) => (b.unitPrice || 0) - (a.unitPrice || 0)); break;
      case 'rating-desc': result.sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0)); break;
      case 'name-asc': result.sort((a, b) => (a.productName || '').localeCompare(b.productName || '')); break;
      default: break;
    }
    return result;
  }, [products, debouncedSearchTerm, filterOption, sortOption]);

  // Pagination
  const { currentPage, totalPages, goToPage, nextPage, prevPage, setCurrentPage } =
    usePagination(filteredAndSortedProducts.length, itemsPerPage);

  useEffect(() => setCurrentPage(1), [debouncedSearchTerm, filterOption, sortOption, setCurrentPage]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedProducts.slice(start, start + itemsPerPage);
  }, [filteredAndSortedProducts, currentPage, itemsPerPage]);

  const pageNumbers = useMemo(() => {
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [currentPage, totalPages]);

  // Toggle handlers
  const togglePublished = useCallback(async (id, current) => {
    const res = await updateProductAPI(id, { published: !current });
    if (res.success) { toast.success(`Product ${!current ? 'published' : 'unpublished'}`); fetchProducts(); }
    else toast.error(res.message || 'Update failed');
  }, [fetchProducts]);

  const toggleFeatured = useCallback(async (id, current) => {
    const res = await updateProductAPI(id, { featured: !current });
    if (res.success) { toast.success(`Product ${!current ? 'featured' : 'unfeatured'}`); fetchProducts(); }
    else toast.error(res.message || 'Update failed');
  }, [fetchProducts]);

  const toggleTodayDeal = useCallback(async (id, current) => {
    const res = await updateProductAPI(id, { todaysDeal: !current });
    if (res.success) { toast.success(`Product ${!current ? 'added to' : 'removed from'} Today's Deal`); fetchProducts(); }
    else toast.error(res.message || 'Update failed');
  }, [fetchProducts]);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Delete this product permanently?')) return;
    const res = await deleteProductAPI(id);
    if (res.success) { toast.success('Product deleted'); fetchProducts(); }
    else toast.error(res.message || 'Delete failed');
  }, [fetchProducts]);

  const handleEdit = useCallback((id) => router.push(`/super-admin/product-managment/products/edit-product/${id}`), [router]);
  const handleInfoClick = useCallback((id) => router.push(`/super-admin/product-managment/products/product-details/${id}`), [router]);

  // UI helpers
  const toggleDropdown = () => setDropdownOpen(prev => !prev);
  const closeDropdown = () => setDropdownOpen(false);
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

  return (
    <div className="all-products-container" suppressHydrationWarning>
      <Toaster position="top-right" />

      {/* Header */}
      <div className="header-actions">
        <div className="header-left">
          <h4 className="page-title">📦 All Products</h4>
          <p className="page-subtitle">Manage your product inventory and listings</p>
        </div>
        <div className="header-right">
          <div className="transparent-dropdown" ref={dropdownRef}>
            <button className="transparent-add-btn" onClick={toggleDropdown}>
              <i className="bi bi-plus-circle"></i> Add New
            </button>
            {dropdownOpen && (
              <ul className="transparent-dropdown-menu">
                <li><Link href="/super-admin/product-managment/products/add-product" className="dropdown-item" onClick={closeDropdown}><i className="bi bi-box-seam me-2"></i> New Product</Link></li>
                <li><Link href="/super-admin/product-managment/product-setup/category" className="dropdown-item" onClick={closeDropdown}><i className="bi bi-tags me-2"></i> New Category</Link></li>
                <li><Link href="/super-admin/product-managment/draft-products" className="dropdown-item" onClick={closeDropdown}><i className="bi bi-file-earmark-text me-2"></i> Draft</Link></li>
                <li><Link href="/super-admin/product-managment/product-setup/Brand" className="dropdown-item" onClick={closeDropdown}><i className="bi bi-building me-2"></i> New Brand</Link></li>
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
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

      {/* Table */}
      <div className="table-responsive">
        {loading ? (
          <table className="med-table">
            <thead><tr>{['Product','Brand','Category','Rating','Price (₹)','Discount','Info','Published','Featured',"Today's Deal",'Actions'].map(h => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>{Array(itemsPerPage).fill(null).map((_, i) => <SkeletonRow key={i} />)}</tbody>
          </table>
        ) : (
          <>
            <table className="med-table">
              <thead><tr>{['Product','Brand','Category','Rating','Price (₹)','Discount','Info','Published','Featured',"Today's Deal",'Actions'].map(h => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {paginatedProducts.map(product => (
                  <ProductRow
                    key={product._id}
                    product={product}
                    onTogglePublished={togglePublished}
                    onToggleFeatured={toggleFeatured}
                    onToggleTodayDeal={toggleTodayDeal}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onInfo={handleInfoClick}
                    getImageUrl={getImageUrl}
                  />
                ))}
                {paginatedProducts.length === 0 && (
                  <tr><td colSpan={11} className="text-center py-4">No products found.</td></tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {filteredAndSortedProducts.length > 0 && (
              <div className="pagination-controls">
                <div className="pagination-info">
                  Showing {startItem} to {endItem} of {filteredAndSortedProducts.length} products
                </div>
                <div className="pagination-actions">
                  <select className="form-select per-page-select" value={itemsPerPage} onChange={handleItemsPerPageChange}>
                    {[10,25,50,100].map(n => <option key={n} value={n}>{n} per page</option>)}
                  </select>
                  <nav aria-label="Page navigation">
                    <ul className="pagination mb-0">
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={prevPage} disabled={currentPage === 1}><i className="bi bi-chevron-left"></i></button>
                      </li>
                      {pageNumbers.map(p => (
                        <li key={p} className={`page-item ${currentPage === p ? 'active' : ''}`}>
                          <button className="page-link" onClick={() => goToPage(p)}>{p}</button>
                        </li>
                      ))}
                      <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={nextPage} disabled={currentPage === totalPages}><i className="bi bi-chevron-right"></i></button>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
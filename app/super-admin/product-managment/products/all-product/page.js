'use client';

import { useState, useMemo, useCallback, useRef, useTransition, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
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

  const [searchTerm, setSearchTerm] = useState('');
  const [filterOption, setFilterOption] = useState('');
  const [sortOption, setSortOption] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [isPending, startTransition] = useTransition();
  const { products, loading, fetchProducts } = useProducts();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getImageUrl = useCallback((filename) => filename ? `${SERVERURL}/imgUploads/${filename}` : null, []);

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

const toggleDropdown = (e) => {
  e.stopPropagation();
  console.log('Toggling dropdown, current:', dropdownOpen);
  setDropdownOpen(prev => !prev);
};
  const closeDropdown = () => setDropdownOpen(false);
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value, 10)); setCurrentPage(1);
  };
  const handleSearchChange = (e) => startTransition(() => setSearchTerm(e.target.value));

  const startItem = filteredAndSortedProducts.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, filteredAndSortedProducts.length);

  return (
    <div className="all-products-container" suppressHydrationWarning>
      <Toaster position="top-right" />
      
      <div className="header-actions">
        <h3 className="page-title">All products</h3>
       <div className="dropdown-wrapper" ref={dropdownRef}>
  <button type="button" onClick={toggleDropdown} className="add-new-btn">
    Add New Product
    <span className="icon-plus">➕</span>
  </button>
  <ul className={`dropdown-menu ${dropdownOpen ? 'open' : ''}`}>
    <li>
      <Link href="/super-admin/product-managment/products/add-product" onClick={closeDropdown} className="dropdown-item">
        <i className="bi bi-box me-2"></i> Product
      </Link>
    </li>
    <li>
      <Link href="/super-admin/product-managment/product-setup/category" onClick={closeDropdown} className="dropdown-item">
        <i className="bi bi-tags me-2"></i> Category
      </Link>
    </li>
    <li>
      <Link href="/super-admin/product-managment/product-setup/Brand" onClick={closeDropdown} className="dropdown-item">
        <i className="bi bi-building me-2"></i> Brand
      </Link>
    </li>
  </ul>
</div>
      </div>

      <div className="main-table-wrapper">
        
        {/* TABS */}
        <ul className="product-tabs">
          <li className="tab-item active">All products</li>
        </ul>

        {/* FILTER BAR */}
        <div className="filter-top">
          <div className="search-box">
            <i className="bi bi-search search-icon"></i>
            <input type="text" placeholder="Search products..." value={searchTerm} onChange={handleSearchChange} />
          </div>
          <div className="select-wrapper">
            <select className="filter-select" defaultValue="">
              <option value="" disabled>Bulk Action</option>
            </select>
          </div>
          <div className="select-wrapper">
            <select className="filter-select" value={filterOption} onChange={(e) => setFilterOption(e.target.value)}>
              <option value="">Filter</option>
              <option value="published">Published</option>
              <option value="featured">Featured</option>
              <option value="todayDeal">Today's Deal</option>
              <option value="discount">Discount</option>
            </select>
          </div>
          <div className="select-wrapper">
            <select className="filter-select" value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
              <option value="">Sort</option>
              <option value="price-asc">Price ↑</option>
              <option value="price-desc">Price ↓</option>
              <option value="rating-desc">Rating</option>
              <option value="name-asc">Name</option>
            </select>
          </div>
        </div>

        {/* TABLE */}
        <div className="table-responsive">
          {loading ? (
            <table className="med-table">
              <thead>
                <tr>
                  <th className="checkbox-col"><input type="checkbox" disabled /></th>
                  <th>THUMB</th>
                  <th>NAME / BRAND</th>
                  <th>OWNER / CATEGORY</th>
                  <th>RATINGS</th>
                  <th>PRICE DETAILS</th>
                  <th>INFO</th>
                  <th>PUBLISHED</th>
                  <th>FEATURED</th>
                  <th>TODAY'S DEAL</th>
                  <th>OPTIONS</th>
                </tr>
              </thead>
              <tbody>{Array(itemsPerPage).fill(null).map((_, i) => <SkeletonRow key={i} />)}</tbody>
            </table>
          ) : (
            <>
              <table className="med-table">
                <thead>
                  <tr>
                    <th className="checkbox-col"><input type="checkbox" /></th>
                    <th>THUMB</th>
                    <th>NAME / BRAND</th>
                    <th>OWNER / CATEGORY</th>
                    <th>RATINGS</th>
                    <th>PRICE DETAILS</th>
                    <th>INFO</th>
                    <th>PUBLISHED</th>
                    <th>FEATURED</th>
                    <th>TODAY'S DEAL</th>
                    <th>OPTIONS</th>
                  </tr>
                </thead>
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
                    <tr><td colSpan={11} className="no-products">No products found.</td></tr>
                  )}
                </tbody>
              </table>

              {/* PAGINATION */}
              {filteredAndSortedProducts.length > 0 && (
                <div className="pagination-wrapper">
                  <div className="pagination-info">
                    Showing {startItem} to {endItem} of {filteredAndSortedProducts.length} products
                  </div>
                  <div className="pagination-controls">
                    <select className="pagination-select" value={itemsPerPage} onChange={handleItemsPerPageChange}>
                      {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n} per page</option>)}
                    </select>
                    <nav>
                      <ul className="pagination-list">
                        <li className={currentPage === 1 ? 'hidden' : ''}>
                          <button onClick={prevPage} disabled={currentPage === 1} className="pagination-btn">
                            <span className="pagination-arrow">◀</span>
                          </button>
                        </li>
                        {pageNumbers.map(p => (
                          <li key={p}>
                            <button onClick={() => goToPage(p)} className={`pagination-btn ${currentPage === p ? 'active' : ''}`}>
                              {p}
                            </button>
                          </li>
                        ))}
                        <li className={currentPage === totalPages ? 'hidden' : ''}>
                          <button onClick={nextPage} disabled={currentPage === totalPages} className="pagination-btn">
                            <span className="pagination-arrow">▶</span>
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
      </div>
    </div>
  );
}
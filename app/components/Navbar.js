"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import "./navbar.css";
import { getProductsAPI } from "../services/productService";
import CartSidebar from "../pharma-dashboard/components/CartSidebar";
import SERVERURL from "../services/serverURL";

export default function Navbar() {
  const router = useRouter();
  const dropdownRef = useRef();
  const searchRef = useRef();

  // Dropdown state
  const [open, setOpen] = useState(false);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Sidebar state
  const [showCart, setShowCart] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [storeList, setStoreList] = useState([]);

  // Helper to get full image URL
  const getImageUrl = (filename) => {
    if (!filename) return null;
    return `${SERVERURL}/imgUploads/${filename}`;
  };

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await getProductsAPI();
        if (response.success && Array.isArray(response.data)) {
          setProducts(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Filter products
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProducts([]);
      setShowResults(false);
      return;
    }
    const term = searchTerm.toLowerCase();
    const filtered = products.filter(
      (p) =>
        p.productName?.toLowerCase().includes(term) ||
        p.brand?.toLowerCase().includes(term) ||
        p.mainCategory?.toLowerCase().includes(term)
    );
    setFilteredProducts(filtered.slice(0, 8));
    setShowResults(true);
  }, [searchTerm, products]);

  // Outside clicks
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Add button – opens sidebar with store selection
  const addToCart = (product, e) => {
    e.stopPropagation();
    // Mock store list – replace with real API
    const mockStores = [
      {
        storeName: "Oriental Medical & Equipment Co. (omeco)",
        productName: product.productName,
        pack: "15S",
        rate: 0.0,
        mrp: 0.0,
        scheme: "",
        stock: "Out of Stock",
        content: "Unsure",
        qtyPerBox: 0,
      },
      {
        storeName: "Adhi Veda Pharmaceutical Pvt Ltd",
        productName: product.productName,
        pack: "15S",
        rate: 0.0,
        mrp: 0.0,
        scheme: "",
        stock: "Out of Stock",
        content: "Unsure",
        qtyPerBox: 0,
      },
    ];
    setSelectedProduct(product);
    setStoreList(mockStores);
    setShowCart(true);
  };

  return (
    <>
      {/* TOPBAR */}
      <div className="topbar d-flex align-items-center justify-content-between px-3">
        <div className="logo">Live<span>Order</span></div>

        {/* YOUTUBE‑STYLE SEARCH BOX */}
        <div className="search-box position-relative" ref={searchRef}>
          <div className="youtube-search-wrapper">
            <div className="search-input-container">
              <i className="bi bi-search search-icon"></i>
              <input
                type="text"
                className="youtube-search-input"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => searchTerm.trim() && setShowResults(true)}
              />
              {searchTerm && (
                <i className="bi bi-x-lg clear-icon" onClick={() => setSearchTerm('')}></i>
              )}
            </div>
          </div>

          {/* SEARCH RESULTS DROPDOWN */}
          {showResults && (
            <div className="search-results-dropdown">
              {loading ? (
                <div className="text-center p-3">Loading products...</div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center p-3 text-muted">No products found</div>
              ) : (
                filteredProducts.map((product) => (
                  <div key={product._id} className="search-result-item d-flex align-items-start p-2 border-bottom">
                    <div className="result-img me-3">
                      {product.thumbnail ? (
                        <img
                          src={getImageUrl(product.thumbnail)}
                          alt={product.productName}
                          width="50"
                          height="50"
                          className="rounded"
                          style={{ objectFit: 'cover' }}
                        />
                      ) : (
                        <div className="placeholder-img rounded bg-light d-flex align-items-center justify-content-center" style={{ width: 50, height: 50 }}>
                          <i className="bi bi-capsule fs-4 text-secondary"></i>
                        </div>
                      )}
                    </div>
                    <div className="result-info flex-grow-1">
                      <div className="fw-bold">{product.productName}</div>
                      <div className="small text-muted">{product.brand || "Manufacturer"}</div>
                      <div className="small text-muted">{product.mainCategory || "Category"}</div>
                      <div className="small text-muted">Qty/Box: {product.minPurchaseQty || 1}</div>
                    </div>
                    <button
                      className="btn btn-sm btn-outline-primary ms-2"
                      onClick={(e) => addToCart(product, e)}
                    >
                      Add
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* RIGHT ICONS */}
        <div className="d-flex align-items-center position-relative" ref={dropdownRef}>
          <span className="icon me-3 position-relative">
            <i className="bi bi-heart"></i>
            <span className="badge-icon">0</span>
          </span>
          <span className="icon me-3 position-relative">
            <i className="bi bi-bell"></i>
            <span className="badge-icon">3</span>
          </span>
          <span
            className="icon me-3 position-relative"
            onClick={() => router.push("/pharma-dashboard/cartPage")}
            style={{ cursor: "pointer" }}
          >
            <i className="bi bi-cart"></i>
          </span>
          <div className="profile-box" onClick={() => setOpen(!open)}>
            <img src="https://i.pravatar.cc/40" alt="profile" className="profile-img" />
          </div>
          {open && (
            <div className="profile-dropdown">
              <p className="dropdown-item" onClick={() => router.push("/pharma-dashboard/profile")}>My Profile</p>
              <div className="dropdown-item d-flex justify-content-between align-items-center">
                <span>PreFill Last Qty</span>
                <input type="checkbox" />
              </div>
              <p className="dropdown-item">Item Mapping</p>
              <p className="dropdown-item text-danger">Sign Out</p>
            </div>
          )}
        </div>
      </div>

      {/* MENU BAR (unchanged) */}
      <div className="menu-bar d-flex justify-content-between align-items-center px-3">
        <div className="menu-left d-flex align-items-center gap-4">
          <div className="menu-item">All Product <span className="arrow">⌄</span></div>
          <div className="menu-item">Orders <span className="arrow">⌄</span></div>
          <div className="menu-item">Outstanding <span className="arrow">⌄</span></div>
          <div className="menu-item">Manage Returns <span className="arrow">⌄</span></div>
          <div className="menu-item">Invoices</div>
          <div className="menu-item">Support & Ticket <span className="arrow">⌄</span></div>
        </div>
        <div className="menu-right d-flex align-items-center gap-3">
          <span className="menu-link">Manage License</span>
          <button className="seller-btn">Seller List</button>
          <span className="menu-link">Touch Store ↗</span>
        </div>
      </div>

      {/* CART SIDEBAR */}
      <CartSidebar
        show={showCart}
        onHide={() => setShowCart(false)}
        selectedProduct={selectedProduct}
        storeList={storeList}
      />
    </>
  );
}
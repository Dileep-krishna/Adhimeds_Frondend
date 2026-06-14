"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import "./navbar.css";
import CartSidebar from "../pharma-dashboard/components/CartSidebar";

export default function Navbar() {
  const router = useRouter();
  const dropdownRef = useRef();
  const searchRef = useRef();

  // Dropdown state
  const [open, setOpen] = useState(false);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sidebar state
  const [showCart, setShowCart] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [storeList, setStoreList] = useState([]);

  const [loaded, setLoaded] = useState(false);

  // Fetch all shops and products in parallel
  useEffect(() => {
    if (loaded) return;
    const abortController = new AbortController();

    async function fetchAllProducts() {
      setLoading(true);
      try {
        const shopsRes = await fetch("/api/medisoft/shops", { signal: abortController.signal });
        if (!shopsRes.ok) throw new Error("Failed to fetch shops");
        const shopsData = await shopsRes.json();
        const shops = Array.isArray(shopsData) ? shopsData : shopsData?.body || [];
        if (shops.length === 0) {
          setError("No stores found");
          setLoading(false);
          return;
        }

        const productPromises = shops.map(async (shop) => {
          try {
            const res = await fetch("/api/medisoft/products", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ shopId: shop.shopid }),
              signal: abortController.signal,
            });
            if (!res.ok) return [];
            const data = await res.json();
            let products = [];
            if (Array.isArray(data)) products = data;
            else if (data?.products && Array.isArray(data.products)) products = data.products;
            else if (data?.body && Array.isArray(data.body)) products = data.body;
            else products = [];

            return products.map(prod => ({
              ...prod,
              storeName: shop.name,
              storeId: shop.shopid,
            }));
          } catch (err) {
            console.error(`Error for shop ${shop.shopid}:`, err);
            return [];
          }
        });

        const allProductArrays = await Promise.all(productPromises);
        const allItems = allProductArrays.flat();
        setAllProducts(allItems);
        setFilteredProducts(allItems.slice(0, 6));
        setLoaded(true);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error(err);
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchAllProducts();
    return () => abortController.abort();
  }, [loaded]);

  // Debounce search input
  const [debouncedTerm, setDebouncedTerm] = useState(searchTerm);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedTerm(searchTerm), 200);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filter products based on debounced term
  useEffect(() => {
    if (allProducts.length === 0) return;
    if (!debouncedTerm.trim()) {
      setFilteredProducts(allProducts.slice(0, 6));
      setShowResults(false);
      return;
    }
    const lower = debouncedTerm.toLowerCase();
    const filtered = allProducts.filter(p =>
      (p.productname || p.itemname || "").toLowerCase().includes(lower)
    );
    setFilteredProducts(filtered.slice(0, 10));
    setShowResults(true);
  }, [debouncedTerm, allProducts]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Profile dropdown outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const addToCart = (product, e) => {
    e.stopPropagation();
    const productName = product.productname || product.itemname;
    const matchingStores = allProducts.filter(p =>
      (p.productname || p.itemname) === productName
    );
    const storeItems = matchingStores.map(storeProduct => ({
      storeName: storeProduct.storeName,
      productName: storeProduct.productname || storeProduct.itemname,
      pack: storeProduct.pack || "N/A",
      rate: storeProduct.rate || 0,
      mrp: storeProduct.mrp || 0,
      scheme: storeProduct.scheme || "",
      stock: (storeProduct.quantity > 0) ? "In Stock" : "Out of Stock",
      content: storeProduct.content || "Available",
      qtyPerBox: storeProduct.qtyPerBox || storeProduct.pack || 1,
    }));
    setSelectedProduct(product);
    setStoreList(storeItems);
    setShowCart(true);
  };

  return (
    <>
      {/* TOPBAR */}
      <div className="topbar d-flex align-items-center justify-content-between px-3">
        <div className="logo">Live<span>Order</span></div>

        {/* SEARCH BOX */}
        <div className="search-box position-relative" ref={searchRef}>
          <div className="d-flex align-items-center border rounded px-2 py-1 bg-white">
            <span className="me-2 small" style={{ color: "#000" }}>Product</span>
            <input
              type="text"
              className="form-control border-0 shadow-none"
              style={{ color: "#000", background: "transparent" }}
              placeholder="Search medicines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => allProducts.length && setShowResults(true)}
            />
          </div>

          {/* DROPDOWN RESULTS */}
          {showResults && (
            <div
              className="search-results-dropdown"
              style={{
                position: "absolute",
                top: "calc(100% + 5px)",
                left: 0,
                right: 0,
                background: "#fff",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                zIndex: 1000,
                maxHeight: "400px",
                overflowY: "auto",
              }}
            >
              <div
                className="d-flex justify-content-between align-items-center px-3 py-2"
                style={{ background: "#f8f9fa", borderBottom: "1px solid #eee" }}
              >
                <span style={{ fontSize: "13px", fontWeight: "500", color: "#000" }}>
                  {searchTerm ? "Search Results" : "Recent Search"}
                </span>
                <span
                  style={{ fontSize: "12px", cursor: "pointer", color: "#0d6efd" }}
                  onClick={() => {
                    setSearchTerm("");
                    setFilteredProducts(allProducts.slice(0, 6));
                  }}
                >
                  Clear All 🗑
                </span>
              </div>

              <div>
                {loading ? (
                  <div className="text-center p-3" style={{ color: "#000" }}>Loading products...</div>
                ) : error ? (
                  <div className="text-center p-3 text-danger">⚠️ {error}</div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center p-3" style={{ color: "#6c757d" }}>No products found</div>
                ) : (
                  filteredProducts.map((product, idx) => (
                    <div
                      key={idx}
                      className="d-flex align-items-center justify-content-between px-3 py-2"
                      style={{ borderBottom: "1px solid #eee", background: "#fff" }}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <div
                          style={{
                            width: "42px",
                            height: "42px",
                            background: "#f4f0ff",
                            borderRadius: "10px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "20px",
                          }}
                        >
                          💊
                        </div>
                        <div>
                          <div style={{ fontSize: "14px", fontWeight: "500", color: "#000" }}>
                            {product.productname || product.itemname}
                          </div>
                          <div style={{ fontSize: "12px", color: "#555" }}>
                            {product.company || "Manufacturer"}
                          </div>
                        </div>
                      </div>
                      <div className="text-end">
                        <div style={{ fontSize: "12px", color: "#555" }}>
                          Qty/Box: {product.qtyPerBox || product.pack || 1}
                        </div>
                        <button
                          className="btn btn-sm mt-1"
                          style={{
                            border: "1px solid #00b894",
                            color: "#00b894",
                            background: "#fff",
                            borderRadius: "6px",
                            padding: "3px 14px",
                            fontSize: "12px",
                          }}
                          onClick={(e) => addToCart(product, e)}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT ICONS (Heart, Bell, Cart, Profile) */}
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

      {/* MENU BAR */}
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
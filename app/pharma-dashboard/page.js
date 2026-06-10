"use client";

import { useState, useEffect, useRef } from "react";
import "./pharma-dashboard.css";

export default function Dashboard() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();
  const [stores, setStores] = useState([]);
  const [loadingShops, setLoadingShops] = useState(true);
  const [stockData, setStockData] = useState({});
  const [loadingStock, setLoadingStock] = useState({});

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch stores from the proxy
  useEffect(() => {
    async function fetchStores() {
      console.log("🟢 [Stores] Fetching stores from /api/proxy-shops...");
      try {
        const res = await fetch("/api/proxy-shops", { method: "POST" });
        console.log(`📡 [Stores] Response status: ${res.status} ${res.statusText}`);

        if (!res.ok) {
          const errorText = await res.text();
          console.error(`❌ [Stores] HTTP error ${res.status}: ${errorText}`);
          setStores([]);
          setLoadingShops(false);
          return;
        }

        const data = await res.json();
        console.log("📦 [Stores] Full API response:", data);

        // CASE 1: Direct array (as seen in your successful curl)
        if (Array.isArray(data)) {
          console.log(`✅ [Stores] Direct array format. Found ${data.length} shops.`);
          setStores(data);
        }
        // CASE 2: Wrapper format { status: 200, body: [...] }
        else if (data?.status === 200 && Array.isArray(data.body)) {
          console.log(`✅ [Stores] Wrapper format. Found ${data.body.length} shops.`);
          setStores(data.body);
        }
        else {
          console.warn("⚠️ [Stores] Unexpected response shape. Expected array or {status,body}.", data);
          setStores([]);
        }
      } catch (err) {
        console.error("❌ [Stores] Fetch exception:", err);
        setStores([]);
      } finally {
        setLoadingShops(false);
        console.log("🏁 [Stores] Loading finished. stores length:", stores.length);
      }
    }
    fetchStores();
  }, []); // Note: stores.length is not used in deps, it's fine

  // Fetch stock for a specific shop
  const fetchStock = async (shopId) => {
    if (stockData[shopId]) {
      console.log(`📦 [Stock] Shop ${shopId} already loaded.`);
      return;
    }
    console.log(`🟢 [Stock] Fetching stock for shop ID: ${shopId}`);
    setLoadingStock((prev) => ({ ...prev, [shopId]: true }));
    try {
      const res = await fetch("/api/proxy-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: shopId }),
      });
      console.log(`📡 [Stock] Response status: ${res.status} ${res.statusText}`);
      if (!res.ok) {
        const errorText = await res.text();
        console.error(`❌ [Stock] HTTP error ${res.status}: ${errorText}`);
        setStockData((prev) => ({ ...prev, [shopId]: [] }));
        setLoadingStock((prev) => ({ ...prev, [shopId]: false }));
        return;
      }
      const data = await res.json();
      console.log(`📦 [Stock] Response for shop ${shopId}:`, data);
      if (Array.isArray(data)) {
        console.log(`✅ [Stock] Loaded ${data.length} products for shop ${shopId}`);
        setStockData((prev) => ({ ...prev, [shopId]: data }));
      } else if (data?.status === 200 && Array.isArray(data.body)) {
        console.log(`✅ [Stock] Wrapper format, ${data.body.length} products.`);
        setStockData((prev) => ({ ...prev, [shopId]: data.body }));
      } else {
        console.warn(`⚠️ [Stock] Unexpected format for shop ${shopId}:`, data);
        setStockData((prev) => ({ ...prev, [shopId]: [] }));
      }
    } catch (err) {
      console.error(`❌ [Stock] Exception for shop ${shopId}:`, err);
      setStockData((prev) => ({ ...prev, [shopId]: [] }));
    } finally {
      setLoadingStock((prev) => ({ ...prev, [shopId]: false }));
      console.log(`🏁 [Stock] Finished loading shop ${shopId}`);
    }
  };

  return (
    <div className="dashboard-container">
      {/* HEADER */}
      <div className="topbar d-flex align-items-center justify-content-between px-3">
        <div className="logo">Live<span>Order</span></div>
        <div className="search-box d-flex">
          <select className="form-select product-select">
            <option>Product</option>
          </select>
          <input type="text" className="form-control" placeholder="Search Product here" />
        </div>
        <div className="d-flex align-items-center position-relative" ref={dropdownRef}>
          <span className="icon me-3">❤️</span>
          <span className="icon me-3">🔔</span>
          <span className="icon me-3">🛒</span>
          <div className="profile-box" onClick={() => setOpen(!open)}>
            <img src="https://i.pravatar.cc/40" alt="profile" className="profile-img" />
          </div>
          {open && (
            <div className="profile-dropdown">
              <p className="dropdown-item">My Profile</p>
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

      {/* NAVBAR */}
      <div className="menu-bar px-3">
        <span>All Product</span>
        <span>Orders</span>
        <span>Outstanding</span>
        <span>Manage Returns</span>
        <span>Invoices</span>
        <span>Support & Ticket</span>
      </div>

      {/* COMPANY INFO */}
      <div className="container mt-3">
        <h5>Adhi Veda Pharmaceutical Private Limited</h5>
        <p className="text-muted small">
          Building No. 1038-121 J And K Sreedhar Plaza...
        </p>

        {/* STORES SECTION */}
        {loadingShops ? (
          <p>⏳ Loading stores...</p>
        ) : stores.length === 0 ? (
          <p>❌ No stores found. Check console for errors.</p>
        ) : (
          <div className="row g-3 mt-2">
            {stores.map((store) => (
              <div className="col-md-4" key={store.shopid}>
                <div className="store-card d-flex align-items-start p-3">
                  <div className="store-icon me-3">
                    {store.name?.slice(0, 2) || "ST"}
                  </div>
                  <div className="flex-grow-1">
                    <h6 className="mb-1">{store.name}</h6>
                    <p className="small text-muted mb-1">
                      {store.address1}, {store.address2}
                    </p>
                    <p className="small mb-0">📞 {store.phone}</p>
                    <p className="small mb-0">✉️ {store.email}</p>
                    <button
                      className="btn btn-sm btn-outline-primary mt-2"
                      onClick={() => fetchStock(store.shopid)}
                      disabled={loadingStock[store.shopid]}
                    >
                      {loadingStock[store.shopid] ? "Loading..." : "View Stock"}
                    </button>
                    {stockData[store.shopid] && (
                      <p className="small text-success mt-2 mb-0">
                        Stock items: {stockData[store.shopid].length}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* LAST ADDED */}
        <div className="last-added mt-3 p-3">
          <h6>Last Added Items</h6>
          <p>Dolo 650 Mg Tab</p>
        </div>

        {/* SOLUTIONS */}
        <div className="solutions mt-4 p-3">
          <h6>C-Square Solutions helpful for you</h6>
          <div className="row mt-3">
            <div className="col-md-4">
              <div className="solution-card p-3">
                <h6>PharmSoft</h6>
                <p>The End To End Solution for pharmacies</p>
                <button className="btn btn-warning btn-sm">Ask for Demo</button>
              </div>
            </div>
            <div className="col-md-4">
              <div className="solution-card p-3">
                <h6>EcoGreen</h6>
                <p>Manage your retail chains</p>
                <button className="btn btn-warning btn-sm">Ask for Demo</button>
              </div>
            </div>
            <div className="col-md-4">
              <div className="solution-card p-3">
                <h6>PharmAssist</h6>
                <p>Grow your distribution business</p>
                <button className="btn btn-warning btn-sm">Ask for Demo</button>
              </div>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="row text-center mt-4 stats">
          <div className="col-md-3">
            <h6>10K +</h6>
            <p>Trusted Customers</p>
          </div>
          <div className="col-md-3">
            <h6>22 Cr +</h6>
            <p>Transactions</p>
          </div>
          <div className="col-md-3">
            <h6>4 Lac +</h6>
            <p>Products</p>
          </div>
          <div className="col-md-3">
            <h6>India’s B2B</h6>
            <p>Ecosystem</p>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="footer mt-5 text-center p-3">Stay Updated</div>
    </div>
  );
}
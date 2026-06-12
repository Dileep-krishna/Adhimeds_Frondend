"use client";

import { useState, useEffect, useRef } from "react";
import "./pharma-dashboard.css";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();
  const [stores, setStores] = useState([]);
  const [loadingShops, setLoadingShops] = useState(true);
  const [stockData, setStockData] = useState({});
  const [loadingStock, setLoadingStock] = useState({});
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch stores
  useEffect(() => {
    async function fetchStores() {
      try {
        const res = await fetch("/api/proxy-shops", { method: "POST" });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        if (Array.isArray(data)) setStores(data);
        else if (data?.status === 200 && Array.isArray(data.body)) setStores(data.body);
        else setStores([]);
      } catch (err) {
        console.error(err);
        setStores([]);
      } finally {
        setLoadingShops(false);
      }
    }
    fetchStores();
  }, []);

  // Fetch stock
  const fetchStock = async (shopId) => {
    if (stockData[shopId]) return;
    setLoadingStock((prev) => ({ ...prev, [shopId]: true }));
    try {
      const res = await fetch("/api/proxy-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: shopId }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      const products = Array.isArray(data) ? data : (data?.body && Array.isArray(data.body) ? data.body : []);
      setStockData((prev) => ({ ...prev, [shopId]: products }));
    } catch (err) {
      console.error(err);
      setStockData((prev) => ({ ...prev, [shopId]: [] }));
    } finally {
      setLoadingStock((prev) => ({ ...prev, [shopId]: false }));
    }
  };

  // Last added items
  const lastAddedItems = (() => {
    const firstStockKey = Object.keys(stockData).find(key => stockData[key]?.length > 0);
    if (firstStockKey) return stockData[firstStockKey].slice(0, 3);
    return [];
  })();

  // Group stores by first letter
  const groupedStores = stores.reduce((groups, store) => {
    const firstChar = store.name.charAt(0).toUpperCase();
    if (!groups[firstChar]) groups[firstChar] = [];
    groups[firstChar].push(store);
    return groups;
  }, {});

  return (
    <div className="dashboard-container">
      <Navbar />

      <div className="p-4 mt-3">
        <h5>Adhi Veda Pharmaceutical Private Limited</h5>
        <p className="text-muted small">
          Building No. 1038-121 J And K Sreedhar Plaza...
        </p>

        <div className="row mt-4">
          {/* LEFT COLUMN – Horizontal flex row of store cards */}
          {/* LEFT COLUMN – Clean Grid Store Cards */}
          <div className="col-lg-8">
            {loadingShops ? (
              <p>⏳ Loading stores...</p>
            ) : stores.length === 0 ? (
              <p>❌ No stores found.</p>
            ) : (
              <div className="row g-3">
                {stores.map((store) => (
                  <div key={store.shopid} className="col-12 col-md-6 col-lg-4">
  <div
    className="store-card d-flex align-items-stretch bg-white border rounded"
    style={{ cursor: "pointer" }}
    onClick={() => fetchStock(store.shopid)}
  >
    {/* Left Logo Section */}
    <div className="store-logo-box d-flex align-items-center justify-content-center">
      {store.logo ? (
        <img src={store.logo} alt="logo" />
      ) : (
        <span>{store.name?.charAt(0)}</span>
      )}
    </div>

    {/* Right Content Section */}
    <div className="store-content flex-grow-1 p-2">
      <div className="store-title p-2">
        {store.name}
      </div>

      <div className="store-footer d-flex justify-content-between p-2">
        <span>Items : {stockData[store.shopid]?.length || 0}</span>
        <span>Value : ₹0.00</span>
      </div>

      {loadingStock[store.shopid] && (
        <div className="spinner-border spinner-border-sm text-primary m-2"></div>
      )}
    </div>
  </div>
</div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN – Last Added Items (unchanged) */}
          <div className="col-lg-4">
            <div className="last-added-card p-3 bg-white rounded shadow-sm">
              <h6 className="fw-bold mb-3">Last Added Items</h6>
              {lastAddedItems.length > 0 ? (
                <ul className="list-unstyled small">
                  {lastAddedItems.map((item, idx) => (
                    <li key={idx} className="mb-2 pb-2 border-bottom">
                      <strong>{item.productname || item.itemname}</strong><br />
                      Qty: {item.quantity || 0}, Pack: {item.pack || 'N/A'}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted small">No items recently added.</p>
              )}
            </div>
          </div>
        </div>

        {/* SOLUTIONS SECTION (unchanged) */}
        <div className="solutions mt-4">
          <h6 className="mb-3">C-Square Solutions helpful for you</h6>
          <p className="text-muted small mb-4">Increase your Business</p>
          <div className="row">
            <div className="col-md-4 mb-4">
              <div className="solution-card p-3 h-100 shadow-sm rounded d-flex flex-column flex-md-row align-items-center gap-3">
                <div className="card-text flex-grow-1 text-start">
                  <h6>PharmSoft</h6>
                  <p className="small mb-1">The End To End Solution For All Pharmacies.</p>
                  <p className="small text-muted">Manage your store inventory, Stock & Sales, Billing, Rack Management etc...</p>
                  <button className="btn btn-warning btn-sm mt-2">Ask for Demo</button>
                </div>
                <img src="https://ts1.mm.bing.net/th?id=OIP.ddWjb5DiCrnEJScIEkaOhwHaHa&pid=15.1&o=7&rm=3" alt="PharmSoft" className="card-img img-fluid rounded" style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="solution-card p-3 h-100 shadow-sm rounded d-flex flex-column flex-md-row align-items-center gap-3">
                <div className="card-text flex-grow-1 text-start">
                  <h6>EcoGreen</h6>
                  <p className="small mb-1">One Stop Solution To Manage Your Retail Chains.</p>
                  <p className="small text-muted">EcoGreen will help in "Several Management" Inventory, Order, Warehouse, Vendor, Payroll Etc.</p>
                  <button className="btn btn-warning btn-sm mt-2">Ask for Demo</button>
                </div>
                <img src="https://ts3.mm.bing.net/th?id=OIP.JUIJSHUPj5xlruW_hRaQhAHaEK&pid=15.1&o=7&rm=3" alt="EcoGreen" className="card-img img-fluid rounded" style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="solution-card p-3 h-100 shadow-sm rounded d-flex flex-column flex-md-row align-items-center gap-3">
                <div className="card-text flex-grow-1 text-start">
                  <h6>PharmAssist</h6>
                  <p className="small mb-1">Grow Your Distribution Business</p>
                  <p className="small text-muted">Helps in "Several Management" Sales, Purchase, Inventory, Accounts etc...</p>
                  <button className="btn btn-warning btn-sm mt-2">Ask for Demo</button>
                </div>
                <img src="https://ts4.mm.bing.net/th?id=OIP.2pLnJkclBjbRIZ4RtqM7-gAAAA&pid=15.1&o=7&rm=3" alt="PharmAssist" className="card-img img-fluid rounded" style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
              </div>
            </div>
          </div>
        </div>

        {/* STATS SECTION (unchanged) */}
        <div className="stats mt-4 text-center">
          <div className="row g-4">
            <div className="col-6 col-md-3">
              <div className="stat-item d-flex flex-column flex-sm-row align-items-center justify-content-center gap-2">
                <i className="bi bi-people fs-1 text-warning"></i>
                <div><h6 className="fw-bold mb-0">10K +</h6><p className="small text-muted mb-0">Trusted Customers</p></div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="stat-item d-flex flex-column flex-sm-row align-items-center justify-content-center gap-2">
                <i className="bi bi-currency-exchange fs-1 text-warning"></i>
                <div><h6 className="fw-bold mb-0">22 Cr +</h6><p className="small text-muted mb-0">Transactions</p></div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="stat-item d-flex flex-column flex-sm-row align-items-center justify-content-center gap-2">
                <i className="bi bi-box-seam fs-1 text-warning"></i>
                <div><h6 className="fw-bold mb-0">4 Lac +</h6><p className="small text-muted mb-0">Products</p></div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="stat-item d-flex flex-column flex-sm-row align-items-center justify-content-center gap-2">
                <i className="bi bi-globe2 fs-1 text-warning"></i>
                <div><h6 className="fw-bold mb-0">INDIA’s B2B</h6><p className="small text-muted mb-0">Eco System</p></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER – unchanged */}
      <div className="footer-container mt-5">
        <div className="footer-top text-center py-4 p-4">
          <h5>Stay Updated</h5>
          <div className="social-icons mt-2"><span>f</span><span>t</span><span>in</span></div>
        </div>
        <div className="footer-main container-fluid py-4">
          <div className="row">
            <div className="col-md-3"><h6>LiveOrder</h6></div>
            <div className="col-md-2"><h6>Know Us</h6><p>About Us</p><p>Contact Us</p></div>
            <div className="col-md-3"><h6>Our Policies</h6><p>Privacy Policy</p><p>Caution Notice</p></div>
            <div className="col-md-2"><h6>Our Services</h6><p>Help</p></div>
            <div className="col-md-2"><h6>Need Help</h6><p>080-67657070</p><p>liveorder@c2info.com</p></div>
          </div>
        </div>
        <div className="footer-features container-fluid py-4">
          <div className="row text-center">
            <div className="col-md-4"><h6>Value-Driven</h6><p>Convert solutions into value-based offerings with strong organizational support.</p></div>
            <div className="col-md-4"><h6>Cost-effective</h6><p>Strong buyers, intense competition, and optimized pricing.</p></div>
            <div className="col-md-4"><h6>Secure-Payments</h6><p>More secure payments with JIO Money Payment Gateway.</p></div>
          </div>
        </div>
        <div className="footer-bottom text-center py-3">Copyright © 2026 C-Square Info-Solutions Ltd. All rights reserved.</div>
      </div>
    </div>
  );
}
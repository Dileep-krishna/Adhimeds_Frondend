"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import OrderNotificationBell from "./OrderNotificationBell";
import "./StoreSidebar.css";

export default function StoreAppSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "Requests"; // default

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [productsExpandOpen, setProductsExpandOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);

  // Auto‑open products submenu when on product routes
  useEffect(() => {
    if (
      pathname.startsWith("/All-store-management/All-Products") ||
      pathname.startsWith("/All-store-management/Store-Product")
    ) {
      setProductsOpen(true);
      setProductsExpandOpen(true);
    }
  }, [pathname]);

  // Auto‑open orders dropdown when on orders pages
  useEffect(() => {
    if (
      pathname.startsWith("/All-store-management/Orders") ||
      pathname.startsWith("/All-store-management/All-Orders") ||
      pathname.startsWith("/All-store-management/Order-Requests")  // ← new route
    ) {
      setOrdersOpen(true);
    }
  }, [pathname]);

  // Responsive check
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleProducts = () => setProductsOpen((prev) => !prev);
  const toggleProductsExpand = () => setProductsExpandOpen((prev) => !prev);
  const toggleOrders = () => setOrdersOpen((prev) => !prev);
  const handleNav = () => {
    if (isMobile) setSidebarOpen(false);
  };
  const handleLogout = () => {
    window.location.href = "/login";
  };

  // ✅ Order tabs – "Requests" points to the new dedicated page
  const orderTabs = [
    { label: "All Orders", href: "/All-store-management/All-Orders" },
    { label: "Requests", href: "/All-store-management/Order-Requests" },
    // Other tabs are commented out – uncomment if needed
    // { label: "Accepted Requests", href: "/All-store-management/Orders?tab=Accepted%20Requests" },
    // { label: "Prepayment Requests", href: "/All-store-management/Orders?tab=Prepayment%20Requests" },
    // { label: "Confirmed Prepayments", href: "/All-store-management/Orders?tab=Confirmed%20Prepayments" },
    // { label: "Final Preorders", href: "/All-store-management/Orders?tab=Final%20Preorders" },
    // { label: "In Shipping", href: "/All-store-management/Orders?tab=In%20Shipping" },
    // { label: "Delivered", href: "/All-store-management/Orders?tab=Delivered" },
    // { label: "Refund", href: "/All-store-management/Orders?tab=Refund" },
  ];

  // ✅ Active tab detection – handles both dedicated pages and query‑param tabs
  const isTabActive = (tab) => {
    if (tab.label === "All Orders") {
      return pathname === "/All-store-management/All-Orders";
    }
    if (tab.label === "Requests") {
      return pathname === "/All-store-management/Order-Requests";
    }
    // For other tabs (if uncommented), check query param
    return currentTab === tab.label;
  };

  // Animations (reuse same as products)
  const dropdownVariants = {
    hidden: { height: 0, opacity: 0, transition: { duration: 0.2, ease: "easeInOut" } },
    visible: { height: "auto", opacity: 1, transition: { duration: 0.2, ease: "easeOut" } },
  };

  return (
    <>
      {/* Mobile menu button */}
      <button className="store-mobile-menu-btn" onClick={toggleSidebar}>
        <i className={`bi ${sidebarOpen ? "bi-x-lg" : "bi-list"}`}></i>
      </button>

      <aside className={`store-sidebar ${sidebarOpen ? "" : "store-closed"}`}>
        <div className="store-sidebar-header">
          <div className="store-logo-circle">
            <img src="/images/logo.webp" alt="Logo" className="store-logo-img" />
          </div>
          <h2 className="store-logo-text">STORE HUB</h2>
        </div>

        <nav className="store-sidebar-nav">
          {/* Dashboard */}
          <Link
            href="/All-store-management/store-dashboard"
            className={`store-nav-item ${pathname === "/All-store-management/store-dashboard" ? "active" : ""}`}
            onClick={handleNav}
          >
            <i className="bi bi-speedometer2"></i>
            <span>Dashboard</span>
          </Link>

          {/* Products Dropdown (unchanged) */}
          <div className="store-dropdown-parent">
            <div className="store-dropdown-header-wrapper">
              <button className="store-dropdown-main-link" onClick={toggleProducts}>
                <i className="bi bi-box"></i>
                <span>Products</span>
              </button>
              <button className="store-chevron-toggle" onClick={toggleProducts}>
                <i className={`bi bi-chevron-${productsOpen ? "up" : "down"}`}></i>
              </button>
            </div>

            <AnimatePresence>
              {productsOpen && (
                <motion.div
                  className="store-dropdown-menu"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={dropdownVariants}
                  style={{ overflow: "hidden", display: "block" }}
                >
                  <div className="store-nested-dropdown">
                    <div
                      className="store-dropdown-item"
                      onClick={toggleProductsExpand}
                      style={{ cursor: "pointer", justifyContent: "space-between" }}
                    >
                      <span>Products</span>
                      <i className={`bi bi-chevron-${productsExpandOpen ? "up" : "down"}`}></i>
                    </div>
                    <AnimatePresence>
                      {productsExpandOpen && (
                        <motion.div
                          className="store-nested-menu"
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          variants={dropdownVariants}
                          style={{ overflow: "hidden", display: "block" }}
                        >
                          <Link
                            href="/All-store-management/All-Products"
                            className="store-dropdown-sub-item"
                            onClick={handleNav}
                          >
                            <i className="bi bi-box-seam"></i> All‑Products
                          </Link>
                          <Link
                            href="/All-store-management/Store-Product"
                            className="store-dropdown-sub-item"
                            onClick={handleNav}
                          >
                            <i className="bi bi-shop"></i> Store Products
                          </Link>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ======== Orders Dropdown ======== */}
          <div className="store-dropdown-parent">
            <div className="store-dropdown-header-wrapper">
              <button
                className="store-dropdown-main-link"
                onClick={toggleOrders}
                style={{ position: "relative" }}
              >
                <i className="bi bi-cart-check"></i>
                <span>Orders</span>
              </button>
              <div style={{ display: "flex", alignItems: "center" }}>
                <OrderNotificationBell
                  onClick={() => {
                    router.push("/All-store-management/Order-Requests"); // ← updated: goes to Requests page
                  }}
                  style={{ marginRight: "4px" }}
                />
                <button className="store-chevron-toggle" onClick={toggleOrders}>
                  <i className={`bi bi-chevron-${ordersOpen ? "up" : "down"}`}></i>
                </button>
              </div>
            </div>

            <AnimatePresence>
              {ordersOpen && (
                <motion.div
                  className="store-dropdown-menu"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={dropdownVariants}
                  style={{ overflow: "hidden", display: "block" }}
                >
                  {orderTabs.map((tab) => (
                    <Link
                      key={tab.label}
                      href={tab.href}
                      className={`store-dropdown-sub-item ${isTabActive(tab) ? "active" : ""}`}
                      onClick={handleNav}
                    >
                      <i className="bi bi-circle"></i> {tab.label}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {/* ============================================== */}
        </nav>

        {/* Logout Button */}
        <div className="store-sidebar-footer">
          <button onClick={handleLogout} className="store-logout-btn">
            <i className="bi bi-box-arrow-right"></i>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
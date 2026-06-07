"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import "./All-store-management.css";

export default function StoreManagementLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [productsExpandOpen, setProductsExpandOpen] = useState(false); // for "products" expandable
  const pathname = usePathname();

  // Auto-close submenus on route change
  useEffect(() => {
    setProductsOpen(false);
    setProductsExpandOpen(false);
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
  const toggleProducts = () => {
    setProductsOpen(!productsOpen);
    if (productsOpen) setProductsExpandOpen(false);
  };
  const toggleProductsExpand = () => setProductsExpandOpen(!productsExpandOpen);

  const handleNav = () => {
    if (isMobile) setSidebarOpen(false);
  };

  const isActive = (path) => pathname === path;

  // Animation variants
  const dropdownVariants = {
    hidden: { height: 0, opacity: 0, transition: { duration: 0.25, ease: "easeInOut" } },
    visible: { height: "auto", opacity: 1, transition: { duration: 0.3, ease: "easeOut" } }
  };

  const nestedVariants = {
    hidden: { height: 0, opacity: 0, transition: { duration: 0.2, ease: "easeInOut" } },
    visible: { height: "auto", opacity: 1, transition: { duration: 0.25, ease: "easeOut" } }
  };

  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
  };

  return (
    <div className="super-admin-layout">
      <button className="mobile-menu-btn" onClick={toggleSidebar}>
        <i className={`bi ${sidebarOpen ? "bi-x-lg" : "bi-list"}`}></i>
      </button>

      <aside className={`sidebar ${sidebarOpen ? "" : "closed"}`}>
        <div className="sidebar-header">
          <div className="logo-circle">
            <img src="/images/logo.webp" alt="Logo" className="logo-img" />
          </div>
          <h2 className="logo-text">ADHIMEDS</h2>
        </div>

        <nav className="sidebar-nav">
          {/* Dashboard */}
          <Link
            href="/All-store-management/store-dashboard"
            className={`nav-item ${isActive("/All-store-management/store-dashboard") ? "active" : ""}`}
            onClick={handleNav}
          >
            <i className="bi bi-speedometer2"></i>
            <span>Dashboard</span>
          </Link>

          {/* Products Main Dropdown */}
          <div className="dropdown-parent">
            <div className="dropdown-header-wrapper">
              <button className="dropdown-main-link" onClick={toggleProducts}>
                <i className="bi bi-box"></i>
                <span>Products</span>
              </button>
              <button className="chevron-toggle" onClick={toggleProducts}>
                <i className={`bi bi-chevron-${productsOpen ? "up" : "down"}`}></i>
              </button>
            </div>

            <AnimatePresence>
              {productsOpen && (
                <motion.div
                  className="dropdown-menu show"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={dropdownVariants}
                  style={{ overflow: "hidden", display: "block" }}
                >
                  {/* Expandable "products" item */}
                  <div className="nested-dropdown">
                    <div
                      className="dropdown-item"
                      onClick={toggleProductsExpand}
                      style={{ cursor: "pointer", justifyContent: "space-between" }}
                    >
                      <span>products</span>
                      <i className={`bi bi-chevron-${productsExpandOpen ? "up" : "down"}`}></i>
                    </div>
                    <AnimatePresence>
                      {productsExpandOpen && (
                        <motion.div
                          className="nested-menu show"
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          variants={nestedVariants}
                          style={{ overflow: "hidden", display: "block" }}
                        >
                          <Link
                            href="/All-store-management/All-Products"
                            className="dropdown-sub-item"
                            onClick={handleNav}
                          >
                            All-products
                          </Link>
                          <Link
                            href="/All-store-management/Store-Product"
                            className="dropdown-sub-item"
                            onClick={handleNav}
                          >
                            Store Products
                          </Link>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Direct links */}
                  <Link href="/store-management/brand" className="dropdown-item" onClick={handleNav}>
                    Brand
                  </Link>
                  <Link href="/store-management/variant" className="dropdown-item" onClick={handleNav}>
                    Variant
                  </Link>
                  <Link href="/store-management/product-bulk-upload" className="dropdown-item" onClick={handleNav}>
                    Product-Bulk-Upload
                  </Link>
                  <Link href="/store-management/product-reviews" className="dropdown-item" onClick={handleNav}>
                    Product-Review
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Orders */}
          <Link
            href="/store-management/orders"
            className={`nav-item ${isActive("/store-management/orders") ? "active" : ""}`}
            onClick={handleNav}
          >
            <i className="bi bi-cart-check"></i>
            <span>Orders</span>
          </Link>
        </nav>
      </aside>

      <main className="main-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
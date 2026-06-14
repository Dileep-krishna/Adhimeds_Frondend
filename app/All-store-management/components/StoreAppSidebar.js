"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import "./StoreSidebar.css";

export default function StoreAppSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [productsExpandOpen, setProductsExpandOpen] = useState(false);
  const pathname = usePathname();
  const [userClicked, setUserClicked] = useState(false);

  // Auto-open submenus on route change (only after user click)
  useEffect(() => {
    if (!userClicked) {
      setProductsOpen(false);
      setProductsExpandOpen(false);
      return;
    }
    if (
      pathname.startsWith("/All-store-management/All-Products") ||
      pathname.startsWith("/All-store-management/Store-Product")
    ) {
      setProductsOpen(true);
      setProductsExpandOpen(true);
    } else {
      setProductsOpen(false);
      setProductsExpandOpen(false);
    }
  }, [pathname, userClicked]);

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
    setUserClicked(true);
    setProductsOpen(!productsOpen);
    if (productsOpen) setProductsExpandOpen(false);
  };
  const toggleProductsExpand = () => {
    setUserClicked(true);
    setProductsExpandOpen(!productsExpandOpen);
  };
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
            className={`store-nav-item ${isActive("/All-store-management/store-dashboard") ? "active" : ""}`}
            onClick={handleNav}
          >
            <i className="bi bi-speedometer2"></i>
            <span>Dashboard</span>
          </Link>

          {/* Products Dropdown */}
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
                      <span>products</span>
                      <i className={`bi bi-chevron-${productsExpandOpen ? "up" : "down"}`}></i>
                    </div>
                    <AnimatePresence>
                      {productsExpandOpen && (
                        <motion.div
                          className="store-nested-menu"
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          variants={nestedVariants}
                          style={{ overflow: "hidden", display: "block" }}
                        >
                          <Link
                            href="/All-store-management/All-Products"
                            className="store-dropdown-sub-item"
                            onClick={handleNav}
                          >
                            All-products
                          </Link>
                          <Link
                            href="/All-store-management/Store-Product"
                            className="store-dropdown-sub-item"
                            onClick={handleNav}
                          >
                            Store Products
                          </Link>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Orders */}
          <Link
            href="/All-store-management/Orders"
            className={`store-nav-item ${isActive("/All-store-management/Orders") ? "active" : ""}`}
            onClick={handleNav}
          >
            <i className="bi bi-cart-check"></i>
            <span>Orders</span>
          </Link>
        </nav>
      </aside>
    </>
  );
}
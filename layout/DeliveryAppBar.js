"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import "./DeliverySidebar.css";

export default function DeliveryHeadSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);

  // Auto‑open orders dropdown when on orders pages
  useEffect(() => {
    if (
      pathname.startsWith("/All-store-management/All-Orders") ||
      pathname.startsWith("/All-store-management/Order-Requests") ||
      pathname.startsWith("/All-store-management/Orders")
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
  const toggleOrders = () => setOrdersOpen((prev) => !prev);
  const handleNav = () => {
    if (isMobile) setSidebarOpen(false);
  };
  const handleLogout = () => {
    window.location.href = "/login";
  };

  // Menu items
  const mainLinks = [
    {
      label: "Delivery Dashboard",
      href: "/All-store-management/delivery-dashboard",
      icon: "bi-speedometer2",
    },
    {
      label: "Delivery Boys",
      href: "/All-store-management/delivery-boys",
      icon: "bi-people",
    },
  ];

  const orderSubLinks = [
    { label: "All Orders", href: "/All-store-management/All-Orders" },
    { label: "Pending Requests", href: "/All-store-management/Order-Requests" },
  ];

  const isActive = (path) => pathname === path;
  const isSubActive = (href) => pathname === href;

  const dropdownVariants = {
    hidden: { height: 0, opacity: 0, transition: { duration: 0.2, ease: "easeInOut" } },
    visible: { height: "auto", opacity: 1, transition: { duration: 0.2, ease: "easeOut" } },
  };

  return (
    <>
      {/* Mobile menu button */}
      <button className="delivery-mobile-menu-btn" onClick={toggleSidebar}>
        <i className={`bi ${sidebarOpen ? "bi-x-lg" : "bi-list"}`}></i>
      </button>

      <aside className={`delivery-sidebar ${sidebarOpen ? "" : "delivery-closed"}`}>
        <div className="delivery-sidebar-header">
          <div className="delivery-logo-circle">
            <img src="/images/logo.webp" alt="Logo" className="delivery-logo-img" />
          </div>
          <h2 className="delivery-logo-text">DELIVERY HUB</h2>
        </div>

        <nav className="delivery-sidebar-nav">
          {/* Main links */}
          {mainLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`delivery-nav-item ${isActive(link.href) ? "active" : ""}`}
              onClick={handleNav}
            >
              <i className={`bi ${link.icon}`}></i>
              <span>{link.label}</span>
            </Link>
          ))}

          {/* Orders Dropdown */}
          <div className="delivery-dropdown-parent">
            <div className="delivery-dropdown-header-wrapper">
              <button
                className="delivery-dropdown-main-link"
                onClick={toggleOrders}
                style={{ position: "relative" }}
              >
                <i className="bi bi-cart-check"></i>
                <span>Orders</span>
              </button>
              <button className="delivery-chevron-toggle" onClick={toggleOrders}>
                <i className={`bi bi-chevron-${ordersOpen ? "up" : "down"}`}></i>
              </button>
            </div>

            <AnimatePresence>
              {ordersOpen && (
                <motion.div
                  className="delivery-dropdown-menu"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={dropdownVariants}
                  style={{ overflow: "hidden", display: "block" }}
                >
                  {orderSubLinks.map((sub) => (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      className={`delivery-dropdown-sub-item ${isSubActive(sub.href) ? "active" : ""}`}
                      onClick={handleNav}
                    >
                      <i className="bi bi-circle"></i> {sub.label}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        {/* Logout Button */}
        <div className="delivery-sidebar-footer">
          <button onClick={handleLogout} className="delivery-logout-btn">
            <i className="bi bi-box-arrow-right"></i>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
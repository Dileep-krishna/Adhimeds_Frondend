"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./super-admin.css";

export default function SuperAdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth <= 768) {
        setSidebarOpen(false); // close sidebar by default on mobile
      } else {
        setSidebarOpen(true); // open on desktop
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      document.body.classList.add("sidebar-open");
    } else {
      document.body.classList.remove("sidebar-open");
    }
    return () => document.body.classList.remove("sidebar-open");
  }, [sidebarOpen, isMobile]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const menuItems = [
    { name: "Dashboard", path: "/super-admin/dashboard", icon: "bi-speedometer2" },
    { name: "Order Management", path: "/super-admin/orders", icon: "bi-cart-check" },
    { name: "Store Management", path: "/super-admin/store-managment", icon: "bi-shop" },
    { name: "Delivery Boys", path: "/super-admin/delivery-boys", icon: "bi-truck" },
    { name: "Staff Management", path: "/super-admin/staff", icon: "bi-people" },
    { name: "Notifications", path: "/super-admin/notifications", icon: "bi-bell" },
    { name: "Reports", path: "/super-admin/reports", icon: "bi-file-text" },
    { name: "Settings", path: "/super-admin/settings", icon: "bi-gear" },
    { name: "Category Management", path: "/super-admin/category-managment", icon: "bi-tags" },
    { name: "Product Management", path: "/super-admin/product-managment", icon: "bi-box-seam" },
  ];

  return (
    <div className="super-admin-layout">
      {/* Mobile hamburger button */}
      <button className="mobile-menu-btn" onClick={toggleSidebar}>
        <i className={`bi ${sidebarOpen ? "bi-x-lg" : "bi-list"}`}></i>
      </button>

      <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <h2 className="logo">ADHIMEDS</h2>
          {/* Toggle button visible only on desktop */}
          {!isMobile && (
            <button className="toggle-btn" onClick={toggleSidebar}>
              <i className={`bi ${sidebarOpen ? "bi-chevron-left" : "bi-chevron-right"}`}></i>
            </button>
          )}
        </div>
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`nav-item ${pathname === item.path ? "active" : ""}`}
              onClick={() => isMobile && setSidebarOpen(false)} // close sidebar after navigation on mobile
            >
              <i className={`bi ${item.icon}`}></i>
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="logout-btn">
            <i className="bi bi-box-arrow-right"></i>
            <span>Logout</span>
          </button>
        </div>
      </aside>
      <main className={`main-content ${!isMobile && !sidebarOpen ? "expanded" : ""}`}>
        {children}
      </main>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./layout.css";

export default function VendorLayout({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size and update state
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(true); // Desktop: keep sidebar open
      else setSidebarOpen(false); // Mobile: start closed
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMobile, sidebarOpen]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const navItems = [
    { name: "Dashboard", path: "/vendor/dashboard" },
    { name: "Categories", path: "/vendor/categories" },
    { name: "Products", path: "/vendor/products" },
    { name: "Orders", path: "/vendor/orders" },
    { name: "Reports", path: "/vendor/reports" },
  ];

  return (
    <div className="vendor-layout">
      {/* Mobile hamburger button */}
      <button className="mobile-menu-btn" onClick={toggleSidebar}>
        <i className={`bi ${sidebarOpen ? "bi-x-lg" : "bi-list"}`}></i>
      </button>

      {/* Sidebar with responsive class */}
      <aside className={`vendor-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h4 className="sidebar-logo">Vendor</h4>
        </div>
        <ul className="sidebar-nav">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                href={item.path}
                className={`sidebar-link ${pathname === item.path ? "active" : ""}`}
                onClick={() => isMobile && setSidebarOpen(false)} // close sidebar after navigation on mobile
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </aside>

      {/* Main content */}
      <main className="vendor-content">{children}</main>
    </div>
  );
}
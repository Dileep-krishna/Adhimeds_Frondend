"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./super-admin.css";
import { useRouter } from "next/navigation";
export default function SuperAdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState({});
  const pathname = usePathname();
  const router = useRouter();
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

  // const toggleDropdown = (key) => {
  //   setOpenDropdowns((prev) => ({ ...prev, [key]: !prev[key] }));
  // };
  const toggleMainDropdown = () => {
    setOpenDropdowns((prev) => ({
      main: !prev.main,
      staffMain: false,
      storeMain: false,
      Products: false,
      "Product Setup": false,
      "Product Operation": false,
    }));
  };

  const closeAllDropdowns = () => {
    setOpenDropdowns({});
  };

  // ================= MENUS =================

  const mainMenuItems = [
    { name: "Dashboard", path: "/super-admin/dashboard", icon: "bi-speedometer2" },
    { name: "Order Management", path: "/super-admin/orders", icon: "bi-cart-check" },


    { name: "Delivery Boys", path: "/super-admin/delivery-boys", icon: "bi-truck" },
    { name: "Notifications", path: "/super-admin/notifications", icon: "bi-bell" },
    // { name: "Category Management", path: "/super-admin/category-managment", icon: "bi-tags" },
    { name: "Reports", path: "/super-admin/reports", icon: "bi-file-text" },
    { name: "Settings", path: "/super-admin/settings", icon: "bi-gear" },

  ];


  const beforeProductItems = mainMenuItems.slice(0, 2); // Dashboard + Orders
  const afterProductItems = mainMenuItems.slice(2);     // remaining pages

  const productMenu = [
    {
      name: "Products Home",
      icon: "bi-box",
      path: "/super-admin/product-managment", // 👈 MAIN NAVIGATION
      children: [
        { name: "All Products", path: "/super-admin/product-managment/products/all-product" },
        { name: "Add Product", path: "/super-admin/product-managment/products/add-product" },
      ],
    },
    {
      name: "Product Setup",
      icon: "bi-sliders",
      children: [
        { name: "Category", path: "/super-admin/product-managment/product-setup/category" },
        { name: "Brand", path: "/super-admin/product-managment/product-setup/Brand" },
        { name: "Colors", path: "/super-admin/product-managment/product-setup/Colors" },
        { name: "Attribute", path: "/super-admin/product-managment/product-setup/Attribute" },
        { name: "Size Guide", path: "/super-admin/product-managment/product-setup/size-guide" },
        { name: "Warranty", path: "/super-admin/product-managment/product-setup/warranty" },
        { name: "Notes", path: "/super-admin/product-managment/product-setup/notes" },
      ],
    },
    {
      name: "Product Operation",
      icon: "bi-gear-wide-connected",
      children: [
        { name: "Product Reviews", path: "/super-admin/bulk-import" },
        { name: "Smart Bar", path: "/super-admin/bulk-import" },
        { name: "Custom Label", path: "/super-admin/bulk-import" },
        { name: "Bulk Import", path: "/super-admin/bulk-import" },
        { name: "Bulk Export", path: "/super-admin/bulk-import" },
      ],
    },
  ];

  const staffMenu = [
    { name: "All Staff", path: "/super-admin/staff" },
    { name: "Roles & Permission", path: "/super-admin/staff/permissions" },
  ];

  const storeMenu = [
    { name: "All Stores", path: "/super-admin/store-managment" },
    { name: "Add Store", path: "/super-admin/store-managment/add" },
  ];

  const isProductActive = pathname.includes("/product");
  const isStaffActive = pathname.includes("/staff");

  const renderMainLink = (item) => (
    <Link
      key={item.path}
      href={item.path}
      className={`nav-item ${pathname === item.path ? "active" : ""}`}
      onClick={closeAllDropdowns}
    >
      <i className={`bi ${item.icon}`}></i>
      <span>{item.name}</span>
    </Link>
  );


  return (
    <div className="super-admin-layout">
      {/* MOBILE BUTTON */}
      <button className="mobile-menu-btn" onClick={toggleSidebar}>
        <i className={`bi ${sidebarOpen ? "bi-x-lg" : "bi-list"}`}></i>
      </button>

      {/* SIDEBAR */}
      <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <h2 className="logo">ADHIMEDS</h2>
        </div>

        <nav className="sidebar-nav">
          {/* TOP ITEMS */}
          {beforeProductItems.map(renderMainLink)}

          {/* ================= PRODUCT ================= */}
          <div className={`dropdown-parent ${isProductActive ? "active-parent" : ""}`}>
            <div className="dropdown-header-wrapper">

              {/* ✅ MAIN PRODUCT BUTTON */}
              <button
                className="dropdown-main-link"
                onClick={() => {
                  setOpenDropdowns((prev) => {
                    const isOpen = prev.main;

                    if (isOpen) {
                      return {
                        main: false,
                        Products: false,
                        "Product Setup": false,
                        "Product Operation": false,
                      };
                    }

                    return {
                      main: true,
                      Products: false,
                      "Product Setup": false,
                      "Product Operation": false,
                    };
                  });
                }}
              >
                <i className="bi bi-box"></i>
                <span>Product Management</span>
              </button>

              {/* chevron toggle */}
              <button
                className="chevron-toggle"
                onClick={toggleMainDropdown}
              >
                <i className={`bi bi-chevron-${openDropdowns.main ? "up" : "down"}`}></i>
              </button>

            </div>

            {/* ✅ SUB MENU */}
            <div className={`dropdown-menu ${openDropdowns.main ? "show" : ""}`}>
              {productMenu.map((menu, index) => (
                <div key={index} className="nested-dropdown">

                  <div
                    className="dropdown-item"
                    onClick={() => {
                      if (menu.path) {
                        router.push(menu.path);
                      }

                      setOpenDropdowns(() => ({
                        main: true, // keep parent open
                        Products: false,
                        "Product Setup": false,
                        "Product Operation": false,
                        [menu.name]: true, // ✅ ONLY ONE OPEN
                      }));
                    }}
                  >
                    <span>
                      <i className={`bi ${menu.icon}`}></i> {menu.name}
                    </span>

                    <i className={`bi bi-chevron-${openDropdowns[menu.name] ? "up" : "down"}`}></i>
                  </div>

                  {/* SUB CHILDREN */}
                  <div className={`nested-menu ${openDropdowns[menu.name] ? "show" : ""}`}>
                    {menu.children.map((sub, i) => (
                      <Link
                        key={i}
                        href={sub.path}
                        className={`dropdown-sub-item ${pathname === sub.path ? "active" : ""
                          }`}
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>

                </div>
              ))}
            </div>
          </div>

          {/* ================= STAFF ================= */}
          <div className={`dropdown-parent ${isStaffActive ? "active-parent" : ""}`}>
            <div className="dropdown-header-wrapper">
              <button
                className="dropdown-main-link"
                onClick={() =>
                  setOpenDropdowns((prev) => ({
                    staffMain: !prev.staffMain,
                    main: false,
                  }))
                }
              >
                <i className="bi bi-people"></i>
                <span>Staff Management</span>
              </button>

              <button
                className="chevron-toggle"
                onClick={() => toggleDropdown("staffMain")}
              >
                <i className={`bi bi-chevron-${openDropdowns.staffMain ? "up" : "down"}`}></i>
              </button>
            </div>

            <div className={`dropdown-menu ${openDropdowns.staffMain ? "show" : ""}`}>
              {staffMenu.map((item, i) => (
                <Link
                  key={i}
                  href={item.path}
                  className={`dropdown-sub-item ${pathname === item.path ? "active" : ""}`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          {/* ================= STORE MANAGEMENT ================= */}
          <div className={`dropdown-parent ${pathname.includes("/store-management") ? "active-parent" : ""}`}>
            <div className="dropdown-header-wrapper">

              <button
                className="dropdown-main-link"
                onClick={() =>
                  setOpenDropdowns((prev) => {
                    const isOpen = prev.storeMain;

                    // toggle store dropdown
                    if (isOpen) {
                      return { storeMain: false };
                    }

                    // open store and close others
                    return {
                      storeMain: true,
                      main: false,
                      staffMain: false,
                    };
                  })
                }
              >
                <i className="bi bi-shop"></i>
                <span>Store Management</span>
              </button>

              <button
                className="chevron-toggle"
                onClick={() =>
                  setOpenDropdowns((prev) => ({
                    storeMain: !prev.storeMain,
                  }))
                }
              >
                <i className={`bi bi-chevron-${openDropdowns.storeMain ? "up" : "down"}`}></i>
              </button>
            </div>

            <div className={`dropdown-menu ${openDropdowns.storeMain ? "show" : ""}`}>
              {storeMenu.map((item, i) => (
                <Link
                  key={i}
                  href={item.path}
                  className={`dropdown-sub-item ${pathname === item.path ? "active" : ""}`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* BOTTOM ITEMS */}
          {afterProductItems.map(renderMainLink)}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">{children}</main>
    </div>
  );
}
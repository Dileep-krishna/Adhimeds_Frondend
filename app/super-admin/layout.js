"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import "./super-admin.css";

export default function SuperAdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState({});
  const pathname = usePathname();
  const router = useRouter();

  // Mobile responsiveness
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setSidebarOpen((prev) => {
        if (mobile) return false;
        return prev ?? true;
      });
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Keep dropdowns open based on route
// ✅ FIXED: Keep product, staff, store, delivery dropdowns open when inside their sections
useEffect(() => {
  const isInProduct = pathname.includes("/product-managment");
  const isInStaff = pathname.includes("/staff");
  const isInStore = pathname.includes("/store-managment");
  const isInDelivery = pathname.includes("/delivery-boys");

  if (!isInProduct) {
    // Outside product management – close product dropdowns only
    setOpenDropdowns((prev) => ({
      ...prev,
      main: false,
      Products: false,
      "Product Setup": false,
      "Product Operation": false,
      Brand: false,
      Notes: false,
      "Size Guide": false,
      // Keep staff/store/delivery open if we are inside their sections
      staffMain: isInStaff ? prev.staffMain : false,
      storeMain: isInStore ? prev.storeMain : false,
      deliveryBoysMain: isInDelivery ? prev.deliveryBoysMain : false,
    }));
  } else if (!pathname.includes("/product-managment/product-setup")) {
    // Inside product management but not in product setup – close only setup sub‑menus
    setOpenDropdowns((prev) => ({
      ...prev,
      Brand: false,
      Notes: false,
      "Size Guide": false,
    }));
  }
}, [pathname]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const closeAllDropdowns = () => {
    setOpenDropdowns({
      main: false,
      staffMain: false,
      storeMain: false,
      deliveryBoysMain: false,
      Products: false,
      "Product Setup": false,
      "Product Operation": false,
      Brand: false,
      Notes: false,
      "Size Guide": false,
    });
  };

  const toggleMainDropdown = () => {
    setOpenDropdowns((prev) => ({
      main: !prev.main,
      staffMain: false,
      storeMain: false,
      deliveryBoysMain: false,
      Products: false,
      "Product Setup": false,
      "Product Operation": false,
      Brand: false,
      Notes: false,
      "Size Guide": false,
    }));
  };

  // ================= MENU DEFINITIONS =================
  const directMenuItems = [
    { name: "DashBoard", path: "/super-admin/dashboard", icon: "bi-speedometer2" },
    { name: "Order Management", path: "/super-admin/orders", icon: "bi-cart-check" },
    { name: "Notifications", path: "/super-admin/notifications", icon: "bi-bell" },
    { name: "Reports", path: "/super-admin/reports", icon: "bi-file-text" },
    { name: "Settings", path: "/super-admin/settings", icon: "bi-gear" },
  ];

  const productMenu = [
    {
      name: "Products Home",
      icon: "bi-box",
      path: "/super-admin/product-managment",
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
        {
          name: "Brand",
          children: [
            { name: "All Brands", path: "/super-admin/product-managment/product-setup/Brand" },
            { name: "Add Brand", path: "/super-admin/product-managment/product-setup/Brand/addBrand" },
            { name: "Brand Bulk Import", path: "/super-admin/product-managment/product-setup/Brand/brand-bulk-import" },
          ],
        },
        { name: "Colors", path: "/super-admin/product-managment/product-setup/colors" },
        { name: "Attribute", path: "/super-admin/product-managment/product-setup/Attribute" },
        {
          name: "Size Guide",
          children: [
            { name: "All Size Guide", path: "/super-admin/product-managment/product-setup/size-guide/size-chart" },
            { name: "Measurement Points", path: "/super-admin/product-managment/product-setup/size-guide/MeasurementPoints" },
          ],
        },
        { name: "Warranty", path: "/super-admin/product-managment/product-setup/warranty" },
        {
          name: "Notes",
          children: [
            { name: "All Notes", path: "/super-admin/product-managment/product-setup/notes" },
            { name: "Add Note", path: "/super-admin/product-managment/product-setup/notes/addNote" },
          ],
        },
      ],
    },
    {
      name: "Product Operation",
      icon: "bi-gear-wide-connected",
      children: [
{ name: "Product Review", path: "/super-admin/product-managment/product-operation/product-review" },
        { name: "Smart Bar", path: "/super-admin/product-managment/product-operation/smart-bar" },
        { name: "Custom Label", path: "/super-admin/product-managment/product-operation/custom-label" },
        { name: "Bulk Import", path: "/super-admin/product-managment/product-operation/bulk-import" },
        { name: "Bulk Export", path: "/super-admin/product-managment/product-operation/bulk-export" },
      ],
    },
  ];

  const staffMenu = [
    { name: "All Staff", path: "/super-admin/staff" },
    { name: "Roles & Permission", path: "/super-admin/staff/RoleDashboard" },
  ];

  const storeMenu = [
    { name: "All Stores", path: "/super-admin/store-managment" },
    { name: "Add Store", path: "/super-admin/store-managment/add" },
  ];

  const deliveryBoysMenu = [
    { name: "All Delivery Boys", path: "/super-admin/delivery-boys" },
    { name: "Add Delivery Boy", path: "/super-admin/delivery-boys/delivery-boysAdd" },
  ];

  const isProductActive = pathname.includes("/product");
  const isStaffActive = pathname.includes("/staff");
  const isStoreActive = pathname.includes("/store-managment");
  const isDeliveryActive = pathname.includes("/delivery-boys");

  const renderDirectLink = (item) => (
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

  const dropdownVariants = {
    hidden: { height: 0, opacity: 0, transition: { duration: 0.3, ease: "easeInOut" } },
    visible: { height: "auto", opacity: 1, transition: { duration: 0.4, ease: "easeInOut" } }
  };

  const nestedVariants = {
    hidden: { height: 0, opacity: 0, transition: { duration: 0.25, ease: "easeInOut" } },
    visible: { height: "auto", opacity: 1, transition: { duration: 0.3, ease: "easeInOut" } }
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

      <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
  <div className="sidebar-header">
  {/* 🔵 ROUND LOGO with image */}
  <div className="logo-circle">
    <img src="/images/logo.webp" alt="ADHIMEDS Logo" className="logo-img" />
  </div>
  <h2 className="logo-text">ADHIMEDS</h2>
</div>

        <nav className="sidebar-nav">
          {renderDirectLink(directMenuItems[0])}

          <div className="dropdown-parent">
            <div className="dropdown-header-wrapper">
              <button className="dropdown-main-link" onClick={toggleMainDropdown}>
                <i className="bi bi-box"></i>
                <span>Product Management</span>
              </button>
              <button className="chevron-toggle" onClick={toggleMainDropdown}>
                <i className={`bi bi-chevron-${openDropdowns.main ? "up" : "down"}`}></i>
              </button>
            </div>

            <AnimatePresence>
              {openDropdowns.main && (
                <motion.div
                  className="dropdown-menu show"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={dropdownVariants}
                  style={{ display: "block", overflow: "hidden" }}
                >
                  {productMenu.map((menu, idx) => (
                    <div key={idx} className="nested-dropdown">
                      <div
                        className="dropdown-item"
                        onClick={() => {
                          setOpenDropdowns((prev) => ({ ...prev, Brand: false, Notes: false, "Size Guide": false }));
                          if (menu.path) router.push(menu.path);
                          setOpenDropdowns((prev) => ({
                            main: true,
                            [menu.name]: !prev[menu.name],
                          }));
                        }}
                      >
                        <span><i className={`bi ${menu.icon}`}></i> {menu.name}</span>
                        <i className={`bi bi-chevron-${openDropdowns[menu.name] ? "up" : "down"}`}></i>
                      </div>
                      <AnimatePresence>
                        {openDropdowns[menu.name] && (
                          <motion.div
                            className="nested-menu show"
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            variants={nestedVariants}
                            style={{ overflow: "hidden" }}
                          >
                            {menu.children.map((sub, i) => (
                              <div key={i}>
                                {sub.children ? (
                                  <>
                                    <div
                                      className="dropdown-sub-item"
                                      onClick={() => {
                                        setOpenDropdowns((prev) => {
                                          const newState = { ...prev };
                                          if (sub.name === "Brand") {
                                            newState.Brand = !prev.Brand;
                                            newState.Notes = false;
                                            newState["Size Guide"] = false;
                                          } else if (sub.name === "Notes") {
                                            newState.Notes = !prev.Notes;
                                            newState.Brand = false;
                                            newState["Size Guide"] = false;
                                          } else if (sub.name === "Size Guide") {
                                            newState["Size Guide"] = !prev["Size Guide"];
                                            newState.Brand = false;
                                            newState.Notes = false;
                                          }
                                          return newState;
                                        });
                                      }}
                                    >
                                      {sub.name}
                                    </div>
                                    <AnimatePresence>
                                      {openDropdowns[sub.name] && (
                                        <motion.div
                                          className="nested-menu show"
                                          initial="hidden"
                                          animate="visible"
                                          exit="hidden"
                                          variants={nestedVariants}
                                          style={{ overflow: "hidden" }}
                                        >
                                          {sub.children.map((child, j) => (
                                            <Link
                                              key={j}
                                              href={child.path}
                                              className={`dropdown-sub-item ms-3 ${pathname === child.path ? "active" : ""}`}
                                            >
                                              {child.name}
                                            </Link>
                                          ))}
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </>
                                ) : (
                                  <Link
                                    href={sub.path}
                                    className={`dropdown-sub-item ${pathname === sub.path ? "active" : ""}`}
                                  >
                                    {sub.name}
                                  </Link>
                                )}
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="dropdown-parent">
            <div className="dropdown-header-wrapper">
              <button
                className="dropdown-main-link"
                onClick={() => setOpenDropdowns((prev) => ({ staffMain: !prev.staffMain, main: false, storeMain: false, deliveryBoysMain: false }))}
              >
                <i className="bi bi-people"></i>
                <span>Staff Management</span>
              </button>
              <button className="chevron-toggle" onClick={() => setOpenDropdowns((prev) => ({ staffMain: !prev.staffMain }))}>
                <i className={`bi bi-chevron-${openDropdowns.staffMain ? "up" : "down"}`}></i>
              </button>
            </div>
            <AnimatePresence>
              {openDropdowns.staffMain && (
                <motion.div
                  className="dropdown-menu show"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={dropdownVariants}
                  style={{ display: "block", overflow: "hidden" }}
                >
                  {staffMenu.map((item, i) => (
                    <Link key={i} href={item.path} className={`dropdown-sub-item ${pathname === item.path ? "active" : ""}`}>
                      {item.name}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="dropdown-parent">
            <div className="dropdown-header-wrapper">
              <button
                className="dropdown-main-link"
                onClick={() => setOpenDropdowns((prev) => ({ storeMain: !prev.storeMain, main: false, staffMain: false, deliveryBoysMain: false }))}
              >
                <i className="bi bi-shop"></i>
                <span>Store Management</span>
              </button>
              <button className="chevron-toggle" onClick={() => setOpenDropdowns((prev) => ({ storeMain: !prev.storeMain }))}>
                <i className={`bi bi-chevron-${openDropdowns.storeMain ? "up" : "down"}`}></i>
              </button>
            </div>
            <AnimatePresence>
              {openDropdowns.storeMain && (
                <motion.div
                  className="dropdown-menu show"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={dropdownVariants}
                  style={{ display: "block", overflow: "hidden" }}
                >
                  {storeMenu.map((item, i) => (
                    <Link key={i} href={item.path} className={`dropdown-sub-item ${pathname === item.path ? "active" : ""}`}>
                      {item.name}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="dropdown-parent">
            <div className="dropdown-header-wrapper">
              <button
                className="dropdown-main-link"
                onClick={() => setOpenDropdowns((prev) => ({ deliveryBoysMain: !prev.deliveryBoysMain, main: false, staffMain: false, storeMain: false }))}
              >
                <i className="bi bi-truck"></i>
                <span>Delivery Boys</span>
              </button>
              <button className="chevron-toggle" onClick={() => setOpenDropdowns((prev) => ({ deliveryBoysMain: !prev.deliveryBoysMain }))}>
                <i className={`bi bi-chevron-${openDropdowns.deliveryBoysMain ? "up" : "down"}`}></i>
              </button>
            </div>
            <AnimatePresence>
              {openDropdowns.deliveryBoysMain && (
                <motion.div
                  className="dropdown-menu show"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={dropdownVariants}
                  style={{ display: "block", overflow: "hidden" }}
                >
                  {deliveryBoysMenu.map((item, i) => (
                    <Link key={i} href={item.path} className={`dropdown-sub-item ${pathname === item.path ? "active" : ""}`}>
                      {item.name}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {directMenuItems.slice(1).map(renderDirectLink)}
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
            // 🔵 Add extra spacing when on dashboard page
            className={pathname === "/super-admin/dashboard" ? "dashboard-content" : ""}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
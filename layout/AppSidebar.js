"use client";

import React, { useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  Menu,
  MenuItem,
  SubMenu,
  ProSidebarProvider,
  useProSidebar,
} from "react-pro-sidebar";
import { useSidebar } from "../context/SidebarContext";
import {
  GridIcon,
  CalenderIcon,
  UserCircleIcon,
} from "../icons/index";

// ---------- Navigation Data ----------
const productManagement = {
  name: "Product Management",
  icon: <i className="bi bi-box"></i>,
  subItems: [
    {
      name: "Products Home",
      icon: <i className="bi bi-box"></i>,
      subItems: [
        { name: "All Products", path: "/super-admin/product-managment/products/all-product" },
        { name: "Add Product", path: "/super-admin/product-managment/products/add-product" },
      ],
    },
    {
      name: "Product Setup",
      icon: <i className="bi bi-sliders"></i>,
      subItems: [
        { name: "Category", path: "/super-admin/product-managment/product-setup/category" },
        {
          name: "Brand",
          subItems: [
            { name: "All Brands", path: "/super-admin/product-managment/product-setup/Brand" },
            { name: "Add Brand", path: "/super-admin/product-managment/product-setup/Brand/addBrand" },
            { name: "Brand Bulk Import", path: "/super-admin/product-managment/product-setup/Brand/brand-bulk-import" },
          ],
        },
        { name: "Colors", path: "/super-admin/product-managment/product-setup/colors" },
        { name: "Attribute", path: "/super-admin/product-managment/product-setup/Attribute" },
        {
          name: "Size Guide",
          subItems: [
            { name: "All Size Guide", path: "/super-admin/product-managment/product-setup/size-guide/size-chart" },
            { name: "Measurement Points", path: "/super-admin/product-managment/product-setup/size-guide/MeasurementPoints" },
          ],
        },
        { name: "Warranty", path: "/super-admin/product-managment/product-setup/warranty" },
        {
          name: "Notes",
          subItems: [
            { name: "All Notes", path: "/super-admin/product-managment/product-setup/notes" },
            { name: "Add Note", path: "/super-admin/product-managment/product-setup/notes/addNote" },
          ],
        },
      ],
    },
    {
      name: "Product Operation",
      icon: <i className="bi bi-gear-wide-connected"></i>,
      subItems: [
        { name: "Product Review", path: "/super-admin/product-managment/product-operation/product-review" },
        { name: "Smart Bar", path: "/super-admin/product-managment/product-operation/smart-bar" },
        { name: "Custom Label", path: "/super-admin/product-managment/product-operation/custom-label" },
        { name: "Bulk Import", path: "/super-admin/product-managment/product-operation/bulk-import" },
        { name: "Bulk Export", path: "/super-admin/product-managment/product-operation/bulk-export" },
      ],
    },
  ],
};

const staffManagement = {
  name: "Staff Management",
  icon: <i className="bi bi-people"></i>,
  subItems: [
    { name: "All Staff", path: "/super-admin/staff" },
    { name: "Roles & Permission", path: "/super-admin/staff/RoleDashboard" },
  ],
};

const storeManagement = {
  name: "Store Management",
  icon: <i className="bi bi-shop"></i>,
  subItems: [
    { name: "All Stores", path: "/super-admin/store-managment" },
    { name: "Add Store", path: "/super-admin/store-managment/add" },
  ],
};

const deliveryBoys = {
  name: "Delivery Boys",
  icon: <i className="bi bi-truck"></i>,
  subItems: [
    { name: "All Delivery Boys", path: "/super-admin/delivery-boys" },
    { name: "Add Delivery Boy", path: "/super-admin/delivery-boys/delivery-boysAdd" },
  ],
};

// Order Management moved to the bottom (will be inserted after deliveryBoys)
const orderManagement = {
  icon: <CalenderIcon />,
  name: "Order Management",
  path: "/super-admin/orders",
};

const navItems = [
  { icon: <GridIcon />, name: "Dashboard", path: "/super-admin/dashboard" },
  productManagement,
  staffManagement,
  storeManagement,
  deliveryBoys,
  orderManagement,           // moved here
  { icon: <UserCircleIcon />, name: "User Profile", path: "/profile" },
];

// Sidebar inner component
const SidebarContent = () => {
  const pathname = usePathname();
  const { isExpanded, isMobileOpen, isHovered } = useSidebar();
  const { collapseSidebar, collapsed } = useProSidebar();

  const shouldCollapse = useMemo(() => {
    if (isMobileOpen) return false;
    if (isHovered) return false;
    return !isExpanded;
  }, [isExpanded, isMobileOpen, isHovered]);

  useEffect(() => {
    collapseSidebar(shouldCollapse);
  }, [shouldCollapse, collapseSidebar]);

  const isActive = (path) => {
    if (!path) return false;
    return pathname === path || pathname.startsWith(path + "/");
  };

  // Logout handler (simple redirect or clear session)
  const handleLogout = () => {
    // Replace with your actual logout logic
    window.location.href = "/login";
  };

  const renderMenuItems = (items) => {
    return items.map((item) => {
      if (item.path) {
        // Leaf node – wrap name with span for dot marker
        return (
          <MenuItem
            key={item.name}
            active={isActive(item.path)}
            component={<Link href={item.path} />}
            icon={item.icon}
          >
            <span className="menu-item-with-dot">{item.name}</span>
          </MenuItem>
        );
      }
      if (item.subItems) {
        const isChildActive = (subs) => {
          return subs.some((sub) => {
            if (sub.path) return isActive(sub.path);
            if (sub.subItems) return isChildActive(sub.subItems);
            return false;
          });
        };
        const defaultOpen = isChildActive(item.subItems);
        return (
          <SubMenu key={item.name} label={item.name} icon={item.icon} defaultOpen={defaultOpen}>
            {renderMenuItems(item.subItems)}
          </SubMenu>
        );
      }
      return null;
    });
  };

  return (
    <Sidebar
      width="280px"
      collapsedWidth="90px"
      transitionDuration={300}
      className={isMobileOpen ? "mobile-open" : ""}
      rootStyles={{
        border: "none",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
      }}
    >
      {/* Logo + Text Section */}
      <div
        style={{
          padding: "20px 20px",
          marginBottom: "8px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
          <Image src="/images/logo.webp" alt="Logo" width={40} height={40} priority />
          {!collapsed && (
            <span
              style={{
                fontSize: "1.3rem",
                fontWeight: "700",
                color: "#0f172a",
                letterSpacing: "-0.5px",
                whiteSpace: "nowrap",
              }}
            >
              ADHIMEDICINE
            </span>
          )}
        </Link>
      </div>

      {/* Menu Area (scrollable) */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        <Menu
          menuItemStyles={{
            button: ({ active }) => {
              let className = "menu-item";
              if (active) className += " menu-item-active";
              else className += " menu-item-inactive";
              return { className };
            },
          }}
        >
          {renderMenuItems(navItems)}
        </Menu>
      </div>

      {/* Logout Button */}
      <div style={{ padding: "16px 20px", borderTop: "1px solid #e2e8f0", marginTop: "auto" }}>
        <button
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            width: "100%",
            padding: "10px 12px",
            borderRadius: "8px",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            transition: "background 0.2s",
            color: "#dc2626",
            fontWeight: "500",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#fef2f2")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <i className="bi bi-box-arrow-right" style={{ fontSize: "1.25rem" }}></i>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </Sidebar>
  );
};

const AppSidebar = () => {
  return (
    <ProSidebarProvider>
      <SidebarContent />
    </ProSidebarProvider>
  );
};

export default AppSidebar;
"use client";

import React, { useEffect, useMemo, useState, useCallback, memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import { useSidebar } from "../context/SidebarContext";
import {
  GridIcon,
  CalenderIcon,
  UserCircleIcon,
} from "../icons/index";
import "./AppSidebar.css";

// ---------- Navigation Data (full) ----------
const productManagement = {
  name: "Product Management",
  icon: <i className="bi bi-box"></i>,
  subItems: [
    {
      name: "Products Home",
      icon: <i className="bi bi-box"></i>,
      subItems: [
        {
          name: "All Products",
          icon: <i className="bi bi-box-seam"></i>,
          path: "/super-admin/product-managment/products/all-product",
        },
        {
          name: "Add Product",
          icon: <i className="bi bi-plus-circle"></i>,
          path: "/super-admin/product-managment/products/add-product",
        },
      ],
    },
    {
      name: "Product Setup",
      icon: <i className="bi bi-sliders"></i>,
      subItems: [
        {
          name: "Category",
          icon: <i className="bi bi-tags"></i>,
          path: "/super-admin/product-managment/product-setup/category",
        },
        {
          name: "Brand",
          icon: <i className="bi bi-tag"></i>,
          subItems: [
            {
              name: "All Brands",
              icon: <i className="bi bi-tag"></i>,
              path: "/super-admin/product-managment/product-setup/Brand",
            },
            {
              name: "Add Brand",
              icon: <i className="bi bi-plus-circle"></i>,
              path: "/super-admin/product-managment/product-setup/Brand/addBrand",
            },
            {
              name: "Brand Bulk Import",
              icon: <i className="bi bi-upload"></i>,
              path: "/super-admin/product-managment/product-setup/Brand/brand-bulk-import",
            },
          ],
        },
        {
          name: "Colors",
          icon: <i className="bi bi-palette"></i>,
          path: "/super-admin/product-managment/product-setup/colors",
        },
        {
          name: "Attribute",
          icon: <i className="bi bi-list-ul"></i>,
          path: "/super-admin/product-managment/product-setup/Attribute",
        },
        {
          name: "Size Guide",
          icon: <i className="bi bi-rulers"></i>,
          subItems: [
            {
              name: "All Size Guide",
              icon: <i className="bi bi-rulers"></i>,
              path: "/super-admin/product-managment/product-setup/size-guide/size-chart",
            },
            {
              name: "Measurement Points",
              icon: <i className="bi bi-arrows-expand"></i>,
              path: "/super-admin/product-managment/product-setup/size-guide/MeasurementPoints",
            },
          ],
        },
        {
          name: "Warranty",
          icon: <i className="bi bi-shield-check"></i>,
          path: "/super-admin/product-managment/product-setup/warranty",
        },
        {
          name: "Notes",
          icon: <i className="bi bi-sticky"></i>,
          subItems: [
            {
              name: "All Notes",
              icon: <i className="bi bi-sticky"></i>,
              path: "/super-admin/product-managment/product-setup/notes",
            },
            {
              name: "Add Note",
              icon: <i className="bi bi-plus-circle"></i>,
              path: "/super-admin/product-managment/product-setup/notes/addNote",
            },
          ],
        },
      ],
    },
    {
      name: "Product Operation",
      icon: <i className="bi bi-gear-wide-connected"></i>,
      subItems: [
        {
          name: "Product Review",
          icon: <i className="bi bi-star"></i>,
          path: "/super-admin/product-managment/product-operation/product-review",
        },
        {
          name: "Smart Bar",
          icon: <i className="bi bi-bar-chart"></i>,
          path: "/super-admin/product-managment/product-operation/smart-bar",
        },
        {
          name: "Custom Label",
          icon: <i className="bi bi-tag"></i>,
          path: "/super-admin/product-managment/product-operation/custom-label",
        },
        {
          name: "Bulk Import",
          icon: <i className="bi bi-upload"></i>,
          path: "/super-admin/product-managment/product-operation/bulk-import",
        },
        {
          name: "Bulk Export",
          icon: <i className="bi bi-download"></i>,
          path: "/super-admin/product-managment/product-operation/bulk-export",
        },
      ],
    },
  ],
};

const staffManagement = {
  name: "Staff Management",
  icon: <i className="bi bi-people"></i>,
  subItems: [
    {
      name: "All Staff",
      icon: <i className="bi bi-person-badge"></i>,
      path: "/super-admin/staff",
    },
    {
      name: "Roles & Permission",
      icon: <i className="bi bi-shield-lock"></i>,
      path: "/super-admin/staff/RoleDashboard",
    },
  ],
};

const storeManagement = {
  name: "Store Management",
  icon: <i className="bi bi-shop"></i>,
  subItems: [
    {
      name: "All Stores",
      icon: <i className="bi bi-shop"></i>,
      path: "/super-admin/store-managment",
    },
    {
      name: "Add Store",
      icon: <i className="bi bi-building-add"></i>,
      path: "/super-admin/store-managment/add",
    },
  ],
};

const deliveryBoys = {
  name: "Delivery Boys",
  icon: <i className="bi bi-truck"></i>,
  subItems: [
    {
      name: "All Delivery Boys",
      icon: <i className="bi bi-truck"></i>,
      path: "/super-admin/delivery-boys",
    },
    {
      name: "Add Delivery Boy",
      icon: <i className="bi bi-person-plus"></i>,
      path: "/super-admin/delivery-boys/delivery-boysAdd",
    },
  ],
};

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
  orderManagement,
  { icon: <UserCircleIcon />, name: "User Profile", path: "/profile" },
];

// ---------- Sidebar Component ----------
const SidebarContent = memo(() => {
  const pathname = usePathname();
  const { isExpanded, isMobileOpen, isHovered } = useSidebar();

  const [collapsed, setCollapsed] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 992);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const shouldCollapse = useMemo(() => {
    if (isMobile) return false;
    if (isMobileOpen) return false;
    if (isHovered) return false;
    return !isExpanded;
  }, [isExpanded, isMobileOpen, isHovered, isMobile]);

  useEffect(() => {
    setCollapsed(shouldCollapse);
  }, [shouldCollapse]);

  const isActive = useCallback(
    (path) => {
      if (!path) return false;
      return pathname === path || pathname.startsWith(path + "/");
    },
    [pathname]
  );

  const handleLogout = () => {
    window.location.href = "/login";
  };

  const handleSubMenuToggle = useCallback((key, isOpen) => {
    setExpandedKeys((prev) => {
      if (isOpen) {
        const parts = key.split(".");
        const ancestors = [];
        for (let i = 1; i <= parts.length; i++) {
          ancestors.push(parts.slice(0, i).join("."));
        }
        return ancestors;
      } else {
        return prev.filter((k) => !k.startsWith(key + ".") && k !== key);
      }
    });
  }, []);

  const renderMenuItems = useCallback(
    (items, parentKey = "") => {
      return items.map((item) => {
        const key = parentKey ? `${parentKey}.${item.name}` : item.name;

        if (item.path) {
          return (
            <MenuItem
              key={key}
              active={isActive(item.path)}
              component={<Link href={item.path} />}
              icon={item.icon}
            >
              {item.name}
            </MenuItem>
          );
        }
        if (item.subItems) {
          const isOpen = expandedKeys.includes(key);
          return (
            <SubMenu
              key={key}
              label={item.name}
              icon={item.icon}
              open={isOpen}
              onOpenChange={(isOpenNow) => handleSubMenuToggle(key, isOpenNow)}
            >
              {renderMenuItems(item.subItems, key)}
            </SubMenu>
          );
        }
        return null;
      });
    },
    [expandedKeys, handleSubMenuToggle, isActive]
  );

  // Auto-open active branch
  useEffect(() => {
    const findActiveBranch = (items, parentKey = "") => {
      for (const item of items) {
        const key = parentKey ? `${parentKey}.${item.name}` : item.name;
        if (item.path && isActive(item.path)) {
          const parts = key.split(".");
          const ancestors = [];
          for (let i = 1; i <= parts.length; i++) {
            ancestors.push(parts.slice(0, i).join("."));
          }
          return ancestors;
        }
        if (item.subItems) {
          const result = findActiveBranch(item.subItems, key);
          if (result) return result;
        }
      }
      return null;
    };

    const activeKeys = findActiveBranch(navItems);
    if (activeKeys) {
      setExpandedKeys(activeKeys);
    }
  }, [pathname, isActive]);

  const desktopWidth = collapsed ? "90px" : "280px";
  const mobileX = isMobileOpen ? 0 : "-100%";

  const menuItemStyles = {
    button: ({ active, level }) => {
      const base = {
        color: active ? "#0f172a" : "#64748b",
        backgroundColor: active ? "#f1f5f9" : "transparent",
        borderRadius: "12px",
        margin: "2px 8px",
        padding: "10px 16px",
        transition: "all 0.2s ease",
        fontWeight: level === 0 ? "500" : "400",
        borderLeft: active ? "3px solid #3b82f6" : "3px solid transparent",
        "&:hover": {
          backgroundColor: "#f8fafc",
          color: "#0f172a",
        },
      };
      if (level === 1) {
        return { ...base, paddingLeft: "36px" };
      }
      if (level === 2) {
        return { ...base, paddingLeft: "52px" };
      }
      return base;
    },
    subMenuContent: ({ level }) => ({
      backgroundColor: "transparent",
      marginLeft: level === 0 ? "0px" : "8px",
      borderLeft: "1px solid #e2e8f0",
    }),
  };

  return (
    <motion.div
      className={`sidebar-wrapper ${isMobile ? "mobile" : ""}`}
      animate={{
        ...(isMobile
          ? { x: mobileX }
          : { width: desktopWidth }),
      }}
      transition={{
        duration: 0.3,
        ease: "easeInOut",
      }}
    >
      <Sidebar
        width="280px"
        collapsedWidth="90px"
        className={isMobileOpen ? "mobile-open" : ""}
        rootStyles={{
          border: "none",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          width: "100%",
          background: "transparent",
        }}
        menuItemStyles={menuItemStyles}
        collapsed={collapsed}
      >
        {/* Logo Section */}
        <div className="sidebar-logo">
          <Link href="/" className="sidebar-logo-link">
            <div className="sidebar-logo-avatar">
              <Image
                src="/images/logo.webp"
                alt="Logo"
                width={48}
                height={48}
                priority
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
              />
            </div>
            {(!collapsed || isMobile) && (
              <span className="sidebar-logo-text">ADHIMEDICINE</span>
            )}
          </Link>
        </div>

        {/* Menu Area */}
        <div className="sidebar-menu-area">
          <Menu>{renderMenuItems(navItems)}</Menu>
        </div>

        {/* Logout Button */}
        <div className="sidebar-logout">
          <button
            onClick={handleLogout}
            className="sidebar-logout-btn"
          >
            <i className="bi bi-box-arrow-right sidebar-logout-icon"></i>
            {(!collapsed || isMobile) && <span>Logout</span>}
          </button>
        </div>
      </Sidebar>
    </motion.div>
  );
});

SidebarContent.displayName = "SidebarContent";

const AppSidebar = () => {
  return <SidebarContent />;
};

export default AppSidebar;
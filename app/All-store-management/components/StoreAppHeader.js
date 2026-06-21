"use client";

import NotificationDropdown from "@/components/header/NotificationDropdown";
import UserDropdown from "@/components/header/UserDropdown";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

const StoreAppHeader = ({ isSidebarOpen, onToggleSidebar }) => {
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);

  const handleToggle = () => {
    onToggleSidebar(); // call the toggle function from parent
  };

  const toggleApplicationMenu = () => {
    setApplicationMenuOpen(!isApplicationMenuOpen);
  };

  return (
    <header className="sticky-top bg-white border-bottom shadow-sm">
      <div className="container-fluid px-3 px-lg-4">
        <div className="d-flex align-items-center justify-content-between py-2 py-lg-3">
          <div className="d-flex align-items-center gap-2">
            {/* Hamburger toggle */}
            <button
              className="btn btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center"
              onClick={handleToggle}
              style={{ width: "2.5rem", height: "2.5rem" }}
            >
              {isSidebarOpen ? (
                <i className="bi bi-x-lg fs-5"></i>
              ) : (
                <i className="bi bi-list fs-5"></i>
              )}
            </button>
            {/* Logo (mobile only) */}
            <Link href="/All-store-management/store-dashboard" className="d-lg-none">
              <Image width={154} height={32} src="/images/logo.webp" alt="Store Logo" />
            </Link>
          </div>

          <div className="d-flex align-items-center gap-2">
            {/* Three dots (mobile) */}
            <button
              onClick={toggleApplicationMenu}
              className="btn btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center d-lg-none"
              style={{ width: "2.5rem", height: "2.5rem" }}
            >
              <i className="bi bi-three-dots-vertical fs-5"></i>
            </button>

            {/* Notification bell (desktop) */}
            <div className="d-none d-lg-flex align-items-center gap-2">
              <NotificationDropdown />
            </div>
            {/* User dropdown (always visible) */}
            <UserDropdown />
          </div>
        </div>

        {/* Mobile dropdown for notifications */}
        {isApplicationMenuOpen && (
          <div className="d-lg-none mt-2 pb-2 border-top pt-2">
            <div className="d-flex justify-content-end">
              <NotificationDropdown />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default StoreAppHeader;
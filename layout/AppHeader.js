"use client";

import NotificationDropdown from "@/components/header/NotificationDropdown";
import UserDropdown from "@/components/header/UserDropdown";   // ← now using the updated component
import { useSidebar } from "@/context/SidebarContext";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

const AppHeader = () => {
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  const toggleApplicationMenu = () => {
    setApplicationMenuOpen(!isApplicationMenuOpen);
  };

  return (
    <header className="sticky-top bg-white border-bottom shadow-sm">
      <div className="container-fluid px-3 px-lg-4">
        <div className="d-flex align-items-center justify-content-between py-2 py-lg-3">
          <div className="d-flex align-items-center gap-2">
            <button
              className="btn btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center"
              onClick={handleToggle}
              style={{ width: "2.5rem", height: "2.5rem" }}
            >
              {isMobileOpen ? (
                <i className="bi bi-x-lg fs-5"></i>
              ) : (
                <i className="bi bi-list fs-5"></i>
              )}
            </button>
            <Link href="/" className="d-lg-none">
              <Image width={154} height={32} src="/images/logo.webp" alt="Logo" />
            </Link>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              onClick={toggleApplicationMenu}
              className="btn btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center d-lg-none"
              style={{ width: "2.5rem", height: "2.5rem" }}
            >
              <i className="bi bi-three-dots-vertical fs-5"></i>
            </button>

            <div className="d-none d-lg-flex align-items-center gap-2">
              <NotificationDropdown />
            </div>
            <UserDropdown />
          </div>
        </div>

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

export default AppHeader;
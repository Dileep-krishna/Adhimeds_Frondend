"use client"; // if you need client-side state

import { useState } from "react";
import StoreAppSidebar from "./components/StoreAppSidebar";
import StoreAppHeader from "./components/StoreAppHeader";
import "./components/StoreSidebar.css";

export default function StoreLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className="store-layout-container">
      <StoreAppSidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
      <div className="store-main-wrapper">
        <StoreAppHeader isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />
        <main className="store-main-content">{children}</main>
      </div>
    </div>
  );
}
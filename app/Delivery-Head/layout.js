"use client";

import { useState } from "react";
import DeliveryHeaderBar from "@/layout/DeliveryHeaderBar";
import DeliveryAppBar from "@/layout/DeliveryAppBar";
import Backdrop from "@/layout/Backdrop";
import "./delivery-layout.css";

export default function DeliveryHeadLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="delivery-layout-wrapper">
      <DeliveryAppBar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <Backdrop show={sidebarOpen} onClick={toggleSidebar} />
      <div className="delivery-main-content">
        <DeliveryHeaderBar onToggleSidebar={toggleSidebar} />
        <div className="container-fluid p-4">{children}</div>
      </div>
    </div>
  );
}
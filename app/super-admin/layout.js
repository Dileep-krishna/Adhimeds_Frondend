"use client";

import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import StoreAppHeader from "../All-store-management/components/StoreAppHeader";

export default function AdminLayout({ children }) {
  return (
    <div className="super-layout-wrapper">
      <AppSidebar />
      <Backdrop />
      <div className="super-main-content">
        <AppHeader />
      
        <div className="container-fluid p-4">{children}</div>
      </div>
    </div>
  );
}
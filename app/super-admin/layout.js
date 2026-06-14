"use client";

import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";

export default function AdminLayout({ children }) {
  return (
    <div className="admin-layout">
      <AppSidebar />
      <Backdrop />
      <div className="main-content-wrapper">
        <AppHeader />
        <div className="container-fluid p-4 mx-auto">{children}</div>
      </div>
    </div>
  );
}
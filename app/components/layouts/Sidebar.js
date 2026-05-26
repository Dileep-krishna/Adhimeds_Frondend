"use client";

import Link from "next/link";

export default function Sidebar() {
  return (
    <div className="bg-dark text-white p-3 vh-100" style={{ width: "220px" }}>
      <h4 className="mb-4">Admin</h4>

      <ul className="nav flex-column">
        <li className="nav-item">
          <Link href="/super-admin/dashboard" className="nav-link text-white">Dashboard</Link>
        </li>
        <li className="nav-item">
          <Link href="/super-admin/orders" className="nav-link text-white">Orders</Link>
        </li>
        <li className="nav-item">
          <Link href="/super-admin/vendors" className="nav-link text-white">Vendors</Link>
        </li>
        <li className="nav-item">
          <Link href="/super-admin/staff" className="nav-link text-white">Staff</Link>
        </li>
        <li className="nav-item">
          <Link href="/super-admin/reports" className="nav-link text-white">Reports</Link>
        </li>
      </ul>
    </div>
  );
}
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
 // make sure this file exists

export default function StaffLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState(null);
  const [district, setDistrict] = useState(null);
  const [mounted, setMounted] = useState(false);

  // Read localStorage only on the client, after mount
  useEffect(() => {
    setMounted(true);
    const r = localStorage.getItem("staffRole");
    const d = localStorage.getItem("staffDistrict");
    setRole(r);
    setDistrict(d);
  }, []);

  // Redirect to login if no role (client‑side only)
  useEffect(() => {
    if (mounted && !role && pathname !== "/staff/login") {
      router.replace("/staff/login");
    }
  }, [mounted, role, pathname, router]);

  // While mounting or redirecting, show a consistent loading state
  if (!mounted || role === null) {
    return (
      <div className="staff-layout">
        <aside className="staff-sidebar">
          <div className="sidebar-header"><h5>Staff Portal</h5></div>
          <div className="text-center mt-5">Loading...</div>
        </aside>
        <main className="staff-content">Loading...</main>
      </div>
    );
  }

  // Login page: render children without sidebar
  if (pathname === "/staff/login") {
    return <>{children}</>;
  }

  const navItems = {
    pharmacist: [{ name: "Dashboard", path: "/staff/pharmacist/dashboard" }],
    "delivery-head": [
      { name: "Dashboard", path: "/staff/delivery-head/dashboard" },
      { name: "Delivery Boys", path: "/staff/delivery-head/delivery-boys" },
      { name: "Reports", path: "/staff/delivery-head/reports" },
    ],
    "delivery-boy": [{ name: "My Deliveries", path: "/staff/delivery-boy/dashboard" }],
  };
  const menu = navItems[role] || [];

  return (
    <div className="staff-layout">
      <aside className="staff-sidebar">
        <div className="sidebar-header">
          <h5>Staff Portal</h5>
          <p className="small text-light">{role.toUpperCase()} – {district}</p>
        </div>
        <ul className="sidebar-nav">
          {menu.map((item) => (
            <li key={item.path}>
              <Link
                href={item.path}
                className={`sidebar-link ${pathname === item.path ? "active" : ""}`}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
        <button
          className="logout-btn"
          onClick={() => {
            localStorage.clear();
            router.push("/staff/login");
          }}
        >
          Logout
        </button>
      </aside>
      <main className="staff-content">{children}</main>
    </div>
  );
}
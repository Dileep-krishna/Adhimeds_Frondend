"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const UserDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    window.location.href = "/login";
  };

  return (
    <div className="position-relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center p-0 overflow-hidden"
        style={{ width: "2.5rem", height: "2.5rem" }}
        aria-label="User menu"
      >
        {!imgError ? (
          <Image
            src="/images/logo.webp"
            alt="User logo"
            width={40}
            height={40}
            style={{ objectFit: "cover" }}
            onError={() => setImgError(true)}
          />
        ) : (
          <i className="bi bi-person-circle fs-4"></i>
        )}
      </button>

      {isOpen && (
        <div
          className="position-absolute end-0 mt-2 bg-white border rounded shadow-sm"
          style={{ minWidth: "180px", zIndex: 1050 }}
        >
          <div className="py-1">
            <Link
              href="/profile"
              className="dropdown-item d-flex align-items-center gap-2 px-3 py-2 text-decoration-none"
              onClick={() => setIsOpen(false)}
            >
              <i className="bi bi-person"></i> Profile
            </Link>
            <Link
              href="/settings"
              className="dropdown-item d-flex align-items-center gap-2 px-3 py-2 text-decoration-none"
              onClick={() => setIsOpen(false)}
            >
              <i className="bi bi-gear"></i> Settings
            </Link>
            <hr className="my-1" />
            <button
              onClick={handleLogout}
              className="dropdown-item d-flex align-items-center gap-2 px-3 py-2 text-danger"
              style={{ background: "none", border: "none", width: "100%", textAlign: "left" }}
            >
              <i className="bi bi-box-arrow-right"></i> Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;
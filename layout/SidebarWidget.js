import React from "react";

export default function SidebarWidget() {
  return (
    <div
      className="mx-auto mb-4 w-100 text-center"
      style={{ maxWidth: "15rem" }}
    >
      <div className="bg-light rounded-3 px-3 py-4 border">
        <h3 className="fw-semibold text-dark mb-2 small">
          #1 Bootstrap 5 Dashboard
        </h3>
        <p className="text-secondary mb-3 small">
          Leading Bootstrap 5 Admin Template with 400+ UI Components and Pages.
        </p>
        <a
          href="https://tailadmin.com/pricing"
          target="_blank"
          rel="nofollow"
          className="btn btn-primary w-100 fw-medium"
          style={{ backgroundColor: "#4F46E5", borderColor: "#4F46E5" }}
        >
          Upgrade To Pro
        </a>
      </div>

      {/* Dark mode overrides */}
      <style jsx>{`
        .dark .bg-light {
          background-color: rgba(255, 255, 255, 0.03) !important;
        }
        .dark .text-dark {
          color: #ffffff !important;
        }
        .dark .text-secondary {
          color: #9ca3af !important;
        }
        .dark .border {
          border-color: #374151 !important;
        }
      `}</style>
    </div>
  );
}
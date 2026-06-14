import Link from "next/link";
import React from "react";

const PageBreadcrumb = ({ pageTitle }) => {
  return (
    <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
      <h2 className="h5 fw-semibold mb-0 text-gray-800 dark-text-white">
        {pageTitle}
      </h2>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb mb-0">
          <li className="breadcrumb-item">
            <Link href="/" className="text-decoration-none d-inline-flex align-items-center gap-1 text-gray-500 dark-text-gray-400">
              Home
              <svg
                className="stroke-current"
                width="17"
                height="16"
                viewBox="0 0 17 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6.0765 12.667L10.2432 8.50033L6.0765 4.33366"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </li>
          <li className="breadcrumb-item active text-gray-800 dark-text-white" aria-current="page">
            {pageTitle}
          </li>
        </ol>
      </nav>

      {/* Custom dark mode styles to match original Tailwind colors */}
      <style jsx>{`
        .text-gray-800 {
          color: #1f2937;
        }
        .text-gray-500 {
          color: #6b7280;
        }
        .dark-text-white {
          color: rgba(255, 255, 255, 0.9);
        }
        .dark-text-gray-400 {
          color: #9ca3af;
        }
        :global(.dark) .text-gray-800 {
          color: rgba(255, 255, 255, 0.9);
        }
        :global(.dark) .text-gray-500 {
          color: #9ca3af;
        }
        .breadcrumb-item + .breadcrumb-item::before {
          content: "";
          padding: 0;
        }
        .breadcrumb-item {
          display: flex;
          align-items: center;
        }
        .breadcrumb-item a {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
        }
        .stroke-current svg path {
          stroke: currentColor;
        }
      `}</style>
    </div>
  );
};

export default PageBreadcrumb;
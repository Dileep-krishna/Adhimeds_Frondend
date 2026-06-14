import React from "react";

const ComponentCard = ({ title, children, className = "", desc = "" }) => {
  return (
    <div className={`card border rounded-3 bg-white dark-bg-dark ${className}`}>
      {/* Card Header */}
      <div className="card-header border-bottom-0 bg-transparent px-4 py-3">
        <h3 className="h6 fw-medium mb-0 text-gray-800 dark-text-white">
          {title}
        </h3>
        {desc && (
          <p className="mt-1 small text-gray-500 dark-text-gray-400 mb-0">
            {desc}
          </p>
        )}
      </div>

      {/* Card Body */}
      <div className="card-body border-top px-4 py-3">
        <div className="d-flex flex-column gap-3">{children}</div>
      </div>

      {/* Custom CSS to replicate original styling */}
      <style jsx>{`
        .card {
          border-color: #e5e7eb; /* gray-200 */
        }
        .text-gray-800 {
          color: #1f2937;
        }
        .text-gray-500 {
          color: #6b7280;
        }
        .fw-medium {
          font-weight: 500;
        }
        /* Dark mode overrides */
        .dark-bg-dark {
          background-color: rgba(255, 255, 255, 0.03) !important;
        }
        .dark-text-white {
          color: rgba(255, 255, 255, 0.9);
        }
        .dark-text-gray-400 {
          color: #9ca3af;
        }
        :global(.dark) .card {
          border-color: #374151; /* dark:border-gray-800 */
        }
        :global(.dark) .card-header,
        :global(.dark) .card-body {
          border-top-color: #374151;
          border-bottom-color: #374151;
        }
        :global(.dark) .text-gray-800 {
          color: rgba(255, 255, 255, 0.9);
        }
        :global(.dark) .text-gray-500 {
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
};

export default ComponentCard;
import React, { useState } from "react";

const ChartTab = () => {
  const [selected, setSelected] = useState("optionOne");

  return (
    <div className="btn-group w-100" role="group" aria-label="Chart time range">
      <button
        type="button"
        onClick={() => setSelected("optionOne")}
        className={`btn btn-outline-secondary ${selected === "optionOne" ? "active" : ""}`}
        style={{ flex: 1 }}
      >
        Monthly
      </button>
      <button
        type="button"
        onClick={() => setSelected("optionTwo")}
        className={`btn btn-outline-secondary ${selected === "optionTwo" ? "active" : ""}`}
        style={{ flex: 1 }}
      >
        Quarterly
      </button>
      <button
        type="button"
        onClick={() => setSelected("optionThree")}
        className={`btn btn-outline-secondary ${selected === "optionThree" ? "active" : ""}`}
        style={{ flex: 1 }}
      >
        Annually
      </button>

      {/* Custom CSS to replicate original styling and dark mode */}
      <style jsx>{`
        .btn-outline-secondary {
          border-color: #e5e7eb; /* gray-200 */
          color: #6b7280; /* gray-500 */
          background-color: transparent;
          transition: all 0.2s;
        }
        .btn-outline-secondary:hover {
          background-color: #f3f4f6; /* gray-100 */
          color: #1f2937; /* gray-900 */
          border-color: #e5e7eb;
        }
        .btn-outline-secondary.active {
          background-color: white;
          color: #1f2937;
          border-color: #e5e7eb;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        /* Dark mode overrides */
        :global(.dark) .btn-outline-secondary {
          border-color: #374151;
          color: #9ca3af;
        }
        :global(.dark) .btn-outline-secondary:hover {
          background-color: #1f2937;
          color: #ffffff;
        }
        :global(.dark) .btn-outline-secondary.active {
          background-color: #1f2937;
          color: #ffffff;
          border-color: #4b5563;
        }
        .btn-group > .btn:first-child {
          border-top-left-radius: 0.375rem;
          border-bottom-left-radius: 0.375rem;
        }
        .btn-group > .btn:last-child {
          border-top-right-radius: 0.375rem;
          border-bottom-right-radius: 0.375rem;
        }
      `}</style>
    </div>
  );
};

export default ChartTab;
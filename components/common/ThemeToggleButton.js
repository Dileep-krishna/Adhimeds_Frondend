// components/common/ThemeToggleButton.jsx
"use client";

import { useTheme } from "@/context/ThemeContext";

export const ThemeToggleButton = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="btn btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center"
      style={{ width: "2.5rem", height: "2.5rem" }}
      aria-label="Toggle Dark Mode"
    >
      {isDark ? (
        <i className="bi bi-sun-fill fs-5"></i>
      ) : (
        <i className="bi bi-moon-fill fs-5"></i>
      )}
    </button>
  );
};
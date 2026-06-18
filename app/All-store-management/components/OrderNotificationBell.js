"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOrderNotifications } from "@/context/OrderNotificationContext";
import "./OrderNotificationBell.css";

export default function OrderNotificationBell({ onClick }) {
  const { unreadCount, notifications, markAsRead, clearAll } =
    useOrderNotifications();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBellClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    setIsOpen(!isOpen);
    // ❌ No automatic markAllAsRead – user decides
  };

  const handleViewOrder = (orderId) => {
    router.push(`/All-store-management/Orders/${orderId}`);
    setIsOpen(false);
  };

  const handleViewAll = () => {
    router.push("/All-store-management/Orders");
    setIsOpen(false);
  };

  const formatTime = (timestamp) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="order-notification-wrapper" ref={dropdownRef}>
      <button
        className={`order-notification-bell ${unreadCount > 0 ? "has-notifications" : ""}`}
        onClick={handleBellClick}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ""}`}
      >
        <i className="bi bi-bell-fill"></i>
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown – only if no custom onClick and isOpen */}
      {!onClick && isOpen && (
        <div className="order-notification-dropdown">
          <div className="dropdown-header">
            <span className="dropdown-title">Notifications</span>
            <div className="dropdown-actions">
              {notifications.length > 0 && (
                <button className="clear-all-btn" onClick={clearAll}>
                  Clear all
                </button>
              )}
            </div>
          </div>

          <div className="dropdown-body">
            {notifications.length === 0 ? (
              <div className="empty-state">
                <i className="bi bi-check-circle"></i>
                <p>All caught up! 🎉</p>
              </div>
            ) : (
              notifications.slice(0, 10).map((notif) => (
                <div
                  key={notif.id}
                  className={`notification-item ${!notif.read ? "unread" : ""}`}
                  onClick={() => {
                    if (!notif.read) markAsRead(notif.id);
                    handleViewOrder(notif.orderId);
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      if (!notif.read) markAsRead(notif.id);
                      handleViewOrder(notif.orderId);
                    }
                  }}
                >
                  <div className="notification-icon">
                    <i className="bi bi-cart-plus"></i>
                  </div>
                  <div className="notification-content">
                    <div className="notification-message">{notif.message}</div>
                    <span className="notification-time">
                      {formatTime(notif.timestamp)}
                    </span>
                  </div>
                  {!notif.read && <span className="unread-dot"></span>}
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="dropdown-footer">
              <button onClick={handleViewAll} className="view-all-btn">
                View all orders
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
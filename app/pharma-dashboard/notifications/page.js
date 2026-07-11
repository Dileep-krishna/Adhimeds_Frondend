"use client";

import { useMemo, useCallback, memo } from "react";

import { useRouter } from "next/navigation";

// Memoized item – no `startTransition` to avoid complexity
const NotificationItem = memo(({ notif, onMarkAsRead }) => {
  const handleClick = useCallback(() => {
    if (!notif.read) {
      onMarkAsRead(notif.id);
    }
  }, [notif.id, notif.read, onMarkAsRead]);

  return (
    <div
      className={`list-group-item list-group-item-action d-flex justify-content-between align-items-start ${!notif.read ? "bg-light" : ""
        }`}
      onClick={handleClick}
      style={{ cursor: "pointer", transition: "background 0.1s ease" }}
    >
      <div className="ms-2 me-auto">
        <div className="fw-bold">
          {notif.type === "success" && "✅ "}
          {notif.type === "error" && "❌ "}
          {notif.type === "warning" && "⚠️ "}
          {notif.message}
        </div>
        <small className="text-muted">
          {new Date(notif.timestamp).toLocaleString()}
        </small>
      </div>
      {!notif.read && <span className="badge bg-primary rounded-pill">New</span>}
    </div>
  );
});

NotificationItem.displayName = "NotificationItem";

export default function NotificationsPage() {

  const router = useRouter();

  const notificationList = useMemo(() => notifications, [notifications]);

  const handleBack = useCallback(() => router.back(), [router]);
  const handleClearAll = useCallback(() => clearAll(), [clearAll]);
  const handleMarkAsRead = useCallback((id) => markAsRead(id), [markAsRead]);

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          Notifications{" "}
          {unreadCount > 0 && (
            <span className="badge bg-danger">{unreadCount}</span>
          )}
        </h2>
        <div>
          <button className="btn btn-outline-secondary me-2" onClick={handleBack}>
            Back
          </button>
          {notifications.length > 0 && (
            <button className="btn btn-danger" onClick={handleClearAll}>
              Clear All
            </button>
          )}
        </div>
      </div>

      {notificationList.length === 0 ? (
        <div className="text-center text-muted py-5">
          <h5>No notifications yet</h5>
          <p>When you place orders or receive updates, they'll appear here.</p>
        </div>
      ) : (
        <div className="list-group">
          {notificationList.map((notif) => (
            <NotificationItem
              key={notif.id}
              notif={notif}
              onMarkAsRead={handleMarkAsRead}
            />
          ))}
        </div>
      )}
    </div>
  );
}
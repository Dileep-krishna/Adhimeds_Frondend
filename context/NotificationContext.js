import React from 'react'

function NotificationContext() {
  return (
    <div>NotificationContext</div>
  )
}

export default NotificationContext

// "use client";

// import { createContext, useContext, useState, useCallback, useMemo } from "react";
// import { toast } from "sonner";

// const NotificationContext = createContext();

// export function NotificationProvider({ children }) {
//   const [notifications, setNotifications] = useState([]);

//   const addNotification = useCallback((message, type = "info") => {
//     const newNotif = {
//       id: Date.now() + Math.random(),
//       message,
//       type,
//       timestamp: new Date().toISOString(),
//       read: false,
//     };

//     // ✅ No limit – keep all notifications
//     setNotifications((prev) => [newNotif, ...prev]);

//     const toastFn = toast[type] || toast.info;
//     toastFn(message, {
//       description: new Date().toLocaleString(),
//       duration: 1500,
//     });
//   }, []);

//   const markAsRead = useCallback((id) => {
//     setNotifications((prev) =>
//       prev.map((n) => (n.id === id ? { ...n, read: true } : n))
//     );
//   }, []);

//   const clearAll = useCallback(() => {
//     setNotifications([]);
//     toast.info("Cleared", { duration: 1000 });
//   }, []);

//   const unreadCount = useMemo(
//     () => notifications.filter((n) => !n.read).length,
//     [notifications]
//   );

//   const contextValue = useMemo(
//     () => ({
//       notifications,
//       addNotification,
//       markAsRead,
//       clearAll,
//       unreadCount,
//     }),
//     [notifications, addNotification, markAsRead, clearAll, unreadCount]
//   );

//   return (
//     <NotificationContext.Provider value={contextValue}>
//       {children}
//     </NotificationContext.Provider>
//   );
// }

// export function useNotifications() {
//   return useContext(NotificationContext);
// }
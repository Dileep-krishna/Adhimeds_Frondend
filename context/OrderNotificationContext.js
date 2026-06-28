"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { getAllOrders, createNotification } from "@/app/services/orderAPI";
import io from "socket.io-client";
import SERVERURL from "@/app/services/serverURL";

const NOTIFICATION_ENABLED_PATHS = ["/All-store-management/Orders"];
const RING_INTERVAL = 5000;
const MAX_RING_DURATION = 5 * 60 * 1000;

const OrderNotificationContext = createContext();

export function OrderNotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isRinging, setIsRinging] = useState(false);
  const pathname = usePathname();

  const ringingIntervalRef = useRef(null);
  const ringingTimeoutRef = useRef(null);
  const isRingingRef = useRef(false);
  const audioRef = useRef(null);
  const notifIdsRef = useRef(new Set());
  const isAudioUnlocked = useRef(false);
  const socketRef = useRef(null);

  // ---- Preload audio ----
  useEffect(() => {
    audioRef.current = new Audio("/audio/notification-2.mp3");
    audioRef.current.preload = "auto";
    audioRef.current.volume = 0.7;
    audioRef.current.load();
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // ---- Unlock audio on first click ----
  useEffect(() => {
    const unlockAudio = () => {
      if (isAudioUnlocked.current) return;
      const silent = new Audio();
      silent.volume = 0;
      silent.play()
        .then(() => {
          silent.pause();
          isAudioUnlocked.current = true;
          document.removeEventListener("click", unlockAudio);
          document.removeEventListener("touchstart", unlockAudio);
          if (isRingingRef.current) playSound();
        })
        .catch(() => {});
    };
    document.addEventListener("click", unlockAudio);
    document.addEventListener("touchstart", unlockAudio);
    return () => {
      document.removeEventListener("click", unlockAudio);
      document.removeEventListener("touchstart", unlockAudio);
    };
  }, []);

  // ---- Play sound ----
  const playSound = useCallback(() => {
    if (!soundEnabled || !audioRef.current) return;
    try {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    } catch (_) {}
  }, [soundEnabled]);

  // ---- Ringing controls ----
  const startRinging = useCallback(() => {
    if (isRingingRef.current) stopRinging();
    isRingingRef.current = true;
    setIsRinging(true);
    playSound();
    ringingIntervalRef.current = setInterval(playSound, RING_INTERVAL);
    ringingTimeoutRef.current = setTimeout(stopRinging, MAX_RING_DURATION);
  }, [playSound]);

  const stopRinging = useCallback(() => {
    if (ringingIntervalRef.current) {
      clearInterval(ringingIntervalRef.current);
      ringingIntervalRef.current = null;
    }
    if (ringingTimeoutRef.current) {
      clearTimeout(ringingTimeoutRef.current);
      ringingTimeoutRef.current = null;
    }
    isRingingRef.current = false;
    setIsRinging(false);
  }, []);

  // ---- Ring on path change ----
  useEffect(() => {
    const isEnabled = NOTIFICATION_ENABLED_PATHS.some(p => pathname.startsWith(p));
    const unreadCount = notifications.filter(n => !n.read).length;
    if (isEnabled && unreadCount > 0 && !isRingingRef.current) {
      startRinging();
    } else if (!isEnabled && isRingingRef.current) {
      stopRinging();
    }
  }, [pathname, notifications, startRinging, stopRinging]);

  // ---- Helper: add new notifications ----
  const addNewNotifications = useCallback((newNotifs) => {
    if (newNotifs.length === 0) return;
    setNotifications(prev => {
      const existingIds = new Set(prev.map(n => n.id));
      const filtered = newNotifs.filter(n => !existingIds.has(n.id));
      return [...filtered, ...prev];
    });
    newNotifs.forEach(n => notifIdsRef.current.add(`${n.orderId}-${n.itemId}`));
  }, []);

  // ---- Socket.IO listener ----
  useEffect(() => {
    const socket = io(SERVERURL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ Socket.IO connected");
    });

    socket.on("new_order", async (data) => {
      const { orderId, order } = data;
      if (!order || !order.items) return;

      const pendingItems = order.items.filter(item => item.status === "pending");
      if (pendingItems.length === 0) return;

      const newNotifs = [];
      for (const item of pendingItems) {
        const key = `${orderId}-${item._id}`;
        if (notifIdsRef.current.has(key)) continue;

        const message = `New order #${orderId.substring(orderId.length - 8)} - ${item.productName} (Qty: ${item.quantity || 1})`;
        try {
          const result = await createNotification(orderId, message);
          if (result.success) {
            newNotifs.push({
              id: result.data._id,
              orderId: orderId,
              itemId: item._id,
              message,
              productName: item.productName,
              timestamp: new Date(order.createdAt || Date.now()),
              read: false,
            });
          }
        } catch (_) {}
      }

      if (newNotifs.length > 0) {
        addNewNotifications(newNotifs);
        const isEnabled = NOTIFICATION_ENABLED_PATHS.some(p => pathname.startsWith(p));
        if (isEnabled) {
          startRinging();
          toast.info(`📦 ${pendingItems.length} new order item${pendingItems.length > 1 ? "s" : ""} received!`, {
            duration: 5000,
          });
        }
      }
    });

    return () => {
      socket.off("new_order");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [pathname, startRinging, addNewNotifications]);

  // ---- triggerNewOrder (called from cart) ----
  const triggerNewOrder = useCallback(async (order) => {
    if (!order?.items) return;
    const pendingItems = order.items.filter(item => item.status === "pending");
    if (pendingItems.length === 0) return;

    const newNotifs = [];
    for (const item of pendingItems) {
      const key = `${order._id}-${item._id}`;
      if (notifIdsRef.current.has(key)) continue;
      const message = `New order #${order._id.substring(order._id.length - 8)} - ${item.productName} (Qty: ${item.quantity || 1})`;
      try {
        const result = await createNotification(order._id, message);
        if (result.success) {
          newNotifs.push({
            id: result.data._id,
            orderId: order._id,
            itemId: item._id,
            message,
            productName: item.productName,
            timestamp: new Date(order.createdAt),
            read: false,
          });
        }
      } catch (_) {}
    }
    if (newNotifs.length === 0) return;
    addNewNotifications(newNotifs);
    const isEnabled = NOTIFICATION_ENABLED_PATHS.some(p => pathname.startsWith(p));
    if (isEnabled) {
      startRinging();
      toast.info(`📦 ${pendingItems.length} new order item${pendingItems.length > 1 ? "s" : ""} placed!`, { duration: 5000 });
    }
  }, [pathname, startRinging, addNewNotifications]);

  // ---- syncNotifications with proper cleanup ----
  const syncNotifications = useCallback(async (silent = false) => {
    try {
      const response = await getAllOrders();
      if (!response.success) return;
      const currentOrders = response.data || [];

      // Track all pending items
      const pendingItemsMap = new Map();
      const allOrderItems = new Set();

      currentOrders.forEach(order => {
        (order.items || []).forEach(item => {
          const key = `${order._id}-${item._id}`;
          allOrderItems.add(key);
          if (item.status === "pending") {
            pendingItemsMap.set(key, { order, item });
          }
        });
      });

      // Clean up notifications for items that are no longer pending
      setNotifications(prev => {
        return prev.filter(notif => {
          const key = `${notif.orderId}-${notif.itemId}`;
          return pendingItemsMap.has(key);
        });
      });

      // Clean up notifIdsRef
      const keysToRemove = [];
      notifIdsRef.current.forEach(key => {
        if (!pendingItemsMap.has(key)) {
          keysToRemove.push(key);
        }
      });
      keysToRemove.forEach(key => notifIdsRef.current.delete(key));

      // If no pending items, stop ringing and clear everything
      if (pendingItemsMap.size === 0) {
        stopRinging();
        setNotifications([]);
        notifIdsRef.current.clear();
        return;
      }

      // Only add new notifications for pending items that don't have notifications
      let newNotifs = [];
      for (const [key, { order, item }] of pendingItemsMap) {
        if (notifIdsRef.current.has(key)) continue;
        
        const shortId = order._id.substring(order._id.length - 8);
        const productName = item.productName || "Product";
        const message = `New order #${shortId} - ${productName} (Qty: ${item.quantity || 1})`;
        
        try {
          const result = await createNotification(order._id, message);
          if (result.success) {
            newNotifs.push({
              id: result.data._id,
              orderId: order._id,
              itemId: item._id,
              message,
              productName,
              timestamp: new Date(order.createdAt),
              read: false,
            });
          }
        } catch (_) {}
      }

      if (newNotifs.length > 0) {
        addNewNotifications(newNotifs);
        const isEnabled = NOTIFICATION_ENABLED_PATHS.some(p => pathname.startsWith(p));
        if (!silent && isEnabled) {
          startRinging();
          toast.info(`📦 ${newNotifs.length} new order item${newNotifs.length > 1 ? "s" : ""} received`, {
            duration: 5000,
          });
        }
      }

      // Final check: stop ringing if no unread notifications
      setTimeout(() => {
        const currentUnread = notifications.filter(n => !n.read).length;
        if (currentUnread === 0 && isRingingRef.current) {
          stopRinging();
        }
      }, 100);

    } catch (error) {
      console.error('Sync notifications error:', error);
      stopRinging();
    }
  }, [pathname, startRinging, stopRinging, addNewNotifications, notifications]);

  // ---- Polling (fallback) ----
  useEffect(() => {
    syncNotifications(false);
    const interval = setInterval(() => syncNotifications(false), 30000);
    return () => {
      clearInterval(interval);
      stopRinging();
    };
  }, [syncNotifications, stopRinging]);

  // ---- Refresh functions ----
  const refreshNotificationsSilent = useCallback(() => {
    syncNotifications(true);
  }, [syncNotifications]);

  const refreshNotificationsWithSound = useCallback(() => {
    syncNotifications(false);
  }, [syncNotifications]);

  // ---- Other exposed functions ----
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    if (isRingingRef.current) {
      const unread = notifications.filter(n => !n.read).length;
      if (unread === 0) stopRinging();
    }
  }, [notifications, stopRinging]);
  
  const markAsRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setTimeout(() => {
      const unread = notifications.filter(n => !n.read).length;
      if (unread === 0 && isRingingRef.current) stopRinging();
    }, 100);
  }, [notifications, stopRinging]);
  
  const clearAll = useCallback(() => { 
    setNotifications([]); 
    notifIdsRef.current.clear(); 
    stopRinging(); 
  }, [stopRinging]);
  
  const toggleSound = useCallback(() => setSoundEnabled(prev => !prev), []);
  
  const testEmit = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("test_event", { from: "frontend", time: Date.now() });
    }
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <OrderNotificationContext.Provider value={{
      notifications,
      unreadCount,
      isRinging,
      markAllAsRead,
      markAsRead,
      clearAll,
      soundEnabled,
      toggleSound,
      playNotificationSound: playSound,
      refreshNotificationsSilent,
      refreshNotificationsWithSound,
      triggerNewOrder,
      testEmit,
      stopRinging,
    }}>
      {children}
    </OrderNotificationContext.Provider>
  );
}

export function useOrderNotifications() {
  return useContext(OrderNotificationContext);
}
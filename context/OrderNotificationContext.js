"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { getAllOrders } from "@/app/services/orderAPI";

const OrderNotificationContext = createContext();

const NOTIFICATION_ENABLED_PATHS = [
  "/All-store-management/Orders",
];

const RING_INTERVAL = 5000;
const MAX_RING_DURATION = 5 * 60 * 1000;

export function OrderNotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const pathname = usePathname();

  const ringingIntervalRef = useRef(null);
  const ringingTimeoutRef = useRef(null);
  const isRingingRef = useRef(false);
  const audioRef = useRef(null);

  // Preload audio
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

  // Fast sound play
  const playNotificationSound = useCallback(() => {
    if (!soundEnabled) return;
    let audio = audioRef.current;
    if (!audio) {
      audio = new Audio("/audio/notification-2.mp3");
      audio.volume = 0.7;
    }
    try {
      audio.pause();
      audio.currentTime = 0;
      audio.play().catch(err => console.warn("⚠️ Audio blocked:", err));
    } catch (error) {
      console.error("❌ Audio error:", error);
    }
  }, [soundEnabled]);

  // Ringing control
  const startRinging = useCallback(() => {
    if (isRingingRef.current) stopRinging();
    isRingingRef.current = true;
    playNotificationSound();
    ringingIntervalRef.current = setInterval(playNotificationSound, RING_INTERVAL);
    ringingTimeoutRef.current = setTimeout(() => {
      stopRinging();
    }, MAX_RING_DURATION);
  }, [playNotificationSound]);

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
  }, []);

  // --- Trigger new order (MANUAL) – only sound if on allowed page ---
  const triggerNewOrder = useCallback((order) => {
    if (!order || !order.items || order.items.length === 0) {
      console.warn("⚠️ Invalid order – no items");
      return;
    }

    const pendingItems = order.items.filter(item => item.status === "pending");
    if (pendingItems.length === 0) {
      console.warn("⚠️ No pending items in this order");
      return;
    }

    const newNotifs = pendingItems.map(item => ({
      id: `${order._id}-${item._id}`,
      message: `New order #${order._id.substring(order._id.length - 8)} - ${item.productName} (Qty: ${item.quantity || 1})`,
      orderId: order._id,
      itemId: item._id,
      productName: item.productName,
      timestamp: new Date(order.createdAt),
      read: false,
    }));

    setNotifications(prev => {
      const existingIds = new Set(prev.map(n => n.id));
      const filteredNew = newNotifs.filter(n => !existingIds.has(n.id));
      if (filteredNew.length === 0) return prev;
      return [...filteredNew, ...prev];
    });

    // ✅ Only play sound and show toast if on an allowed page
    const isEnabled = NOTIFICATION_ENABLED_PATHS.some(p => pathname.startsWith(p));
    if (isEnabled) {
      startRinging();
      toast.info(`📦 ${pendingItems.length} new order item${pendingItems.length > 1 ? "s" : ""} placed!`, {
        duration: 5000,
      });
    } else {
      console.log("🔇 Notification added silently (path not allowed for sound)");
    }
  }, [pathname, startRinging]);

  // --- Polling sync (for external orders) – same path check ---
  const syncNotifications = useCallback(async () => {
    try {
      const response = await getAllOrders();
      if (!response.success) return;
      const currentOrders = response.data || [];

      const pendingItemKeys = new Set();
      const itemDetailsMap = {};

      currentOrders.forEach(order => {
        (order.items || []).forEach(item => {
          if (item.status === "pending") {
            const key = `${order._id}-${item._id}`;
            pendingItemKeys.add(key);
            itemDetailsMap[key] = {
              order,
              item,
              shortId: order._id.substring(order._id.length - 8),
              productName: item.productName || "Product",
            };
          }
        });
      });

      setNotifications(prev => {
        const filtered = prev.filter(n => pendingItemKeys.has(n.id));
        const existingKeys = new Set(filtered.map(n => n.id));
        const newKeys = [];
        for (const key of pendingItemKeys) {
          if (!existingKeys.has(key)) newKeys.push(key);
        }

        if (newKeys.length === 0) {
          if (isRingingRef.current && pendingItemKeys.size === 0) {
            stopRinging();
          }
          return filtered;
        }

        const newNotifs = newKeys.map(key => {
          const { order, item, shortId, productName } = itemDetailsMap[key];
          return {
            id: key,
            message: `New order #${shortId} - ${productName} (Qty: ${item.quantity || 1})`,
            orderId: order._id,
            itemId: item._id,
            productName: productName,
            timestamp: new Date(order.createdAt),
            read: false,
          };
        });

        const isEnabled = NOTIFICATION_ENABLED_PATHS.some(p => pathname.startsWith(p));
        if (newNotifs.length > 0 && isEnabled) {
          startRinging();
          toast.info(`📦 ${newNotifs.length} new order item${newNotifs.length > 1 ? "s" : ""} received!`, {
            duration: 5000,
          });
        }

        return [...newNotifs, ...filtered];
      });
    } catch (error) {
      console.error("❌ Error syncing notifications:", error);
    }
  }, [pathname, startRinging, stopRinging]);

  // Polling every 10s
  useEffect(() => {
    syncNotifications();
    const interval = setInterval(syncNotifications, 10000);
    return () => {
      clearInterval(interval);
      stopRinging();
    };
  }, [syncNotifications, stopRinging]);

  // --- Exposed functions ---
  const refreshNotifications = useCallback(() => {
    syncNotifications();
  }, [syncNotifications]);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    stopRinging();
  }, [stopRinging]);

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => !prev);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const value = {
    notifications,
    unreadCount,
    markAllAsRead,
    markAsRead,
    clearAll,
    soundEnabled,
    toggleSound,
    playNotificationSound,
    refreshNotifications,
    triggerNewOrder,
  };

  return (
    <OrderNotificationContext.Provider value={value}>
      {children}
    </OrderNotificationContext.Provider>
  );
}

export function useOrderNotifications() {
  return useContext(OrderNotificationContext);
}
"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { getAllOrders, createNotification } from "@/app/services/orderAPI";
import io from "socket.io-client";
import SERVERURL from "@/app/services/serverURL";
import { useQueryClient } from "@tanstack/react-query";

// ✅ Pages where notifications are enabled
const NOTIFICATION_ENABLED_PATHS = [
  "/All-store-management/Orders",
  "/All-store-management/All-Orders",
  "/All-store-management/Order-Requests"
];

const RING_INTERVAL = 5000; // 5 seconds
const MAX_RING_DURATION = 20 * 60 * 1000; // 20 minutes
const POLLING_INTERVAL = 600000; // 10 minutes
const SYNC_DEBOUNCE = 2000; // 2 seconds
const MIN_SYNC_INTERVAL = 60000; // 1 minute – rate limit

const OrderNotificationContext = createContext();

export function OrderNotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isRinging, setIsRinging] = useState(false);
  const pathname = usePathname();

  const queryClient = useQueryClient();

  const ringingIntervalRef = useRef(null);
  const ringingTimeoutRef = useRef(null);
  const isRingingRef = useRef(false);
  const audioRef = useRef(null);
  const notifIdsRef = useRef(new Set());
  const isAudioUnlocked = useRef(false);
  const socketRef = useRef(null);
  const isSocketConnected = useRef(false);
  const pollingIntervalRef = useRef(null);
  const pollingActiveRef = useRef(false); // ✅ track polling state
  const isInitializedRef = useRef(false);
  const isSyncingRef = useRef(false);
  const syncTimeoutRef = useRef(null);
  const lastSyncTimeRef = useRef(0);

  // ---- Preload audio ----
  useEffect(() => {
    audioRef.current = new Audio("/audio/notification-2.mp3");
    audioRef.current.preload = "auto";
    audioRef.current.volume = 0.7;
    audioRef.current.loop = false;
    audioRef.current.onerror = () => console.error("❌ Audio failed to load");
    audioRef.current.onloadeddata = () => console.log("✅ Audio loaded successfully");
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // ---- Unlock audio on user interaction ----
  useEffect(() => {
    const unlockAudio = () => {
      if (isAudioUnlocked.current) return;
      const silent = new Audio();
      silent.volume = 0;
      silent.play()
        .then(() => {
          silent.pause();
          isAudioUnlocked.current = true;
          console.log("🔓 Audio unlocked");
          document.removeEventListener("click", unlockAudio);
          document.removeEventListener("touchstart", unlockAudio);
          if (isRingingRef.current) playSound();
        })
        .catch((e) => console.warn("⚠️ Audio unlock failed:", e));
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
    console.log("🔊 playSound called – soundEnabled:", soundEnabled);
    if (!soundEnabled) {
      console.log("🔇 Sound disabled – skipping");
      return;
    }
    if (!audioRef.current) {
      console.warn("❌ No audio element");
      return;
    }
    try {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      const promise = audioRef.current.play();
      if (promise !== undefined) {
        promise.catch((e) => {
          console.warn("⚠️ Play failed (will retry on user interaction):", e);
        });
      } else {
        console.log("✅ Audio playback started (no promise)");
      }
    } catch (e) {
      console.warn("⚠️ Play error:", e);
    }
  }, [soundEnabled]);

  // ---- Stop ringing ----
  const stopRinging = useCallback((reason = "unknown") => {
    console.log(`🔕 stopRinging called – reason: ${reason}`);
    if (ringingIntervalRef.current) {
      clearInterval(ringingIntervalRef.current);
      ringingIntervalRef.current = null;
    }
    if (ringingTimeoutRef.current) {
      clearTimeout(ringingTimeoutRef.current);
      ringingTimeoutRef.current = null;
    }
    if (isRingingRef.current) {
      isRingingRef.current = false;
      setIsRinging(false);
      console.log("✅ Ringing stopped successfully");
    } else {
      console.log("⏸️ Already not ringing");
    }
  }, []);

  // ---- Start ringing ----
  const startRinging = useCallback(() => {
    console.log("🔔 startRinging called – current isRinging:", isRingingRef.current);
    if (isRingingRef.current) {
      console.log("🔔 Already ringing – ignoring");
      return;
    }
    console.log("✅ Starting ringing...");
    isRingingRef.current = true;
    setIsRinging(true);

    playSound();

    if (ringingIntervalRef.current) clearInterval(ringingIntervalRef.current);
    ringingIntervalRef.current = setInterval(() => {
      if (isRingingRef.current) {
        console.log("⏰ Interval ringing tick");
        playSound();
      }
    }, RING_INTERVAL);

    if (ringingTimeoutRef.current) clearTimeout(ringingTimeoutRef.current);
    ringingTimeoutRef.current = setTimeout(() => {
      console.log("⏰ Max ringing duration reached – stopping");
      if (isRingingRef.current) stopRinging("max duration");
    }, MAX_RING_DURATION);
  }, [playSound, stopRinging]);

  // ---- Ring on path and notifications change ----
  useEffect(() => {
    const isEnabled = NOTIFICATION_ENABLED_PATHS.some(p => pathname.startsWith(p));
    const unreadCount = notifications.filter(n => !n.read).length;
    console.log(`🔔 Path check: ${pathname} | enabled: ${isEnabled} | unread: ${unreadCount} | isRinging: ${isRingingRef.current}`);

    if (isEnabled && unreadCount > 0 && !isRingingRef.current) {
      console.log("👉 Conditions met – starting ringing");
      startRinging();
    } else if ((!isEnabled || unreadCount === 0) && isRingingRef.current) {
      console.log(`👉 Conditions not met – stopping ringing (unread=${unreadCount}, enabled=${isEnabled})`);
      stopRinging("unread zero or path disabled");
    }
  }, [pathname, notifications, startRinging, stopRinging]);

  // ---- Add new notifications ----
  const addNewNotifications = useCallback((newNotifs) => {
    console.log("📥 addNewNotifications called with", newNotifs.length, "items");
    if (newNotifs.length === 0) return;

    setNotifications(prev => {
      const existingIds = new Set(prev.map(n => n.id));
      const filtered = newNotifs.filter(n => !existingIds.has(n.id));
      console.log(`📊 Filtered new notifications: ${filtered.length} (already had ${existingIds.size})`);
      return [...filtered, ...prev];
    });

    newNotifs.forEach(n => {
      const key = `${n.orderId}-${n.itemId}`;
      notifIdsRef.current.add(key);
      console.log(`🆕 Added notification for key: ${key}`);
    });

    queryClient.invalidateQueries({ queryKey: ['orders'] });
    startRinging();
  }, [startRinging, queryClient]);

  // ---- syncNotifications (debounced + rate limited + path check) ----
  const syncNotifications = useCallback(async (silent = false) => {
    // ✅ Check if current path is enabled
    const isEnabled = NOTIFICATION_ENABLED_PATHS.some(p => pathname.startsWith(p));
    if (!isEnabled) {
      console.log("⏭️ Sync skipped – path not enabled");
      return;
    }

    // If socket is connected and we're not forcing, skip
    if (isSocketConnected.current && !silent) {
      console.log("✅ Socket connected – skipping poll");
      return;
    }

    // Rate limit: don't sync more than once per minute
    const now = Date.now();
    if (now - lastSyncTimeRef.current < MIN_SYNC_INTERVAL) {
      console.log("⏳ Skipping sync – rate limited (1 min)");
      return;
    }

    if (isSyncingRef.current) {
      console.log("⏳ Sync already in progress – skipping");
      return;
    }

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(async () => {
      console.log("🔄 syncNotifications started (silent:", silent, ")");
      lastSyncTimeRef.current = Date.now();
      isSyncingRef.current = true;
      try {
        const response = await getAllOrders();
        if (!response.success) {
          console.warn("⚠️ Failed to fetch orders:", response);
          isSyncingRef.current = false;
          syncTimeoutRef.current = null;
          return;
        }
        const currentOrders = response.data || [];
        console.log(`📨 Fetched ${currentOrders.length} orders`);

        const pendingItemsMap = new Map();
        currentOrders.forEach(order => {
          (order.items || []).forEach(item => {
            const key = `${order._id}-${item._id}`;
            if (item.status === "pending") {
              pendingItemsMap.set(key, { order, item });
            }
          });
        });
        console.log(`📦 Found ${pendingItemsMap.size} pending items total`);

        setNotifications(prev => {
          const filtered = prev.filter(notif => {
            const key = `${notif.orderId}-${notif.itemId}`;
            return pendingItemsMap.has(key);
          });
          if (filtered.length !== prev.length) {
            console.log(`🧹 Cleaned up ${prev.length - filtered.length} stale notifications`);
          }
          return filtered;
        });

        const keysToRemove = [];
        notifIdsRef.current.forEach(key => {
          if (!pendingItemsMap.has(key)) keysToRemove.push(key);
        });
        keysToRemove.forEach(key => notifIdsRef.current.delete(key));
        if (keysToRemove.length > 0) {
          console.log(`🧹 Removed ${keysToRemove.length} stale keys from notifIdsRef`);
        }

        if (pendingItemsMap.size === 0) {
          console.log("ℹ️ No pending items – stopping any ringing");
          if (isRingingRef.current) stopRinging("no pending items");
          setNotifications([]);
          notifIdsRef.current.clear();
          isSyncingRef.current = false;
          syncTimeoutRef.current = null;
          return;
        }

        let newNotifs = [];
        for (const [key, { order, item }] of pendingItemsMap) {
          if (notifIdsRef.current.has(key)) continue;

          const shortId = order._id.substring(order._id.length - 8);
          const productName = item.productName || "Product";
          const message = `New order #${shortId} - ${productName} (Qty: ${item.quantity || 1})`;
          console.log(`📝 Creating notification for pending item: ${key}`);
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
          console.log(`📨 Adding ${newNotifs.length} new notifications from sync`);
          addNewNotifications(newNotifs);
          const isEnabled = NOTIFICATION_ENABLED_PATHS.some(p => pathname.startsWith(p));
          if (!silent && isEnabled) {
            toast.info(`📦 ${newNotifs.length} new order item${newNotifs.length > 1 ? "s" : ""} received`, { duration: 5000 });
          }
        } else {
          console.log("ℹ️ No new notifications to add from sync");
        }

        const currentUnread = notifications.filter(n => !n.read).length;
        if (currentUnread === 0 && isRingingRef.current) {
          console.log("ℹ️ No unread notifications – stopping ringing");
          stopRinging("no unread after sync");
        }

      } catch (error) {
        console.error('❌ Sync notifications error:', error);
        stopRinging("sync error");
      } finally {
        isSyncingRef.current = false;
        syncTimeoutRef.current = null;
      }
    }, SYNC_DEBOUNCE);
  }, [addNewNotifications, stopRinging, notifications, pathname]);

  // ---- Socket.IO listener ----
  useEffect(() => {
    console.log("🔄 Setting up Socket.IO");
    const socket = io(SERVERURL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      timeout: 10000,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ Socket.IO connected");
      isSocketConnected.current = true;
      // Stop polling when connected
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
        pollingActiveRef.current = false;
        console.log("🛑 Polling stopped (socket connected)");
      }
      // Silent sync only if path enabled and not recently synced
      const isEnabled = NOTIFICATION_ENABLED_PATHS.some(p => pathname.startsWith(p));
      if (isEnabled) {
        const now = Date.now();
        if (now - lastSyncTimeRef.current > MIN_SYNC_INTERVAL) {
          syncNotifications(true);
        } else {
          console.log("⏳ Skipping sync on reconnect – recently synced");
        }
      } else {
        console.log("⏭️ Skipping sync on reconnect – path not enabled");
      }
    });

    socket.on("disconnect", (reason) => {
      console.log("🔴 Socket.IO disconnected:", reason);
      isSocketConnected.current = false;
      const isEnabled = NOTIFICATION_ENABLED_PATHS.some(p => pathname.startsWith(p));
      // Restart polling only if path enabled and not already polling
      if (isEnabled && !pollingActiveRef.current) {
        setTimeout(() => {
          if (!isSocketConnected.current && !pollingActiveRef.current) {
            pollingActiveRef.current = true;
            pollingIntervalRef.current = setInterval(() => {
              console.log("⏰ Polling tick (fallback)");
              syncNotifications(false);
            }, POLLING_INTERVAL);
            console.log(`🔄 Polling started (fallback) – interval: ${POLLING_INTERVAL}ms`);
          }
        }, 5000);
      } else {
        console.log("⏭️ Polling restart skipped – path not enabled or already polling");
      }
    });

    socket.on("new_order", async (data) => {
      console.log("📩 Received 'new_order' event:", data);
      const { orderId, order } = data;
      if (!order || !order.items) {
        console.warn("⚠️ Invalid order data received");
        return;
      }

      const pendingItems = order.items.filter(item => item.status === "pending");
      console.log(`📦 Found ${pendingItems.length} pending items in new order`);

      if (pendingItems.length === 0) return;

      const newNotifs = [];
      for (const item of pendingItems) {
        const key = `${orderId}-${item._id}`;
        if (notifIdsRef.current.has(key)) {
          console.log(`⏭️ Skipping already notified item: ${key}`);
          continue;
        }

        const shortId = orderId.substring(orderId.length - 8);
        const message = `New order #${shortId} - ${item.productName} (Qty: ${item.quantity || 1})`;
        console.log(`📝 Creating notification for ${item.productName} with message:`, message);

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
            console.log(`✅ Notification created for item: ${item._id}`);
          } else {
            console.warn(`⚠️ Failed to create notification for ${item._id}:`, result);
          }
        } catch (error) {
          console.error(`❌ Error creating notification for ${item._id}:`, error);
        }
      }

      if (newNotifs.length > 0) {
        console.log(`📨 Adding ${newNotifs.length} new notifications from socket`);
        addNewNotifications(newNotifs);
        const isEnabled = NOTIFICATION_ENABLED_PATHS.some(p => pathname.startsWith(p));
        if (isEnabled) {
          toast.info(`📦 ${pendingItems.length} new order item${pendingItems.length > 1 ? "s" : ""} received!`, { duration: 5000 });
        }
      } else {
        console.log("ℹ️ No new notifications to add from socket");
      }
    });

    return () => {
      console.log("🧹 Cleaning up Socket.IO");
      socket.off("new_order");
      socket.disconnect();
      socketRef.current = null;
      isSocketConnected.current = false;
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
        pollingActiveRef.current = false;
      }
    };
  }, [pathname, startRinging, addNewNotifications, syncNotifications]);

  // ---- triggerNewOrder (called from cart) ----
  const triggerNewOrder = useCallback(async (order) => {
    console.log("🛒 triggerNewOrder called with order:", order);
    if (!order?.items) return;
    const pendingItems = order.items.filter(item => item.status === "pending");
    if (pendingItems.length === 0) return;

    const newNotifs = [];
    for (const item of pendingItems) {
      const key = `${order._id}-${item._id}`;
      if (notifIdsRef.current.has(key)) continue;
      const shortId = order._id.substring(order._id.length - 8);
      const message = `New order #${shortId} - ${item.productName} (Qty: ${item.quantity || 1})`;
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
      toast.info(`📦 ${pendingItems.length} new order item${pendingItems.length > 1 ? "s" : ""} placed!`, { duration: 5000 });
    }
  }, [pathname, addNewNotifications]);

  // ---- Polling (fallback) – with path check ----
  useEffect(() => {
    const isEnabled = NOTIFICATION_ENABLED_PATHS.some(p => pathname.startsWith(p));

    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      lastSyncTimeRef.current = 0;
      if (isEnabled) {
        console.log("🔄 Initial sync on mount (path enabled)");
        syncNotifications(false);
      } else {
        console.log("⏭️ Initial sync skipped – path not enabled");
      }
    }

    // Start polling only if path is enabled AND socket is not connected AND not already polling
    if (isEnabled && !isSocketConnected.current && !pollingActiveRef.current) {
      pollingActiveRef.current = true;
      pollingIntervalRef.current = setInterval(() => {
        console.log("⏰ Polling tick (enabled path)");
        syncNotifications(false);
      }, POLLING_INTERVAL);
      console.log(`🔄 Polling started – interval: ${POLLING_INTERVAL}ms`);
    } else if (!isEnabled && pollingActiveRef.current) {
      // Stop polling if path becomes disabled
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      pollingActiveRef.current = false;
      console.log("🛑 Polling stopped – path not enabled");
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
        pollingActiveRef.current = false;
        console.log("🛑 Polling stopped on unmount");
      }
      stopRinging("component unmount");
    };
  }, [pathname, syncNotifications, stopRinging]);

  // ---- Refresh functions ----
  const refreshNotificationsSilent = useCallback(() => {
    console.log("🔄 refreshNotificationsSilent called");
    lastSyncTimeRef.current = 0;
    syncNotifications(true);
  }, [syncNotifications]);

  const refreshNotificationsWithSound = useCallback(() => {
    console.log("🔄 refreshNotificationsWithSound called");
    lastSyncTimeRef.current = 0;
    syncNotifications(false);
  }, [syncNotifications]);

  // ---- Mark all as read ----
  const markAllAsRead = useCallback(() => {
    console.log("📬 markAllAsRead called");
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    if (isRingingRef.current) {
      console.log("🔕 Stopping ringing after mark all read");
      stopRinging("mark all read");
    }
  }, [stopRinging]);

  // ---- markAsRead ----
  const markAsRead = useCallback((id) => {
    console.log(`📬 markAsRead called for id: ${id}`);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setTimeout(() => {
      const unread = notifications.filter(n => !n.read).length;
      if (unread === 0 && isRingingRef.current) {
        console.log("🔕 Stopping ringing because all read");
        stopRinging("all read");
      }
    }, 100);
  }, [notifications, stopRinging]);

  // ---- Clear all ----
  const clearAll = useCallback(() => {
    console.log("🗑️ clearAll called");
    setNotifications([]);
    notifIdsRef.current.clear();
    stopRinging("clear all");
  }, [stopRinging]);

  // ---- Toggle sound ----
  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => {
      console.log(`🔊 Toggling sound: ${!prev}`);
      return !prev;
    });
  }, []);

  // ---- Test emit ----
  const testEmit = useCallback(() => {
    if (socketRef.current?.connected) {
      console.log("📡 Emitting test_event");
      socketRef.current.emit("test_event", { from: "frontend", time: Date.now() });
    } else {
      console.warn("⚠️ Socket not connected");
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
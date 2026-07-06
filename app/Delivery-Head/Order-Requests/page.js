"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useOrderNotifications } from "@/context/OrderNotificationContext";
import { getAllOrders, updateItemStatus } from "@/app/services/orderAPI";

export default function DeliveryHeadOrderRequestsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { refreshNotificationsWithSound, stopRinging } = useOrderNotifications();

  // ---------- Fetch orders ----------
  const {
    data: orders = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      console.log("🔄 Fetching orders...");
      const response = await getAllOrders();
      if (!response.success) throw new Error("Failed to load orders");
      console.log("✅ Orders fetched:", response.data?.length || 0);
      return response.data;
    },
    refetchInterval: 30000,
    staleTime: 10000,
    refetchOnWindowFocus: false,
  });

  // ---------- Accept (mark as assigned) ----------
  const acceptMutation = useMutation({
    mutationFn: ({ orderId, itemId }) => {
      console.log(`📤 Accepting order: ${orderId}, item: ${itemId} → status: "assigned"`);
      return updateItemStatus(orderId, itemId, "assigned");
    },
    onSuccess: async (data, variables) => {
      console.log("✅ Accept mutation success. Updated order:", data);
      toast.success("Order accepted for delivery!");
      stopRinging();

      // Optimistically update cache
      queryClient.setQueryData(["orders"], (oldData) => {
        if (!oldData) return oldData;
        const newData = oldData.map(order => {
          if (order._id === variables.orderId) {
            return {
              ...order,
              items: order.items.map(item => {
                if (item._id === variables.itemId) {
                  return { ...item, status: "assigned" };
                }
                return item;
              })
            };
          }
          return order;
        });
        console.log("📦 Optimistic cache updated:", newData);
        return newData;
      });

      await queryClient.invalidateQueries({ queryKey: ["orders"] });
      await refetch();
      refreshNotificationsWithSound();
    },
    onError: (error) => {
      console.error("❌ Accept mutation error:", error);
      toast.error("Failed to accept order");
    },
  });

  // ---------- Reject (cancel) ----------
  const rejectMutation = useMutation({
    mutationFn: ({ orderId, itemId }) => {
      console.log(`📤 Rejecting order: ${orderId}, item: ${itemId} → status: "cancelled"`);
      return updateItemStatus(orderId, itemId, "cancelled");
    },
    onSuccess: async (data, variables) => {
      console.log("✅ Reject mutation success.");
      toast.success("Order cancelled!");
      stopRinging();

      queryClient.setQueryData(["orders"], (oldData) => {
        if (!oldData) return oldData;
        return oldData.map(order => {
          if (order._id === variables.orderId) {
            return {
              ...order,
              items: order.items.map(item => {
                if (item._id === variables.itemId) {
                  return { ...item, status: "cancelled" };
                }
                return item;
              })
            };
          }
          return order;
        });
      });

      await queryClient.invalidateQueries({ queryKey: ["orders"] });
      await refetch();
      refreshNotificationsWithSound();
    },
    onError: (error) => {
      console.error("❌ Reject mutation error:", error);
      toast.error("Failed to cancel order");
    },
  });

  const handleAccept = (orderId, itemId) => {
    if (!confirm("Accept this order for delivery?")) return;
    acceptMutation.mutate({ orderId, itemId });
  };

  const handleReject = (orderId, itemId) => {
    if (!confirm("Cancel this order?")) return;
    rejectMutation.mutate({ orderId, itemId });
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // Filter items with status "processing"
  const processingItems = [];
  orders.forEach(order => {
    (order.items || []).forEach(item => {
      if (item.status === "processing") {
        processingItems.push({ order, item });
      }
    });
  });
  console.log(`📊 Processing items count: ${processingItems.length}`);
  console.log("📋 Processing items:", processingItems.map(p => ({ orderId: p.order._id, itemId: p.item._id, status: p.item.status })));

  const isLoadingAction = acceptMutation.isPending || rejectMutation.isPending;

  return (
    <div className="container-fluid px-4">
      <div className="row mt-4">
        <div className="col-12">
          <h4 className="mb-3">
            Delivery Orders <span className="text-muted fs-6">({processingItems.length})</span>
          </h4>

          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : processingItems.length === 0 ? (
            <div className="text-center text-muted py-5">
              <h5>No orders ready for delivery</h5>
              <p>All orders have been processed.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Product / Quantity</th>
                    <th>Order Code / Created</th>
                    <th>Price / Prepayment</th>
                    <th>Store</th>
                    <th>Customer</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {processingItems.map(({ order, item }) => {
                    const key = `${order._id}-${item._id}`;
                    const itemTotal = (item.mrp || 0) * (item.quantity || 1);
                    const prepayment = itemTotal * 0.3;

                    const isThisItemLoading =
                      (acceptMutation.isPending && acceptMutation.variables?.itemId === item._id) ||
                      (rejectMutation.isPending && rejectMutation.variables?.itemId === item._id);

                    return (
                      <tr key={key}>
                        <td>
                          <div className="fw-semibold">{item.productName}</div>
                          <small className="text-muted">QTY: {item.quantity || 1}</small>
                        </td>
                        <td>
                          <div className="fw-semibold">
                            {order._id.substring(order._id.length - 8)}
                          </div>
                          <small className="text-muted">
                            Created: {formatDate(order.createdAt)}
                          </small>
                        </td>
                        <td>
                          <div>${itemTotal.toFixed(2)}</div>
                          <small className="text-muted">
                            / ${prepayment.toFixed(2)} prepayment
                          </small>
                        </td>
                        <td>{item.storeName || order.items?.[0]?.storeName || "N/A"}</td>
                        <td>
                          <div>Guest</div>
                          <small className="text-muted">customer@example.com</small>
                        </td>
                        <td>
                          <div className="d-flex gap-1 flex-wrap">
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => handleAccept(order._id, item._id)}
                              disabled={isThisItemLoading || isLoadingAction}
                            >
                              {isThisItemLoading && acceptMutation.isPending ? (
                                <span className="spinner-border spinner-border-sm" />
                              ) : (
                                "Accept"
                              )}
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleReject(order._id, item._id)}
                              disabled={isThisItemLoading || isLoadingAction}
                            >
                              {isThisItemLoading && rejectMutation.isPending ? (
                                <span className="spinner-border spinner-border-sm" />
                              ) : (
                                "Reject"
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllOrders, updateItemStatus, deleteItem } from "../../services/orderAPI";
import { toast } from "sonner";
import { useOrderNotifications } from "@/context/OrderNotificationContext";
// reuse existing styles

export default function OrderRequestsPage() {
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
      const response = await getAllOrders();
      if (!response.success) throw new Error("Failed to load orders");
      return response.data;
    },
    refetchInterval: 30000,
    staleTime: 10000,
    refetchOnWindowFocus: false,
  });

  // ---------- Accept Mutation (moves to All Orders) ----------
  const acceptMutation = useMutation({
    mutationFn: ({ orderId, itemId }) => updateItemStatus(orderId, itemId, "processing"),
    onSuccess: async (data, variables) => {
      toast.success("Order accepted! Redirecting to All Orders...");
      stopRinging();

      // Remove the item from the request list optimistically
      queryClient.setQueryData(["orders"], (oldData) => {
        if (!oldData) return oldData;
        return oldData.map(order => {
          if (order._id === variables.orderId) {
            return {
              ...order,
              items: order.items.map(item => {
                if (item._id === variables.itemId) {
                  return { ...item, status: "processing" };
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

      // ✅ Redirect to All Orders page
      router.push("/All-store-management/All-Orders");
    },
    onError: () => toast.error("Failed to accept order"),
  });

  // ---------- Reject Mutation (delete) ----------
  const rejectMutation = useMutation({
    mutationFn: ({ orderId, itemId }) => deleteItem(orderId, itemId),
    onSuccess: async (data, variables) => {
      toast.success("Order rejected and deleted!");
      stopRinging();

      // Remove the item from the list optimistically
      queryClient.setQueryData(["orders"], (oldData) => {
        if (!oldData) return oldData;
        return oldData.map(order => {
          if (order._id === variables.orderId) {
            return {
              ...order,
              items: order.items.filter(item => item._id !== variables.itemId)
            };
          }
          return order;
        }).filter(order => order.items.length > 0);
      });

      await queryClient.invalidateQueries({ queryKey: ["orders"] });
      await refetch();
      refreshNotificationsWithSound();
    },
    onError: () => toast.error("Failed to reject order"),
  });

  // ---------- Handlers ----------
  const handleAccept = (orderId, itemId) => {
    if (!confirm("Accept this order request?")) return;
    acceptMutation.mutate({ orderId, itemId });
  };

  const handleReject = (orderId, itemId) => {
    if (!confirm("Reject this order? It will be permanently deleted.")) return;
    rejectMutation.mutate({ orderId, itemId });
  };

  // ---------- UI Helpers ----------
  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // Filter only pending items
  const pendingItems = [];
  orders.forEach(order => {
    (order.items || []).forEach(item => {
      if (item.status === "pending") {
        pendingItems.push({ order, item });
      }
    });
  });

  const isLoadingAction = acceptMutation.isPending || rejectMutation.isPending;

  return (
    <div className="container-fluid px-4">
      <div className="row mt-4">
        <div className="col-12">
          <h4 className="mb-3">
            Order Requests <span className="text-muted fs-6">({pendingItems.length})</span>
          </h4>

          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : pendingItems.length === 0 ? (
            <div className="text-center text-muted py-5">
              <h5>No pending requests</h5>
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
                    <th>Seller</th>
                    <th>Customer</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingItems.map(({ order, item }) => {
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
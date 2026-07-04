"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllOrders, updateItemStatus, deleteItem } from "../../services/orderAPI";
import { toast } from "sonner";
import { useOrderNotifications } from "@/context/OrderNotificationContext";
import "./orders.css";

export default function OrdersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { refreshNotificationsWithSound, stopRinging } = useOrderNotifications();
  const [activeStatus, setActiveStatus] = useState("Requests");

  // ---------- Fetch orders with real-time updates ----------
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

  // ---------- Mutations with immediate UI updates ----------
  const acceptMutation = useMutation({
    mutationFn: ({ orderId, itemId }) => updateItemStatus(orderId, itemId, "processing"),
    onSuccess: async (data, variables) => {
      toast.success("Product accepted!");
      stopRinging();
      
      // ✅ Update local state immediately
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
      
      // ✅ Then refetch in background
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
      await refetch();
      refreshNotificationsWithSound();
    },
    onError: () => toast.error("Failed to accept product"),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ orderId, itemId }) => updateItemStatus(orderId, itemId, "cancelled"),
    onSuccess: async (data, variables) => {
      toast.success("Product rejected!");
      stopRinging();
      
      // ✅ Update local state immediately
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
      
      // ✅ Then refetch in background
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
      await refetch();
      refreshNotificationsWithSound();
    },
    onError: () => toast.error("Failed to reject product"),
  });

  const deleteMutation = useMutation({
    mutationFn: ({ orderId, itemId }) => deleteItem(orderId, itemId),
    onSuccess: async (data, variables) => {
      toast.success(`"${variables.productName}" deleted!`);
      stopRinging();
      
      // ✅ Update local state immediately - remove the item
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
        }).filter(order => order.items.length > 0); // Remove orders with no items
      });
      
      // ✅ Then refetch in background
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
      await refetch();
      refreshNotificationsWithSound();
    },
    onError: () => toast.error("Failed to delete item"),
  });

  // ---------- Handlers ----------
  const handleAccept = (orderId, itemId) => {
    if (!confirm("Accept this product?")) return;
    acceptMutation.mutate({ orderId, itemId });
  };

  const handleReject = (orderId, itemId) => {
    if (!confirm("Reject this product?")) return;
    rejectMutation.mutate({ orderId, itemId });
  };

  const handleDeleteItem = (orderId, itemId, productName) => {
    if (!confirm(`Delete "${productName}" from this order?`)) return;
    deleteMutation.mutate({ orderId, itemId, productName });
  };

  // ---------- UI Helpers (unchanged) ----------
  const statusMap = {
    "Requests": "pending",
    "Accepted Requests": "processing",
    "Prepayment Requests": "pending",
    "Confirmed Prepayments": "processing",
    "Final Preorders": "completed",
    "In Shipping": "processing",
    "Delivered": "completed",
    "Refund": "cancelled",
  };

  const statusLabels = [
    "All",
    "Requests",
    "Accepted Requests",
    "Prepayment Requests",
    "Confirmed Prepayments",
    "Final Preorders",
    "In Shipping",
    "Delivered",
    "Refund",
  ];

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: "bg-warning text-dark",
      processing: "bg-info text-white",
      completed: "bg-success text-white",
      cancelled: "bg-danger text-white",
    };
    return map[status] || "bg-secondary";
  };

  const getCount = (label) => {
    let count = 0;
    orders.forEach((order) => {
      (order.items || []).forEach((item) => {
        if (label === "All") {
          if (item.status !== "pending") count++;
        } else {
          const mapped = statusMap[label];
          if (item.status === mapped) count++;
        }
      });
    });
    return count;
  };

  const expandedRows = [];
  orders.forEach((order) => {
    (order.items || []).forEach((item) => {
      let include = false;
      if (activeStatus === "All") {
        include = item.status !== "pending";
      } else {
        const mapped = statusMap[activeStatus];
        include = item.status === mapped;
      }
      if (include) expandedRows.push({ order, item });
    });
  });

  const isLoadingAction =
    acceptMutation.isPending ||
    rejectMutation.isPending ||
    deleteMutation.isPending;

  // ---------- Render ----------
  return (
    <div className="container-fluid px-4">
      <div className="row mt-4">
        <div className="col-12">
          <h4 className="mb-3">All Preorders</h4>

          {/* Filter Tabs */}
          <div className="d-flex flex-wrap gap-2 mb-3">
            {statusLabels.map((label) => (
              <button
                key={label}
                className={`btn btn-sm ${
                  activeStatus === label ? "btn-primary" : "btn-outline-secondary"
                }`}
                onClick={() => setActiveStatus(label)}
              >
                {label} ({getCount(label)})
              </button>
            ))}
          </div>

          {/* Orders Table */}
          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : expandedRows.length === 0 ? (
            <div className="text-center text-muted py-5">
              <h5>No items found</h5>
              <p>Try changing the filter or place an order.</p>
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
                    <th>Status</th>
                    <th>Refund</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expandedRows.map(({ order, item }) => {
                    const isPending = item.status === "pending";
                    const key = `${order._id}-${item._id}`;
                    const itemTotal = (item.mrp || 0) * (item.quantity || 1);
                    const prepayment = itemTotal * 0.3;

                    const isThisItemLoading =
                      (acceptMutation.isPending && acceptMutation.variables?.itemId === item._id) ||
                      (rejectMutation.isPending && rejectMutation.variables?.itemId === item._id) ||
                      (deleteMutation.isPending && deleteMutation.variables?.itemId === item._id);

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
                          <span className={`badge ${getStatusBadge(item.status)}`}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-success">Refundable</span>
                        </td>
                        <td>
                          <div className="d-flex gap-1 flex-wrap">
                            {isPending ? (
                              <>
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
                              </>
                            ) : (
                              <>
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => router.push(`/pharma-dashboard/orders/${order._id}`)}
                                >
                                  <i className="bi bi-eye"></i>
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDeleteItem(order._id, item._id, item.productName)}
                                  disabled={isThisItemLoading || isLoadingAction}
                                >
                                  {isThisItemLoading && deleteMutation.isPending ? (
                                    <span className="spinner-border spinner-border-sm" />
                                  ) : (
                                    <i className="bi bi-trash"></i>
                                  )}
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() => toast.info("Download invoice for order " + order._id)}
                                >
                                  <i className="bi bi-download"></i>
                                </button>
                              </>
                            )}
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
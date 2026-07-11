"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllOrders, updateItemStatus, deleteItem } from "../../services/orderAPI";
import { toast } from "sonner";
import { useOrderNotifications } from "@/context/OrderNotificationContext";
import "./all-orders.css";  
export default function AllOrdersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { refreshNotificationsWithSound, stopRinging } = useOrderNotifications();

  // ---------- Fetch all orders ----------
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

  // ---------- Mutations ----------
  const acceptMutation = useMutation({
    mutationFn: ({ orderId, itemId }) => updateItemStatus(orderId, itemId, "processing"),
    onSuccess: async (data, variables) => {
      toast.success("Product accepted!");
      stopRinging();
      queryClient.setQueryData(["orders"], (oldData) =>
        oldData?.map(order =>
          order._id === variables.orderId
            ? { ...order, items: order.items.map(item =>
                item._id === variables.itemId ? { ...item, status: "processing" } : item
              ) }
            : order
        )
      );
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
      queryClient.setQueryData(["orders"], (oldData) =>
        oldData?.map(order =>
          order._id === variables.orderId
            ? { ...order, items: order.items.map(item =>
                item._id === variables.itemId ? { ...item, status: "cancelled" } : item
              ) }
            : order
        )
      );
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
      queryClient.setQueryData(["orders"], (oldData) =>
        oldData
          ?.map(order =>
            order._id === variables.orderId
              ? { ...order, items: order.items.filter(item => item._id !== variables.itemId) }
              : order
          )
          .filter(order => order.items.length > 0)
      );
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

  // ---------- UI Helpers ----------
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
      assigned: "bg-primary text-white",
    };
    return map[status] || "bg-secondary text-white";
  };

  // Flatten items (EXCLUDE pending)
  const allItems = [];
  orders.forEach(order => {
    (order.items || []).forEach(item => {
      if (item.status !== "pending") {
        allItems.push({ order, item });
      }
    });
  });

  const isLoadingAction =
    acceptMutation.isPending ||
    rejectMutation.isPending ||
    deleteMutation.isPending;

  return (
    <div className="container-fluid py-4">


      <div className="card border-0 shadow-sm rounded-4">

        {/* Header */}
        <div className="card-header bg-white border-0 py-3 px-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <h5 className="fw-bold mb-0">
              All Orders
              <span className="badge bg-light text-dark ms-2">
                {allItems.length}
              </span>
            </h5>

            {/* ✅ FILTER BAR – forced inline with flex */}
            <div className="filter-bar">
              <select className="form-select form-select-sm" style={{ width: 'auto', minWidth: '140px' }}>
                <option>Bulk Action</option>
              </select>

              <select className="form-select form-select-sm" style={{ width: 'auto', minWidth: '180px' }}>
                <option>Filter by Delivery Status</option>
              </select>

              <select className="form-select form-select-sm" style={{ width: 'auto', minWidth: '100px' }}>
                <option>Paid</option>
                <option>Un-Paid</option>
              </select>

              <input
                type="date"
                className="form-control form-control-sm"
                style={{ width: 'auto', minWidth: '140px' }}
              />

              <input
                type="text"
                placeholder="Type Order code & hit Enter"
                className="form-control form-control-sm"
                style={{ width: 'auto', minWidth: '200px' }}
              />

              <button className="btn btn-primary btn-sm px-4" style={{ whiteSpace: 'nowrap' }}>
                Filter
              </button>
            </div>
          </div>
        </div>

        <div className="card-body p-0">

          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
            </div>
          ) : allItems.length === 0 ? (
            <div className="text-center py-5">
              <h5>No Orders Found</h5>
              <p className="text-muted">All orders have been processed.</p>
            </div>
          ) : (
            <div className="order-table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Order Code</th>
                    <th>Num. of Products</th>
                    <th>Customer</th>
                    <th>Seller</th>
                    <th>Amount</th>
                    <th>Delivery Status</th>
                    <th>Payment method</th>
                    <th>Payment Status</th>
                    <th className="text-center">Options</th>
                  </tr>
                </thead>
                <tbody>
                  {allItems.map(({ order, item }) => {
                    const key = `${order._id}-${item._id}`;
                    const isPending = item.status === "pending";
                    const isThisItemLoading =
                      (acceptMutation.isPending && acceptMutation.variables?.itemId === item._id) ||
                      (rejectMutation.isPending && rejectMutation.variables?.itemId === item._id) ||
                      (deleteMutation.isPending && deleteMutation.variables?.itemId === item._id);

                    return (
                      <tr key={key}>
                        <td>
                          <div className="fw-semibold">
                            {order._id}
                          </div>
                          <small className="text-muted">
                            {formatDate(order.createdAt)}
                          </small>
                        </td>
                        <td>{order.items?.length || 0}</td>
                        <td>Guest</td>
                        <td>
                          {item.storeName ||
                            order.items?.[0]?.storeName ||
                            "Inhouse Order"}
                        </td>
                        <td className="fw-semibold">
                          ₹{(order.total || 0).toFixed(2)}
                        </td>
                        <td>
                          <span className={`badge rounded-pill px-3 py-2 ${getStatusBadge(item.status)}`}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </span>
                        </td>
                        <td>Cash on Delivery</td>
                        <td>
                          <span className="badge bg-danger rounded-pill px-3 py-2">
                            Un-Paid
                          </span>
                        </td>
                        <td>
                          <div className="d-flex justify-content-center gap-2">
                            {isPending ? (
                              <>
                                <button
                                  className="btn btn-success btn-sm rounded-pill px-3"
                                  onClick={() => handleAccept(order._id, item._id)}
                                  disabled={isThisItemLoading || isLoadingAction}
                                >
                                  Accept
                                </button>
                                <button
                                  className="btn btn-danger btn-sm rounded-pill px-3"
                                  onClick={() => handleReject(order._id, item._id)}
                                  disabled={isThisItemLoading || isLoadingAction}
                                >
                                  Reject
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  className="btn btn-light rounded-circle shadow-sm"
                                  onClick={() =>
                                    router.push(`/All-store-management/Order-Details`)
                                  }
                                >
                                  <i className="bi bi-eye text-primary"></i>
                                </button>
                                <button
                                  className="btn btn-light rounded-circle shadow-sm"
                                  onClick={() =>
                                    toast.info("Download invoice for order " + order._id)
                                  }
                                >
                                  <i className="bi bi-download text-secondary"></i>
                                </button>
                                <button
                                  className="btn btn-light rounded-circle shadow-sm"
                                  onClick={() =>
                                    handleDeleteItem(order._id, item._id, item.productName)
                                  }
                                  disabled={isThisItemLoading || isLoadingAction}
                                >
                                  <i className="bi bi-trash text-danger"></i>
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
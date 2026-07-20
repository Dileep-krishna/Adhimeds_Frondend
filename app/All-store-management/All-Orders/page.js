"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOrdersByStore, deleteItem } from "../../services/orderAPI";
import { getStoreId } from "@/utils/jwtHelper";
import { toast } from "sonner";
import "./all-orders.css";

export default function AllOrdersPage() {
  const router = useRouter();
  const storeId = getStoreId();
  const queryClient = useQueryClient();

  console.log("🔍 AllOrdersPage: storeId =", storeId);

  const {
    data: orders = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["orders", storeId],
    queryFn: async () => {
      if (!storeId) return [];
      console.log("🔄 Fetching orders for storeId:", storeId);
      const response = await getOrdersByStore(storeId);
      console.log("📦 Raw API response:", response);
      if (!response.success) throw new Error("Failed to load orders");
      const filtered = response.data.filter(order => order.items && order.items.length > 0);
      console.log("📦 Orders after filtering (non-empty):", filtered);
      return filtered;
    },
    enabled: !!storeId,
    refetchInterval: 30000,
    staleTime: 10000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    refetch();
  }, []);

  const deleteOrderMutation = useMutation({
    mutationFn: async (orderId) => {
      const order = orders.find(o => o._id === orderId);
      if (!order) throw new Error("Order not found");
      for (const item of order.items) {
        await deleteItem(orderId, item._id);
      }
    },
    onSuccess: async (data, orderId) => {
      toast.success(`Order ${orderId} deleted.`);
      await queryClient.invalidateQueries({ queryKey: ["orders", storeId] });
      await refetch();
    },
    onError: (error, orderId) => {
      toast.error(`Failed to delete order ${orderId}.`);
      refetch();
    },
  });

  const handleDeleteOrder = (orderId) => {
    if (!confirm(`Delete entire order ${orderId}?`)) return;
    deleteOrderMutation.mutate(orderId);
  };

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
      confirmed: "bg-info text-white",
      processing: "bg-primary text-white",
      completed: "bg-success text-white",
      cancelled: "bg-danger text-white",
      assigned: "bg-secondary text-white",
    };
    return map[status] || "bg-secondary text-white";
  };

  if (!storeId) {
    return <div className="alert alert-warning">No store ID found. Please log in again.</div>;
  }

  return (
    <div className="orders-page-wrapper">
      <div className="container-fluid py-4">
        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-header bg-white border-0 py-3 px-4">
            <h5 className="fw-bold mb-0">
              Order History
              <span className="badge bg-light text-dark ms-2">{orders.length}</span>
            </h5>
          </div>
          <div className="card-body p-0">
            {isLoading ? (
              <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
            ) : orders.length === 0 ? (
              <div className="text-center py-5">
<h5 className="fw-bold empty-title">No Orders Found</h5>
                <p className="text-muted">You have no orders yet.</p>
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
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => {
                      const statuses = order.items.map(item => item.status);
                      const hasPending = statuses.includes("pending");
                      const hasConfirmed = statuses.includes("confirmed");
                      const hasProcessing = statuses.includes("processing");
                      const hasCancelled = statuses.includes("cancelled");
                      const hasAssigned = statuses.includes("assigned");

                      let displayStatus = "pending";
                      if (hasCancelled) displayStatus = "cancelled";
                      else if (hasAssigned) displayStatus = "assigned";
                      else if (hasConfirmed) displayStatus = "confirmed";
                      else if (hasProcessing) displayStatus = "processing";

                      return (
                        <tr key={order._id}>
                          <td>
                            <div className="fw-semibold">{order._id}</div>
                            <small className="text-muted">{formatDate(order.createdAt)}</small>
                          </td>
                          <td>{order.items?.length || 0}</td>
                          <td>Guest</td>
                          <td>{order.items?.[0]?.storeName || "Inhouse Order"}</td>
                          <td className="fw-semibold">₹{(order.total || 0).toFixed(2)}</td>
                          <td>
                            <span className={`badge rounded-pill px-3 py-2 ${getStatusBadge(displayStatus)}`}>
                              {displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
                            </span>
                          </td>
                          <td>Cash on Delivery</td>
                          <td><span className="badge bg-danger rounded-pill px-3 py-2">Un-Paid</span></td>
                          <td>
                            <div className="d-flex justify-content-center gap-2">
                              <button
                                className="btn btn-light rounded-circle shadow-sm"
                                onClick={() => router.push(`/All-store-management/Order-Details?id=${order._id}`)}
                                title="View Details"
                              >
                                <i className="bi bi-eye text-primary"></i>
                              </button>
                              <button
                                className="btn btn-light rounded-circle shadow-sm"
                                onClick={() => toast.info("Download invoice for order " + order._id)}
                                title="Download Invoice"
                              >
                                <i className="bi bi-download text-secondary"></i>
                              </button>
                              <button
                                className="btn btn-light rounded-circle shadow-sm"
                                onClick={() => handleDeleteOrder(order._id)}
                                disabled={deleteOrderMutation.isPending}
                                title="Delete Order"
                              >
                                <i className="bi bi-trash text-danger"></i>
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
    </div>
  );
}
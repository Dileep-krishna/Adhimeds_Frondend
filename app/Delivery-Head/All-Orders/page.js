"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getAllOrders, updateItemStatus } from "@/app/services/orderAPI";
import { getDeliveryBoysAPI } from "@/app/services/deliveryService";

export default function DeliveryHeadAllOrdersPage() {
  const queryClient = useQueryClient();

  // Fetch orders
  const { data: orders = [], isLoading: ordersLoading, refetch } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const res = await getAllOrders();
      if (!res.success) throw new Error("Failed to load orders");
      console.log("📦 Orders fetched:", res.data);
      return res.data || [];
    },
    refetchInterval: 30000,
    staleTime: 10000,
  });

  // Fetch delivery boys
  const { data: deliveryBoys = [], isLoading: boysLoading } = useQuery({
    queryKey: ["deliveryBoys"],
    queryFn: async () => {
      const response = await getDeliveryBoysAPI();
      console.log("📦 Raw delivery boys response:", response);
      let boys = [];
      if (Array.isArray(response)) {
        boys = response;
      } else if (response?.data && Array.isArray(response.data)) {
        boys = response.data;
      } else if (response?.body && Array.isArray(response.body)) {
        boys = response.body;
      } else {
        console.warn("⚠️ Unexpected response format:", response);
      }
      console.log("✅ Extracted delivery boys:", boys);
      return boys;
    },
    staleTime: 60000,
    placeholderData: (prev) => prev,
  });

  const [selectedBoyMap, setSelectedBoyMap] = useState({});

  // Assign mutation
  const assignMutation = useMutation({
    mutationFn: async ({ orderId, itemId, boyId }) => {
      // ✅ Ensure boyId is a plain string
      const boyIdString = String(boyId);
      console.log(`📤 Assigning order ${orderId} item ${itemId} to boy ${boyIdString}`);
      const result = await updateItemStatus(orderId, itemId, "assigned", boyIdString);
      console.log("📥 Backend response:", result);
      return result;
    },
    onSuccess: (data, variables) => {
      const boy = deliveryBoys.find(b => (b.id || b._id) === variables.boyId);
      toast.success(`Order assigned to ${boy?.name || 'delivery boy'}`);

      if (data?.data) {
        queryClient.setQueryData(["orders"], (oldData) => {
          if (!oldData) return oldData;
          return oldData.map(order => {
            if (order._id === variables.orderId) {
              return data.data;
            }
            return order;
          });
        });
      }

      refetch();
      setSelectedBoyMap(prev => ({ ...prev, [variables.itemId]: "" }));
    },
    onError: (error) => {
      console.error("❌ Assign error:", error);
      toast.error("Failed to assign order");
    },
  });

  const handleAssign = (orderId, itemId, boyId) => {
    if (!boyId) return toast.error("Select a delivery boy");
    if (!confirm("Assign this order?")) return;
    // ✅ Send boyId as string
    assignMutation.mutate({ orderId, itemId, boyId: String(boyId) });
  };

  // Filter items with status "assigned"
  const assignableItems = [];
  orders.forEach(order => {
    (order.items || []).forEach(item => {
      if (item.status === "assigned") {
        assignableItems.push({ order, item });
      }
    });
  });

  console.log(`📊 Assigned items count: ${assignableItems.length}`);
  console.log("📋 Delivery boys count:", deliveryBoys.length);

  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: '2-digit', day: '2-digit'
  });

  const isLoading = ordersLoading || boysLoading;

  return (
    <div className="container-fluid px-4">
      <div className="row mt-4">
        <div className="col-12">
          <h4 className="mb-3">
            Assign Delivery Boys <span className="text-muted fs-6">({assignableItems.length})</span>
          </h4>

          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" />
            </div>
          ) : assignableItems.length === 0 ? (
            <div className="text-center text-muted py-5">
              <h5>No orders ready for assignment</h5>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Product / Qty</th>
                    <th>Order Code / Created</th>
                    <th>Store / District</th>
                    <th>Customer</th>
                    <th>Assignment Status</th>
                    <th>Assign to Boy</th>
                  </tr>
                </thead>
                <tbody>
                  {assignableItems.map(({ order, item }) => {
                    const selectedBoyId = selectedBoyMap[item._id] || "";
                    const isMutating = assignMutation.isPending && assignMutation.variables?.itemId === item._id;

                    const storeDistrict = item.storeDistrict || order.storeDistrict || "N/A";
                    const filteredBoys = deliveryBoys.filter(boy => 
                      boy.district?.toLowerCase() === storeDistrict?.toLowerCase() || !storeDistrict || storeDistrict === "N/A"
                    );

                    return (
                      <tr key={`${order._id}-${item._id}`}>
                        <td>
                          <div className="fw-semibold">{item.productName}</div>
                          <small className="text-muted">QTY: {item.quantity}</small>
                        </td>
                        <td>
                          <div className="fw-semibold">#{order._id.slice(-8)}</div>
                          <small className="text-muted">Created: {formatDate(order.createdAt)}</small>
                        </td>
                        <td>
                          <div className="fw-semibold">{item.storeName || "N/A"}</div>
                          <small className="text-muted">
                            <i className="bi bi-geo-alt me-1"></i>
                            {storeDistrict}
                          </small>
                        </td>
                        <td>Guest</td>
                        <td>
                          {item.assignedTo ? (
                            <span className="badge bg-success text-white">
                              <i className="bi bi-check-circle me-1"></i>
                              Assigned to {deliveryBoys.find(b => (b.id || b._id) === item.assignedTo)?.name || 'Boy'}
                            </span>
                          ) : (
                            <span className="badge bg-warning text-dark">
                              <i className="bi bi-clock me-1"></i>
                              Pending Assignment
                            </span>
                          )}
                        </td>
                        <td>
                          <div className="d-flex gap-2 align-items-center">
                            <select
                              className="form-select form-select-sm"
                              style={{ minWidth: "180px" }}
                              value={selectedBoyId}
                              onChange={(e) =>
                                setSelectedBoyMap(prev => ({
                                  ...prev,
                                  [item._id]: e.target.value,
                                }))
                              }
                              disabled={isMutating || !!item.assignedTo}
                            >
                              <option value="">Select boy</option>
                              {filteredBoys.length === 0 ? (
                                <option value="" disabled>No boys in this district</option>
                              ) : (
                                filteredBoys.map((boy) => (
                                  <option key={boy.id || boy._id} value={boy.id || boy._id}>
                                    {boy.name} ({boy.district || "N/A"})
                                  </option>
                                ))
                              )}
                            </select>
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => handleAssign(order._id, item._id, selectedBoyId)}
                              disabled={!selectedBoyId || isMutating || filteredBoys.length === 0 || !!item.assignedTo}
                            >
                              {isMutating ? <span className="spinner-border spinner-border-sm" /> : "Assign"}
                            </button>
                          </div>
                          {filteredBoys.length === 0 && storeDistrict !== "N/A" && (
                            <small className="text-danger d-block mt-1">
                              ⚠️ No delivery boys in {storeDistrict} district
                            </small>
                          )}
                          {item.assignedTo && (
                            <small className="text-success d-block mt-1">
                              ✅ Already assigned
                            </small>
                          )}
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
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getOrdersByStore, updateItemStatus } from "@/app/services/orderAPI";
import { getDeliveryBoysAPI } from "@/app/services/deliveryService";
import { getStoreId } from "@/utils/jwtHelper"; // ✅ Import helper

export default function DeliveryHeadAllOrdersPage() {
  const queryClient = useQueryClient();

  // ✅ Use getStoreId() to get the correct ObjectId
  const storeId = getStoreId();
  console.log(`🏪 Assign page store ID (ObjectId): ${storeId}`);

  // Fetch orders for this store
  const { data: orders = [], isLoading: ordersLoading, refetch } = useQuery({
    queryKey: ["orders", storeId],
    queryFn: async () => {
      if (!storeId) return [];
      const res = await getOrdersByStore(storeId);
      if (!res.success) throw new Error("Failed to load orders");
      console.log("📦 Raw orders from API:", res.data);
      // Log each item status for debugging
      res.data.forEach(order => {
        console.log(`🔎 Order ${order._id}:`);
        order.items.forEach(item => {
          console.log(`   - ${item.productName} | status: ${item.status}`);
        });
      });
      return res.data || [];
    },
    enabled: !!storeId,
    refetchInterval: 30000,
    staleTime: 10000,
  });

  // Fetch delivery boys
  const { data: deliveryBoys = [], isLoading: boysLoading } = useQuery({
    queryKey: ["deliveryBoys"],
    queryFn: async () => {
      const response = await getDeliveryBoysAPI();
      let boys = [];
      if (Array.isArray(response)) boys = response;
      else if (response?.data && Array.isArray(response.data)) boys = response.data;
      else console.warn("Unexpected format:", response);
      return boys;
    },
    staleTime: 60000,
    placeholderData: (prev) => prev,
  });

  const [selectedBoyMap, setSelectedBoyMap] = useState({});

  const assignMutation = useMutation({
    mutationFn: async ({ orderId, itemId, boyId }) => {
      const boyIdString = String(boyId);
      console.log(`📤 Assigning order ${orderId} item ${itemId} to boy ${boyIdString}`);
      const result = await updateItemStatus(orderId, itemId, "assigned", boyIdString);
      console.log("📥 Assign response:", result);
      return result;
    },
    onSuccess: (data, variables) => {
      const boy = deliveryBoys.find(b => (b.id || b._id) === variables.boyId);
      toast.success(`Order assigned to ${boy?.name || 'boy'}`);
      queryClient.invalidateQueries({ queryKey: ["orders", storeId] });
      refetch();
      setSelectedBoyMap(prev => ({ ...prev, [variables.itemId]: "" }));
    },
    onError: (error) => {
      console.error("Assign error:", error);
      toast.error("Failed to assign order");
    },
  });

  const handleAssign = (orderId, itemId, boyId) => {
    if (!boyId) return toast.error("Select a boy");
    if (!confirm("Assign this order?")) return;
    assignMutation.mutate({ orderId, itemId, boyId: String(boyId) });
  };

  // ✅ Filter items with status "processing"
  const assignableItems = [];
  orders.forEach(order => {
    (order.items || []).forEach(item => {
      if (item.status === "processing") {
        assignableItems.push({ order, item });
      }
    });
  });

  console.log(`📊 Processing items ready to assign: ${assignableItems.length}`);

  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: '2-digit', day: '2-digit'
  });

  const isLoading = ordersLoading || boysLoading;

  if (!storeId) {
    return <div className="alert alert-warning">No store ID found. Please log in again.</div>;
  }

  return (
    <div className="container-fluid px-4">
      <div className="row mt-4">
        <div className="col-12">
          <h4 className="mb-3">
            Assign Delivery Boys <span className="text-muted fs-6">({assignableItems.length})</span>
          </h4>
          {isLoading ? (
            <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
          ) : assignableItems.length === 0 ? (
            <div className="text-center text-muted py-5">
              <h5>No orders ready for assignment</h5>
              <p>All processing orders have been assigned.</p>
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
                    <th>Status</th>
                    <th>Assign to Boy</th>
                  </tr>
                </thead>
                <tbody>
                  {assignableItems.map(({ order, item }) => {
                    const selectedBoyId = selectedBoyMap[item._id] || "";
                    const isMutating = assignMutation.isPending && assignMutation.variables?.itemId === item._id;
                    const storeDistrict = item.storeDistrict || order.storeDistrict || "N/A";
                    const filteredBoys = deliveryBoys.filter(boy => 
                      boy.district?.toLowerCase() === storeDistrict?.toLowerCase()
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
                          <small className="text-muted"><i className="bi bi-geo-alt me-1"></i>{storeDistrict}</small>
                        </td>
                        <td>Guest</td>
                        <td><span className="badge bg-primary text-white">Processing</span></td>
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
                              disabled={isMutating}
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
                              disabled={!selectedBoyId || isMutating || filteredBoys.length === 0}
                            >
                              {isMutating ? <span className="spinner-border spinner-border-sm" /> : "Assign"}
                            </button>
                          </div>
                          {filteredBoys.length === 0 && storeDistrict !== "N/A" && (
                            <small className="text-danger d-block mt-1">
                              ⚠️ No delivery boys in {storeDistrict} district
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
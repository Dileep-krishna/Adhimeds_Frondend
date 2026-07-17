"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import "./delivery-boys.css";
import { getDeliveryBoysAPI } from "@/app/services/deliveryService";
import { getOrdersByStore, updateItemStatus } from "@/app/services/orderAPI";
import { getStoreId } from "@/utils/jwtHelper";

export default function DeliveryBoysPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBoy, setSelectedBoy] = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [assignedModalOpen, setAssignedModalOpen] = useState(false);
  const [viewingBoy, setViewingBoy] = useState(null);

  // ✅ Get store ID (ObjectId) and district from storage
  let storeId = getStoreId();
  if (!storeId) {
    storeId = localStorage.getItem('storeId') || sessionStorage.getItem('storeId');
  }
  const storeDistrict = 
    localStorage.getItem('district') || 
    sessionStorage.getItem('district') ||
    localStorage.getItem('staffDistrict') || 
    sessionStorage.getItem('staffDistrict') || 
    null;

  console.log(`🏪 Store ID: ${storeId}, District: ${storeDistrict}`);

  // ─── Fetch boys ───
  const {
    data: boys = [],
    isLoading: boysLoading,
    error,
    refetch: refetchBoys,
  } = useQuery({
    queryKey: ["deliveryBoys"],
    queryFn: async () => {
      const response = await getDeliveryBoysAPI();
      let boysData = [];
      if (Array.isArray(response)) boysData = response;
      else if (response?.data && Array.isArray(response.data)) boysData = response.data;
      else if (response?.body && Array.isArray(response.body)) boysData = response.body;
      else if (response?.result && Array.isArray(response.result)) boysData = response.result;
      else if (response?.success && Array.isArray(response.data)) boysData = response.data;
      else {
        for (const key of Object.keys(response || {})) {
          if (Array.isArray(response[key])) { boysData = response[key]; break; }
        }
      }
      // Normalize district field (fallback to zone)
      return boysData.map((boy) => ({
        ...boy,
        district: boy.district || boy.zone || '',
      }));
    },
    staleTime: 60000,
    refetchInterval: 30000,
    placeholderData: (prev) => prev,
  });

  // ─── Fetch orders for this store only ───
  const {
    data: orders = [],
    isLoading: ordersLoading,
    refetch: refetchOrders,
  } = useQuery({
    queryKey: ["orders", storeId],
    queryFn: async () => {
      if (!storeId) return [];
      const response = await getOrdersByStore(storeId);
      let ordersData = response.data || [];
      return ordersData;
    },
    enabled: !!storeId,
    staleTime: 10000,
    refetchInterval: 30000,
    placeholderData: (prev) => prev,
  });

  // ─── Filter boys by district ───
  const filteredBoys = useMemo(() => {
    let result = boys;
    if (storeDistrict) {
      result = boys.filter(
        (b) => b.district?.toLowerCase() === storeDistrict.toLowerCase()
      );
    }
    // Apply search filter
    if (searchTerm.trim()) {
      result = result.filter(
        (b) =>
          b.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.phone?.includes(searchTerm) ||
          b.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return result;
  }, [boys, storeDistrict, searchTerm]);

  // ─── Orders ready for assignment (status = "assigned" but no assignedTo) ───
  const assignableOrders = useMemo(() => {
    const items = [];
    orders.forEach(order => {
      (order.items || []).forEach(item => {
        // Only show items that are assigned but not yet assigned to a specific boy
        if (item.status === "assigned" && !item.assignedTo) {
          items.push({ order, item });
        }
      });
    });
    return items;
  }, [orders]);

  // ─── Orders assigned to a specific boy ───
  const getAssignedOrdersForBoy = (boyId) => {
    const items = [];
    orders.forEach(order => {
      (order.items || []).forEach(item => {
        if (item.assignedTo === boyId) {
          items.push({ order, item });
        }
      });
    });
    return items;
  };

  // ─── Assign mutation ───
  const assignMutation = useMutation({
    mutationFn: async ({ boyId, orderIds }) => {
      const results = [];
      for (const { orderId, itemId } of orderIds) {
        try {
          const result = await updateItemStatus(orderId, itemId, "assigned", boyId);
          results.push(result);
        } catch (err) {
          console.error(`Failed to assign item ${itemId}:`, err);
          throw err;
        }
      }
      return results;
    },
    onSuccess: () => {
      toast.success("Orders assigned successfully!");
      setAssignModalOpen(false);
      setSelectedBoy(null);
      setSelectedOrders([]);
      queryClient.invalidateQueries({ queryKey: ["orders", storeId] });
      refetchOrders();
      queryClient.invalidateQueries({ queryKey: ["deliveryBoys"] });
      refetchBoys();
    },
    onError: (error) => {
      console.error("Assign error:", error);
      toast.error("Failed to assign orders");
    },
  });

  // ─── Stats (based on filtered boys) ───
  const stats = useMemo(() => {
    const total = filteredBoys.length;
    const active = filteredBoys.filter((b) => b.status === "active").length;
    const offline = filteredBoys.filter((b) => b.status === "offline").length;
    const totalDeliveries = filteredBoys.reduce((sum, b) => sum + (b.totalDeliveries || 0), 0);
    const avgRating =
      filteredBoys.reduce((sum, b) => sum + (b.rating || 0), 0) / (total || 1);
    return { total, active, offline, totalDeliveries, avgRating: avgRating.toFixed(1) };
  }, [filteredBoys]);

  // ─── Handlers ───
  const handleAssignClick = (boy) => {
    setSelectedBoy(boy);
    setSelectedOrders([]);
    setAssignModalOpen(true);
  };

  const handleOrderToggle = (orderId, itemId) => {
    setSelectedOrders((prev) =>
      prev.some(o => o.orderId === orderId && o.itemId === itemId)
        ? prev.filter(o => !(o.orderId === orderId && o.itemId === itemId))
        : [...prev, { orderId, itemId }]
    );
  };

  const handleAssignSubmit = () => {
    if (!selectedBoy) return;
    if (selectedOrders.length === 0) {
      toast.error("Please select at least one order");
      return;
    }
    assignMutation.mutate({ boyId: selectedBoy.id || selectedBoy._id, orderIds: selectedOrders });
  };

  const handleViewAssigned = (boy) => {
    setViewingBoy(boy);
    setAssignedModalOpen(true);
  };

  const isLoading = boysLoading || ordersLoading;

  // If no district, show a message
  if (!storeDistrict) {
    return (
      <div className="container-fluid px-4 py-4">
        <div className="alert alert-warning">No store district found. Please log in again.</div>
      </div>
    );
  }

  return (
    <div className="delivery-boys-container container-fluid px-4 py-4">
      {/* Page Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">👥 Delivery Boys</h4>
          <p className="text-muted small">
            Manage your delivery team in <strong>{storeDistrict}</strong>
          </p>
        </div>
        <button className="btn btn-dark rounded-pill px-4" onClick={() => refetchBoys()}>
          <i className="bi bi-arrow-clockwise me-2"></i>Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="stat-card bg-white rounded-3 p-3 shadow-sm border-start border-4 border-primary">
            <div className="d-flex justify-content-between">
              <div>
                <p className="text-muted small mb-0">Total Boys</p>
                <h3 className="fw-bold mb-0">{stats.total}</h3>
              </div>
              <div className="stat-icon bg-primary bg-opacity-10 rounded-circle p-2">
                <i className="bi bi-people text-primary"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="stat-card bg-white rounded-3 p-3 shadow-sm border-start border-4 border-success">
            <div className="d-flex justify-content-between">
              <div>
                <p className="text-muted small mb-0">Active</p>
                <h3 className="fw-bold mb-0">{stats.active}</h3>
              </div>
              <div className="stat-icon bg-success bg-opacity-10 rounded-circle p-2">
                <i className="bi bi-check-circle text-success"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="stat-card bg-white rounded-3 p-3 shadow-sm border-start border-4 border-danger">
            <div className="d-flex justify-content-between">
              <div>
                <p className="text-muted small mb-0">Offline</p>
                <h3 className="fw-bold mb-0">{stats.offline}</h3>
              </div>
              <div className="stat-icon bg-danger bg-opacity-10 rounded-circle p-2">
                <i className="bi bi-circle text-danger"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="stat-card bg-white rounded-3 p-3 shadow-sm border-start border-4 border-info">
            <div className="d-flex justify-content-between">
              <div>
                <p className="text-muted small mb-0">Total Deliveries</p>
                <h3 className="fw-bold mb-0">{stats.totalDeliveries}</h3>
              </div>
              <div className="stat-icon bg-info bg-opacity-10 rounded-circle p-2">
                <i className="bi bi-truck text-info"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="d-flex flex-wrap gap-3 mb-4">
        <div className="flex-grow-1" style={{ maxWidth: "400px" }}>
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Search by name, phone, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div>
          <span className="badge bg-light text-dark p-2">
            {filteredBoys.length} of {boys.length} boys in {storeDistrict}
          </span>
        </div>
      </div>

      {/* Boys Grid */}
      {isLoading && !boys.length ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger">Failed to load delivery boys</div>
      ) : filteredBoys.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-person-x fs-1"></i>
          <p className="mt-2">
            No delivery boys found in <strong>{storeDistrict}</strong>
          </p>
          <p className="small">Please add delivery boys in this district.</p>
        </div>
      ) : (
        <div className="row g-4">
          {filteredBoys.map((boy) => {
            const assignedOrders = getAssignedOrdersForBoy(boy.id || boy._id);
            return (
              <div key={boy.id || boy._id} className="col-12 col-md-6 col-lg-4">
                <div className="boy-card bg-white rounded-3 p-3 shadow-sm h-100 d-flex flex-column">
                  {/* Avatar & Info */}
                  <div className="d-flex align-items-start gap-3">
                    <div className="boy-avatar position-relative">
                      {boy.avatar ? (
                        <img
                          src={boy.avatar}
                          alt={boy.name}
                          className="rounded-circle border"
                          style={{ width: "64px", height: "64px", objectFit: "cover" }}
                          onError={(e) => (e.target.style.display = "none")}
                        />
                      ) : (
                        <div
                          className="rounded-circle border d-flex align-items-center justify-content-center bg-light"
                          style={{ width: "64px", height: "64px" }}
                        >
                          <i className="bi bi-person fs-2 text-secondary"></i>
                        </div>
                      )}
                      <span
                        className={`status-dot position-absolute bottom-0 end-0 p-1 rounded-circle border border-white ${
                          boy.status === "active" ? "bg-success" : "bg-secondary"
                        }`}
                        style={{ width: "14px", height: "14px" }}
                      ></span>
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="fw-bold mb-0">{boy.name}</h6>
                      <p className="small text-muted mb-0">
                        <i className="bi bi-phone me-1"></i>{boy.phone}
                      </p>
                      <p className="small text-muted mb-0">
                        <i className="bi bi-envelope me-1"></i>{boy.email || "N/A"}
                      </p>
                      <span className="badge bg-secondary mt-1">{boy.district}</span>
                    </div>
                    <span className={`badge ${boy.status === "active" ? "bg-success" : "bg-secondary"}`}>
                      {boy.status || "offline"}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="d-flex justify-content-between mt-3 pt-3 border-top">
                    <div>
                      <small className="text-muted">Deliveries</small>
                      <p className="fw-bold mb-0">{boy.totalDeliveries || 0}</p>
                    </div>
                    <div>
                      <small className="text-muted">Rating</small>
                      <p className="fw-bold mb-0">
                        <i className="bi bi-star-fill text-warning me-1"></i>
                        {boy.rating || 0}
                      </p>
                    </div>
                    <div>
                      <small className="text-muted">Joined</small>
                      <p className="fw-bold mb-0 small">
                        {boy.joinedDate
                          ? new Date(boy.joinedDate).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <small className="text-muted">Assigned</small>
                      <p className="fw-bold mb-0 small">{assignedOrders.length}</p>
                    </div>
                  </div>

                  {/* Buttons */}
                  <button
                    className="btn btn-primary rounded-pill mt-2 w-100"
                    onClick={() => handleAssignClick(boy)}
                  >
                    <i className="bi bi-check2-square me-2"></i>Assign Orders
                  </button>
                  <button
                    className="btn btn-outline-secondary rounded-pill mt-1 w-100"
                    onClick={() => handleViewAssigned(boy)}
                    disabled={assignedOrders.length === 0}
                  >
                    <i className="bi bi-eye me-2"></i>View Assigned ({assignedOrders.length})
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Assign Orders Modal */}
      {assignModalOpen && selectedBoy && (
        <div
          className="modal fade show d-block"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={() => setAssignModalOpen(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content rounded-4 shadow-lg">
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold">
                  Assign Orders to {selectedBoy.name}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setAssignModalOpen(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p className="text-muted small">
                  Select orders to assign to this delivery boy:
                </p>
                {assignableOrders.length === 0 ? (
                  <p className="text-center text-muted py-3">No orders ready for assignment</p>
                ) : (
                  <div className="list-group">
                    {assignableOrders.map(({ order, item }) => {
                      const isChecked = selectedOrders.some(
                        o => o.orderId === order._id && o.itemId === item._id
                      );
                      return (
                        <label
                          key={`${order._id}-${item._id}`}
                          className={`list-group-item list-group-item-action d-flex align-items-center gap-3 ${
                            isChecked ? "active" : ""
                          }`}
                          style={{ cursor: "pointer" }}
                        >
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={isChecked}
                            onChange={() => handleOrderToggle(order._id, item._id)}
                            style={{ transform: "scale(1.2)" }}
                          />
                          <div className="flex-grow-1">
                            <strong>#{order._id.slice(-8)}</strong> – {item.productName}
                            <br />
                            <small className="text-muted">
                              {item.storeName} · Qty: {item.quantity} · ₹{(item.mrp || 0) * item.quantity}
                            </small>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="modal-footer border-0">
                <button
                  className="btn btn-outline-secondary rounded-pill px-4"
                  onClick={() => setAssignModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary rounded-pill px-4"
                  onClick={handleAssignSubmit}
                  disabled={assignMutation.isPending || selectedOrders.length === 0}
                >
                  {assignMutation.isPending ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Assigning...
                    </>
                  ) : (
                    `Assign ${selectedOrders.length} Order(s)`
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Assigned Orders Modal */}
      {assignedModalOpen && viewingBoy && (
        <div
          className="modal fade show d-block"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={() => setAssignedModalOpen(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content rounded-4 shadow-lg">
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold">
                  Orders assigned to {viewingBoy.name}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setAssignedModalOpen(false)}
                ></button>
              </div>
              <div className="modal-body">
                {(() => {
                  const assignedItems = getAssignedOrdersForBoy(viewingBoy.id || viewingBoy._id);
                  if (assignedItems.length === 0) {
                    return <p className="text-center text-muted py-3">No orders assigned</p>;
                  }
                  return (
                    <div className="table-responsive">
                      <table className="table table-bordered table-hover align-middle">
                        <thead className="table-light">
                          <tr>
                            <th>Order ID</th>
                            <th>Product</th>
                            <th>Store</th>
                            <th>Qty</th>
                            <th>Amount</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {assignedItems.map(({ order, item }) => (
                            <tr key={`${order._id}-${item._id}`}>
                              <td>#{order._id.slice(-8)}</td>
                              <td>{item.productName}</td>
                              <td>{item.storeName}</td>
                              <td>{item.quantity}</td>
                              <td>₹{(item.mrp || 0) * item.quantity}</td>
                              <td>
                                <span className="badge bg-info text-white">
                                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>
              <div className="modal-footer border-0">
                <button
                  className="btn btn-outline-secondary rounded-pill px-4"
                  onClick={() => setAssignedModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
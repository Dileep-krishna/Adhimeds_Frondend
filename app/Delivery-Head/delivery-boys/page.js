"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import "./delivery-boys.css";
import { getDeliveryBoysAPI } from "@/app/services/deliveryService";

export default function DeliveryBoysPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBoy, setSelectedBoy] = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState([]);

  // ---------- Fetch delivery boys ----------
  const {
    data: boys = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["deliveryBoys"],
    queryFn: getDeliveryBoysAPI,
    staleTime: 60000,
    refetchInterval: 30000,
    placeholderData: (prev) => prev, // prevents blinking on refetch
  });

  // ---------- Mock pending orders (replace with real API) ----------
  const pendingOrders = useMemo(
    () => [
      { id: "ORD-001", customer: "John Doe", items: 3, amount: "₹450" },
      { id: "ORD-002", customer: "Jane Smith", items: 2, amount: "₹320" },
      { id: "ORD-003", customer: "Bob Johnson", items: 1, amount: "₹120" },
    ],
    []
  );

  // ---------- Assign orders mutation (mock) ----------
  const assignMutation = useMutation({
    mutationFn: async ({ boyId, orderIds }) => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log(`Assigning orders ${orderIds} to boy ${boyId}`);
      return { success: true };
    },
    onSuccess: () => {
      toast.success("Orders assigned successfully!");
      setAssignModalOpen(false);
      setSelectedBoy(null);
      setSelectedOrders([]);
      queryClient.invalidateQueries({ queryKey: ["deliveryBoys"] });
    },
    onError: () => toast.error("Failed to assign orders"),
  });

  // ---------- Stats calculations ----------
  const stats = useMemo(() => {
    const total = boys.length;
    const active = boys.filter((b) => b.status === "active").length;
    const offline = boys.filter((b) => b.status === "offline").length;
    const totalDeliveries = boys.reduce((sum, b) => sum + (b.totalDeliveries || 0), 0);
    const avgRating =
      boys.reduce((sum, b) => sum + (b.rating || 0), 0) / (total || 1);
    return { total, active, offline, totalDeliveries, avgRating: avgRating.toFixed(1) };
  }, [boys]);

  // ---------- Filtered boys ----------
  const filteredBoys = useMemo(() => {
    if (!searchTerm.trim()) return boys;
    return boys.filter(
      (b) =>
        b.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.phone?.includes(searchTerm) ||
        b.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [boys, searchTerm]);

  // ---------- Handlers ----------
  const handleAssignClick = (boy) => {
    setSelectedBoy(boy);
    setSelectedOrders([]);
    setAssignModalOpen(true);
  };

  const handleOrderToggle = (orderId) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleAssignSubmit = () => {
    if (!selectedBoy) return;
    if (selectedOrders.length === 0) {
      toast.error("Please select at least one order");
      return;
    }
    assignMutation.mutate({ boyId: selectedBoy.id, orderIds: selectedOrders });
  };

  // ---------- Render ----------
  return (
    <div className="delivery-boys-container container-fluid px-4 py-4">
      {/* Page Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">👥 Delivery Boys</h4>
          <p className="text-muted small">Manage your delivery team and assign orders</p>
        </div>
        <button className="btn btn-dark rounded-pill px-4" onClick={() => refetch()}>
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
            {filteredBoys.length} of {boys.length} boys
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
          <p className="mt-2">No delivery boys found</p>
        </div>
      ) : (
        <div className="row g-4">
          {filteredBoys.map((boy) => (
            // ✅ Unique key
            <div key={boy.id || boy._id} className="col-12 col-md-6 col-lg-4">
              <div className="boy-card bg-white rounded-3 p-3 shadow-sm h-100 d-flex flex-column">
                {/* Avatar – with Bootstrap icon fallback (no 404) */}
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
                </div>

                {/* Assign Button */}
                <button
                  className="btn btn-primary rounded-pill mt-3 w-100"
                  onClick={() => handleAssignClick(boy)}
                >
                  <i className="bi bi-check2-square me-2"></i>Assign Orders
                </button>
              </div>
            </div>
          ))}
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
                {pendingOrders.length === 0 ? (
                  <p className="text-center text-muted py-3">No pending orders</p>
                ) : (
                  <div className="list-group">
                    {pendingOrders.map((order) => (
                      <label
                        key={order.id}
                        className={`list-group-item list-group-item-action d-flex align-items-center gap-3 ${
                          selectedOrders.includes(order.id) ? "active" : ""
                        }`}
                        style={{ cursor: "pointer" }}
                      >
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={selectedOrders.includes(order.id)}
                          onChange={() => handleOrderToggle(order.id)}
                          style={{ transform: "scale(1.2)" }}
                        />
                        <div className="flex-grow-1">
                          <strong>{order.id}</strong> – {order.customer}
                          <br />
                          <small className="text-muted">
                            {order.items} items · {order.amount}
                          </small>
                        </div>
                      </label>
                    ))}
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
    </div>
  );
}
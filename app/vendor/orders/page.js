"use client";

import { useState } from "react";
import "./orders.css";

export default function VendorOrders() {
  const [orders, setOrders] = useState([
    { id: "#ORD-001", customer: "Arun Kumar", product: "Paracetamol 500mg", quantity: 2, amount: 180, status: "pending", date: "2025-05-24" },
    { id: "#ORD-002", customer: "Priya Sharma", product: "Amoxicillin 250mg", quantity: 1, amount: 120, status: "processing", date: "2025-05-23" },
    { id: "#ORD-003", customer: "Rajesh Nair", product: "Vitamin C Tablets", quantity: 3, amount: 450, status: "delivered", date: "2025-05-22" },
    { id: "#ORD-004", customer: "Sneha Menon", product: "Cough Syrup", quantity: 2, amount: 320, status: "pending", date: "2025-05-21" },
    { id: "#ORD-005", customer: "Vikram Singh", product: "Insulin Pen", quantity: 1, amount: 850, status: "processing", date: "2025-05-20" },
    { id: "#ORD-006", customer: "Anjali Nair", product: "Dolo 650", quantity: 4, amount: 200, status: "delivered", date: "2025-05-19" },
    { id: "#ORD-007", customer: "Suresh Kumar", product: "Cetrizine", quantity: 2, amount: 140, status: "cancelled", date: "2025-05-18" },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Stats calculations
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const processingOrders = orders.filter((o) => o.status === "processing").length;
  const completedOrders = orders.filter((o) => o.status === "delivered").length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.amount, 0);

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.product.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Update order status
  const updateStatus = (id, newStatus) => {
    setOrders(orders.map((order) => (order.id === id ? { ...order, status: newStatus } : order)));
  };

  // View order details
  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  // Status badge color mapping
  const getStatusBadge = (status) => {
    const styles = {
      pending: "badge-pending",
      processing: "badge-processing",
      delivered: "badge-delivered",
      cancelled: "badge-cancelled",
    };
    return styles[status] || "badge-pending";
  };

  return (
    <div className="vendor-orders-container">
      {/* Header */}
      <div className="orders-header">
        <div>
          <h1 className="page-title">
            <i className="bi bi-cart-check"></i> Orders
          </h1>
          <p className="page-subtitle">Manage and track customer orders</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <i className="bi bi-receipt"></i>
          <div>
            <span className="stat-number">{totalOrders}</span>
            <span>Total Orders</span>
          </div>
        </div>
        <div className="stat-card">
          <i className="bi bi-hourglass-split"></i>
          <div>
            <span className="stat-number">{pendingOrders}</span>
            <span>Pending</span>
          </div>
        </div>
        <div className="stat-card">
          <i className="bi bi-arrow-repeat"></i>
          <div>
            <span className="stat-number">{processingOrders}</span>
            <span>Processing</span>
          </div>
        </div>
        <div className="stat-card">
          <i className="bi bi-check-circle"></i>
          <div>
            <span className="stat-number">{completedOrders}</span>
            <span>Completed</span>
          </div>
        </div>
        <div className="stat-card">
          <i className="bi bi-currency-rupee"></i>
          <div>
            <span className="stat-number">₹{totalRevenue.toLocaleString()}</span>
            <span>Revenue</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="search-box">
          <i className="bi bi-search"></i>
          <input
            type="text"
            placeholder="Search by order ID, customer or product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>
            <i className="bi bi-funnel"></i> Status:
          </label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="table-wrapper">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Product</th>
              <th>Qty</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id}>
                <td>
                  <strong>{order.id}</strong>
                </td>
                <td>{order.customer}</td>
                <td>{order.product}</td>
                <td>{order.quantity}</td>
                <td>₹{order.amount}</td>
                <td>
                  <div className="status-selector">
                    <span className={`status-badge ${getStatusBadge(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <select
                      className="status-change"
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                    >
                      <option value="pending">Set Pending</option>
                      <option value="processing">Set Processing</option>
                      <option value="delivered">Set Delivered</option>
                      <option value="cancelled">Set Cancelled</option>
                    </select>
                  </div>
                </td>
                <td>{order.date}</td>
                <td>
                  <button className="action-icon view" onClick={() => viewOrderDetails(order)}>
                    <i className="bi bi-eye"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredOrders.length === 0 && (
          <div className="empty-state">
            <i className="bi bi-inbox"></i>
            <p>No orders found</p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="bi bi-info-circle"></i> Order Details
              </h3>
              <button className="close" onClick={() => setShowModal(false)}>
                &times;
              </button>
            </div>
            <div className="modal-body view-body">
              <div className="detail-row">
                <span>Order ID:</span>
                <strong>{selectedOrder.id}</strong>
              </div>
              <div className="detail-row">
                <span>Customer:</span>
                <strong>{selectedOrder.customer}</strong>
              </div>
              <div className="detail-row">
                <span>Product:</span>
                <strong>{selectedOrder.product}</strong>
              </div>
              <div className="detail-row">
                <span>Quantity:</span>
                <strong>{selectedOrder.quantity}</strong>
              </div>
              <div className="detail-row">
                <span>Amount:</span>
                <strong>₹{selectedOrder.amount}</strong>
              </div>
              <div className="detail-row">
                <span>Status:</span>
                <span className={`status-badge ${getStatusBadge(selectedOrder.status)}`}>
                  {selectedOrder.status}
                </span>
              </div>
              <div className="detail-row">
                <span>Order Date:</span>
                <strong>{selectedOrder.date}</strong>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
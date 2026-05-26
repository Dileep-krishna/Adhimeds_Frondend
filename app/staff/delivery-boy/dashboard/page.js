"use client";
import { useState } from "react";
import "./dashboard.css";

export default function DeliveryBoyDashboard() {
  const [assignedOrders, setAssignedOrders] = useState([
    { id: "ORD-001", customer: "Arun Kumar", address: "MG Road, Kochi", deliveryStatus: "assigned" },
    { id: "ORD-003", customer: "Rajesh Nair", address: "Marine Drive, Kochi", deliveryStatus: "picked_up" },
  ]);

  const updateDeliveryStatus = (orderId, status) => {
    setAssignedOrders(assignedOrders.map(o => o.id === orderId ? { ...o, deliveryStatus: status } : o));
    alert(`Order ${orderId} marked as ${status}`);
  };

  const completed = assignedOrders.filter(o => o.deliveryStatus === "delivered").length;
  const assigned = assignedOrders.filter(o => o.deliveryStatus === "assigned").length;

  return (
    <div>
      <h3>My Deliveries</h3>
      <div className="stats-row">
        <div className="stat-card">
          <i className="bi bi-truck"></i>
          <div>
            <span>{assignedOrders.length}</span>
            <label>Assigned</label>
          </div>
        </div>
        <div className="stat-card">
          <i className="bi bi-check-circle"></i>
          <div>
            <span>{completed}</span>
            <label>Completed</label>
          </div>
        </div>
      </div>
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Address</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {assignedOrders.map(order => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.customer}</td>
                <td>{order.address}</td>
                <td><span className={`badge ${order.deliveryStatus}`}>{order.deliveryStatus}</span></td>
                <td>
                  {order.deliveryStatus === "assigned" && (
                    <button className="btn-sm btn-primary" onClick={() => updateDeliveryStatus(order.id, "picked_up")}>
                      Pick Up
                    </button>
                  )}
                  {order.deliveryStatus === "picked_up" && (
                    <button className="btn-sm btn-success" onClick={() => updateDeliveryStatus(order.id, "delivered")}>
                      Delivered
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
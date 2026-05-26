"use client";
import { useState } from "react";
import "./dashboard.css";

export default function PharmacistDashboard() {
  const district = localStorage.getItem("staffDistrict") || "Ernakulam";
  const [orders, setOrders] = useState([
    { id: "ORD-001", customer: "Arun Kumar", items: "Paracetamol 500mg", status: "pending", date: "2025-06-20" },
    { id: "ORD-002", customer: "Priya Sharma", items: "Amoxicillin 250mg", status: "pending", date: "2025-06-20" },
    { id: "ORD-003", customer: "Rajesh Nair", items: "Cough Syrup", status: "ready", date: "2025-06-19" },
  ]);

  const updateStatus = (id) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: "ready" } : o));
    alert(`Order ${id} marked as ready for delivery`);
  };
  const pending = orders.filter(o => o.status === "pending").length;
  const ready = orders.filter(o => o.status === "ready").length;

  return (
    <div>
      <h2>Pharmacist Dashboard – {district}</h2>
      <div className="stats-row">
        <div className="stat-card"><i className="bi bi-clock-history"></i><span>{pending}</span><label>Pending Orders</label></div>
        <div className="stat-card"><i className="bi bi-check-circle"></i><span>{ready}</span><label>Ready for Delivery</label></div>
      </div>
      <div className="table-wrapper">
        <table className="data-table">
          <thead><tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>{order.id}</td><td>{order.customer}</td><td>{order.items}</td>
                <td><span className={`badge ${order.status === "pending" ? "badge-warning" : "badge-success"}`}>{order.status}</span></td>
                <td>{order.status === "pending" && <button className="btn-sm btn-primary" onClick={() => updateStatus(order.id)}>Mark Ready</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import "./dashboard.css";

export default function DeliveryHeadDashboard() {
  const [district, setDistrict] = useState("Ernakulam");

  const [readyOrders, setReadyOrders] = useState([
    { id: "ORD-001", customer: "Arun Kumar", address: "MG Road, Kochi" },
    { id: "ORD-003", customer: "Rajesh Nair", address: "Marine Drive, Kochi" },
  ]);

  const [deliveryBoys, setDeliveryBoys] = useState([
    { id: 1, name: "Rahul S", district: "Ernakulam" },
    { id: 2, name: "Anjali M", district: "Ernakulam" },
  ]);

  const [selectedBoy, setSelectedBoy] = useState("");

  // ✅ SAFE localStorage access
  useEffect(() => {
    const stored = localStorage.getItem("staffDistrict");
    if (stored) {
      setDistrict(stored);
    }
  }, []);

  const assignOrder = (orderId) => {
    if (!selectedBoy) return alert("Select a delivery boy first");

    alert(
      `Order ${orderId} assigned to ${
        deliveryBoys.find((b) => b.id == selectedBoy)?.name
      }`
    );

    setReadyOrders(readyOrders.filter((o) => o.id !== orderId));
  };

  return (
    <div>
      <h2>Delivery Head – {district}</h2>

      <div className="card p-3 mb-4">
        <label>Select Delivery Boy</label>

        <select
          className="form-select"
          value={selectedBoy}
          onChange={(e) => setSelectedBoy(e.target.value)}
        >
          <option value="">Choose...</option>

          {deliveryBoys.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Address</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {readyOrders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.customer}</td>
                <td>{order.address}</td>
                <td>
                  <button
                    className="btn-sm btn-success"
                    onClick={() => assignOrder(order.id)}
                  >
                    Assign
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
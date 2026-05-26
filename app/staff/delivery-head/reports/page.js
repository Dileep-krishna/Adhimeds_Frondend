"use client";

import { useState, useEffect } from "react";
import "./reports.css";

export default function DeliveryReports() {
  const [district, setDistrict] = useState("Ernakulam");

  const [report] = useState({
    totalDeliveries: 124,
    onTimeRate: 92,
    deliveryBoys: [
      { name: "Rahul S", assigned: 45, delivered: 42, avgTime: 32 },
      { name: "Anjali M", assigned: 38, delivered: 36, avgTime: 28 },
    ],
  });

  // ✅ FIX: safe localStorage access (no SSR crash)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedDistrict = localStorage.getItem("staffDistrict");
      if (storedDistrict) {
        setDistrict(storedDistrict);
      }
    }
  }, []);

  return (
    <div>
      <h2>Delivery Reports – {district}</h2>

      <div className="stats-row">
        <div className="stat-card">
          <i className="bi bi-truck"></i>
          <span>{report.totalDeliveries}</span>
          <label>Total Deliveries</label>
        </div>

        <div className="stat-card">
          <i className="bi bi-stopwatch"></i>
          <span>{report.onTimeRate}%</span>
          <label>On-Time Rate</label>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Delivery Boy</th>
              <th>Assigned</th>
              <th>Delivered</th>
              <th>Avg Time (mins)</th>
              <th>Performance</th>
            </tr>
          </thead>

          <tbody>
            {report.deliveryBoys.map((boy) => (
              <tr key={boy.name}>
                <td>{boy.name}</td>
                <td>{boy.assigned}</td>
                <td>{boy.delivered}</td>
                <td>{boy.avgTime}</td>
                <td>
                  <div className="progress">
                    <div
                      className="progress-bar"
                      style={{
                        width: `${(boy.delivered / boy.assigned) * 100}%`,
                      }}
                    ></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
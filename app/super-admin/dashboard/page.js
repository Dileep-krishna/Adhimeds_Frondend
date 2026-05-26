"use client";

import { useState, useEffect } from "react";
import "./dashboard.css"; // you can keep your existing CSS or move shared styles to a global file

export default function SuperAdminDashboard() {
  // Static stats (you can later fetch from API)
  const [stats, setStats] = useState({
    customers: 93,
    products: 35961,
    sales: 184.9,
    vendors: 68,
    orders: 472,
    placed: 470,
    confirmed: 13,
    processed: 12,
  });

  const [animatedStats, setAnimatedStats] = useState({
    customers: 0,
    products: 0,
    sales: 0,
    vendors: 0,
    orders: 0,
  });

  // Animated counter effect
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    Object.keys(animatedStats).forEach((key) => {
      let current = 0;
      const target = stats[key];
      const increment = target / steps;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setAnimatedStats((prev) => ({ ...prev, [key]: target }));
          clearInterval(timer);
        } else {
          setAnimatedStats((prev) => ({ ...prev, [key]: Math.floor(current) }));
        }
      }, interval);
    });
  }, []);

  return (
    <div className="super-admin-dashboard">
      {/* Hero header */}
      <div className="dashboard-hero">
        <div>
          <h1 className="dashboard-title">Analytics Dashboard</h1>
          <p className="dashboard-subtitle">
            Welcome back, Super Admin. Here's your business snapshot.
          </p>
        </div>
        <div className="date-badge">
          <i className="bi bi-calendar3"></i>
          <span>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Stats cards */}
      <div className="stats-grid">
        <div className="premium-stat-card customers">
          <div className="stat-icon-bg">
            <i className="bi bi-people-fill"></i>
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Customers</span>
            <span className="stat-number">{animatedStats.customers}</span>
            <span className="stat-change positive">↑ 12.5%</span>
          </div>
        </div>
        <div className="premium-stat-card products">
          <div className="stat-icon-bg">
            <i className="bi bi-box-seam-fill"></i>
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Products</span>
            <span className="stat-number">{animatedStats.products.toLocaleString()}</span>
            <span className="stat-change positive">↑ 5.2%</span>
          </div>
        </div>
        <div className="premium-stat-card sales">
          <div className="stat-icon-bg">
            <i className="bi bi-graph-up-arrow"></i>
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Sales</span>
            <span className="stat-number">${animatedStats.sales.toFixed(1)}K</span>
            <span className="stat-change positive">↑ 23.8%</span>
          </div>
        </div>
        <div className="premium-stat-card vendors">
          <div className="stat-icon-bg">
            <i className="bi bi-shop"></i>
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Vendors</span>
            <span className="stat-number">{animatedStats.vendors}</span>
            <span className="stat-change positive">↑ 8.3%</span>
          </div>
        </div>
      </div>

      {/* Two‑column layout: orders & order status */}
      <div className="dashboard-row">
        <div className="glass-card">
          <div className="card-header-premium">
            <span>
              <i className="bi bi-cart-check-fill"></i> Total Orders
            </span>
            <span className="badge-modern">This Month</span>
          </div>
          <div className="card-body-premium">
            <div className="big-number">{animatedStats.orders}</div>
            <div className="progress-label-sm">
              <span>Monthly goal</span>
              <span>78%</span>
            </div>
            <div className="progress-bar-modern">
              <div className="progress-fill-modern" style={{ width: "78%" }}></div>
            </div>
            <button className="btn-outline-glass" onClick={() => (window.location.href = "/orders")}>
              View all orders <i className="bi bi-arrow-right-short"></i>
            </button>
          </div>
        </div>

        <div className="glass-card">
          <div className="card-header-premium">
            <span>
              <i className="bi bi-pie-chart-fill"></i> Order Status
            </span>
            <i className="bi bi-three-dots-vertical"></i>
          </div>
          <div className="card-body-premium">
            <div className="status-item-modern">
              <div className="status-left">
                <span className="status-dot placed"></span> Placed
              </div>
              <div className="status-right">
                {stats.placed} ({((stats.placed / stats.orders) * 100).toFixed(1)}%)
              </div>
            </div>
            <div className="progress-bar-modern mini">
              <div
                className="progress-fill placed-fill"
                style={{ width: `${(stats.placed / stats.orders) * 100}%` }}
              ></div>
            </div>

            <div className="status-item-modern">
              <div className="status-left">
                <span className="status-dot confirmed"></span> Confirmed
              </div>
              <div className="status-right">
                {stats.confirmed} ({((stats.confirmed / stats.orders) * 100).toFixed(1)}%)
              </div>
            </div>
            <div className="progress-bar-modern mini">
              <div
                className="progress-fill confirmed-fill"
                style={{ width: `${(stats.confirmed / stats.orders) * 100}%` }}
              ></div>
            </div>

            <div className="status-item-modern">
              <div className="status-left">
                <span className="status-dot processed"></span> Processed
              </div>
              <div className="status-right">
                {stats.processed} ({((stats.processed / stats.orders) * 100).toFixed(1)}%)
              </div>
            </div>
            <div className="progress-bar-modern mini">
              <div
                className="progress-fill processed-fill"
                style={{ width: `${(stats.processed / stats.orders) * 100}%` }}
              ></div>
            </div>

            <div className="status-footer">
              <span>Completion rate</span>
              <strong>{((stats.processed / stats.orders) * 100).toFixed(1)}%</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Recent orders table */}
      <div className="recent-section">
        <h3 className="section-title">
          <i className="bi bi-clock-history"></i> Recent Orders
        </h3>
        <div className="recent-table-container">
          <table className="recent-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>#ORD-001</td>
                <td>John Doe</td>
                <td>$299</td>
                <td>
                  <span className="status-badge delivered">Delivered</span>
                </td>
              </tr>
              <tr>
                <td>#ORD-002</td>
                <td>Jane Smith</td>
                <td>$450</td>
                <td>
                  <span className="status-badge processing">Processing</span>
                </td>
              </tr>
              <tr>
                <td>#ORD-003</td>
                <td>Mike Johnson</td>
                <td>$125</td>
                <td>
                  <span className="status-badge pending">Pending</span>
                </td>
              </tr>
              <tr>
                <td>#ORD-004</td>
                <td>Sarah Wilson</td>
                <td>$890</td>
                <td>
                  <span className="status-badge delivered">Delivered</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
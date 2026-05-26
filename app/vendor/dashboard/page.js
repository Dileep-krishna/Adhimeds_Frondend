"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "./animations.css"; 

export default function VendorDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    products: 124,
    orders: 78,
    revenue: 45280,
    lowStock: 8,
  });
  const [recentOrders, setRecentOrders] = useState([
    { id: "#ORD-001", customer: "John Doe", amount: 299, status: "delivered", date: "2025-05-24" },
    { id: "#ORD-002", customer: "Jane Smith", amount: 450, status: "processing", date: "2025-05-23" },
    { id: "#ORD-003", customer: "Mike Johnson", amount: 125, status: "pending", date: "2025-05-22" },
    { id: "#ORD-004", customer: "Sarah Wilson", amount: 890, status: "delivered", date: "2025-05-21" },
  ]);
  const [lowStockProducts, setLowStockProducts] = useState([
    { name: "Paracetamol 500mg", stock: 12, threshold: 20 },
    { name: "Amoxicillin 250mg", stock: 5, threshold: 15 },
    { name: "Vitamin C Tablets", stock: 8, threshold: 25 },
  ]);

  const [animatedStats, setAnimatedStats] = useState({
    products: 0,
    orders: 0,
    revenue: 0,
    lowStock: 0,
  });

  useEffect(() => {
    const duration = 1500;
    const steps = 40;
    const interval = duration / steps;
    Object.keys(animatedStats).forEach((key) => {
      let current = 0;
      const target = stats[key];
      const increment = target / steps;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setAnimatedStats(prev => ({ ...prev, [key]: target }));
          clearInterval(timer);
        } else {
          setAnimatedStats(prev => ({ ...prev, [key]: Math.floor(current) }));
        }
      }, interval);
    });
  }, []);

  return (
    <div className="vendor-dashboard">
      <div className="dashboard-header animate-slide-down">
        <div>
          <h1 className="display-5 fw-bold gradient-text">Vendor Dashboard</h1>
          <p className="text-muted">Welcome back, Vendor. Here's your store performance.</p>
        </div>
        <div className="header-actions">
          <button className="btn-gradient me-2">
            <i className="bi bi-plus-circle"></i> Add Product
          </button>
          <button className="btn-outline-gradient" onClick={() => router.push("/vendor/orders")}>
            <i className="bi bi-box-arrow-right"></i> Manage Orders
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card products-card animate-fade-up delay-100">
          <div className="stat-icon"><i className="bi bi-box-seam"></i></div>
          <div className="stat-details">
            <span className="stat-label">Total Products</span>
            <span className="stat-number">{animatedStats.products}</span>
            <span className="stat-trend positive"><i className="bi bi-arrow-up-short"></i> +5 this month</span>
          </div>
        </div>
        <div className="stat-card orders-card animate-fade-up delay-200">
          <div className="stat-icon"><i className="bi bi-cart-check"></i></div>
          <div className="stat-details">
            <span className="stat-label">Orders</span>
            <span className="stat-number">{animatedStats.orders}</span>
            <span className="stat-trend positive"><i className="bi bi-arrow-up-short"></i> +12 new</span>
          </div>
        </div>
        <div className="stat-card revenue-card animate-fade-up delay-300">
          <div className="stat-icon"><i className="bi bi-currency-rupee"></i></div>
          <div className="stat-details">
            <span className="stat-label">Revenue (this month)</span>
            <span className="stat-number">₹{animatedStats.revenue.toLocaleString()}</span>
            <span className="stat-trend positive"><i className="bi bi-arrow-up-short"></i> +18.3%</span>
          </div>
        </div>
        <div className="stat-card lowstock-card animate-fade-up delay-400">
          <div className="stat-icon"><i className="bi bi-exclamation-diamond"></i></div>
          <div className="stat-details">
            <span className="stat-label">Low Stock Alerts</span>
            <span className="stat-number text-danger">{animatedStats.lowStock}</span>
            <span className="stat-trend negative"><i className="bi bi-exclamation-triangle"></i> Need restock</span>
          </div>
        </div>
      </div>

      <div className="dashboard-row">
        <div className="animate-fade-up delay-200">
          <div className="glass-card">
            <div className="card-header-custom">
              <h5 className="mb-0"><i className="bi bi-clock-history me-2"></i>Recent Orders</h5>
              <button className="link-btn" onClick={() => router.push("/vendor/orders")}>
                View All <i className="bi bi-arrow-right-short"></i>
              </button>
            </div>
            <div className="card-body-custom">
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr><th>Order ID</th><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th></tr>
                  </thead>
                  <tbody>
                    {recentOrders.map(order => (
                      <tr key={order.id}>
                        <td className="fw-semibold">{order.id}</td>
                        <td>{order.customer}</td>
                        <td>₹{order.amount}</td>
                        <td><span className={`status-badge ${order.status}`}>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span></td>
                        <td>{order.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="animate-fade-up delay-300">
          <div className="glass-card h-100">
            <div className="card-header-custom">
              <h5 className="mb-0"><i className="bi bi-exclamation-triangle-fill text-warning me-2"></i>Low Stock Products</h5>
            </div>
            <div className="card-body-custom">
              {lowStockProducts.length === 0 ? (
                <p className="text-center text-muted">No low stock items</p>
              ) : (
                <div className="stock-list">
                  {lowStockProducts.map((product, idx) => (
                    <div key={idx} className="stock-item">
                      <div>
                        <span className="fw-semibold">{product.name}</span><br />
                        <small className="text-muted">Stock: {product.stock} / Min: {product.threshold}</small>
                      </div>
                      <button className="btn-restock">Restock</button>
                    </div>
                  ))}
                </div>
              )}
              <div className="text-center mt-3">
                <button className="link-btn" onClick={() => router.push("/vendor/products")}>
                  Manage Inventory <i className="bi bi-arrow-right-short"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 animate-fade-up delay-400">
        <div className="glass-card">
          <div className="card-header-custom">
            <h5 className="mb-0"><i className="bi bi-graph-up me-2"></i>Weekly Sales (Demo)</h5>
          </div>
          <div className="card-body-custom text-center">
            <div className="chart-placeholder">
              <i className="bi bi-bar-chart-steps fs-1 text-muted"></i>
              <p className="mt-2 text-muted">Interactive chart coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
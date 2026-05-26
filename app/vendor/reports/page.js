"use client";

import { useState } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import "./reports.css";

export default function VendorReports() {
  const [dateRange, setDateRange] = useState("month");

  // Mock sales data (last 6 months)
  const salesData = [
    { month: "Jan", sales: 12500, orders: 42 },
    { month: "Feb", sales: 13200, orders: 48 },
    { month: "Mar", sales: 14800, orders: 55 },
    { month: "Apr", sales: 16700, orders: 62 },
    { month: "May", sales: 18200, orders: 71 },
    { month: "Jun", sales: 15200, orders: 58 },
  ];

  // Top selling products
  const topProducts = [
    { name: "Paracetamol 500mg", units: 342, revenue: 17100 },
    { name: "Amoxicillin 250mg", units: 278, revenue: 33360 },
    { name: "Vitamin C Tablets", units: 210, revenue: 31500 },
    { name: "Cough Syrup", units: 198, revenue: 31680 },
    { name: "Dolo 650", units: 167, revenue: 7515 },
  ];

  // Category distribution for pie chart
  const categoryData = [
    { name: "Tablets", value: 45, color: "#3b82f6" },
    { name: "Capsules", value: 25, color: "#f59e0b" },
    { name: "Syrups", value: 15, color: "#10b981" },
    { name: "Injections", value: 10, color: "#8b5cf6" },
    { name: "Ointments", value: 5, color: "#ef4444" },
  ];

  // Summary stats
  const totalSales = salesData.reduce((sum, d) => sum + d.sales, 0);
  const totalOrders = salesData.reduce((sum, d) => sum + d.orders, 0);
  const avgOrderValue = totalSales / totalOrders;
  const totalProductsSold = topProducts.reduce((sum, p) => sum + p.units, 0);

  return (
    <div className="vendor-reports-container">
      {/* Header */}
      <div className="reports-header">
        <div>
          <h1 className="page-title"><i className="bi bi-graph-up"></i> Sales Reports</h1>
          <p className="page-subtitle">Track your business performance and insights</p>
        </div>
        <div className="header-actions">
          <select className="date-select" value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
            <option value="week">Last 7 days</option>
            <option value="month">Last 30 days</option>
            <option value="quarter">Last quarter</option>
            <option value="year">Last year</option>
          </select>
          <button className="btn-export" onClick={() => alert("Export CSV (demo)")}>
            <i className="bi bi-download"></i> Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <i className="bi bi-currency-rupee"></i>
          <div><span className="stat-number">₹{totalSales.toLocaleString()}</span><span>Total Sales</span></div>
        </div>
        <div className="stat-card">
          <i className="bi bi-cart-check"></i>
          <div><span className="stat-number">{totalOrders}</span><span>Total Orders</span></div>
        </div>
        <div className="stat-card">
          <i className="bi bi-receipt"></i>
          <div><span className="stat-number">₹{avgOrderValue.toFixed(0)}</span><span>Avg. Order Value</span></div>
        </div>
        <div className="stat-card">
          <i className="bi bi-box-seam"></i>
          <div><span className="stat-number">{totalProductsSold}</span><span>Units Sold</span></div>
        </div>
      </div>

      {/* Sales Trend Chart */}
      <div className="chart-card">
        <div className="chart-header">
          <h3><i className="bi bi-graph-up"></i> Sales Trend</h3>
          <span className="badge-modern">Last 6 months</span>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" stroke="#64748b" />
            <YAxis yAxisId="left" stroke="#64748b" tickFormatter={(v) => `₹${v/1000}k`} />
            <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" />
            <Tooltip formatter={(value, name) => name === "sales" ? [`₹${value.toLocaleString()}`, "Sales"] : [value, "Orders"]} />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Sales (₹)" />
            <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} name="Orders" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Two-column layout: Top Products + Category Distribution */}
      <div className="two-columns">
        {/* Top Products Table */}
        <div className="chart-card">
          <div className="chart-header">
            <h3><i className="bi bi-trophy"></i> Top Selling Products</h3>
          </div>
          <div className="table-wrapper">
            <table className="top-products-table">
              <thead>
                <tr><th>Product</th><th>Units Sold</th><th>Revenue</th></tr>
              </thead>
              <tbody>
                {topProducts.map((p, idx) => (
                  <tr key={idx}>
                    <td><strong>{p.name}</strong></td>
                    <td>{p.units}</td>
                    <td>₹{p.revenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Category Distribution Pie Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3><i className="bi bi-pie-chart"></i> Sales by Category</h3>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value" label>
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders Summary (optional) */}
      <div className="chart-card">
        <div className="chart-header">
          <h3><i className="bi bi-clock-history"></i> Recent Orders</h3>
          <a href="/vendor/orders" className="view-link">View All <i className="bi bi-arrow-right-short"></i></a>
        </div>
        <div className="table-wrapper">
          <table className="recent-orders-table">
            <thead>
              <tr><th>Order ID</th><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th></tr>
            </thead>
            <tbody>
              <tr><td>#ORD-1001</td><td>Arun Kumar</td><td>₹180</td><td><span className="status-badge pending">Pending</span></td><td>2025-06-15</td></tr>
              <tr><td>#ORD-1002</td><td>Priya Sharma</td><td>₹450</td><td><span className="status-badge delivered">Delivered</span></td><td>2025-06-14</td></tr>
              <tr><td>#ORD-1003</td><td>Rajesh Nair</td><td>₹125</td><td><span className="status-badge delivered">Delivered</span></td><td>2025-06-13</td></tr>
              <tr><td>#ORD-1004</td><td>Sneha Menon</td><td>₹320</td><td><span className="status-badge processing">Processing</span></td><td>2025-06-12</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
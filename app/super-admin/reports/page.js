'use client';

import { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import './reports.css';

export default function Reports() {
  const [dateRange, setDateRange] = useState('month');
  const [exportLoading, setExportLoading] = useState(false);

  // Mock data (would come from API)
  const salesData = [
    { month: 'Jan', sales: 42000, orders: 145 }, { month: 'Feb', sales: 38500, orders: 132 },
    { month: 'Mar', sales: 51000, orders: 178 }, { month: 'Apr', sales: 47800, orders: 165 },
    { month: 'May', sales: 62000, orders: 210 }, { month: 'Jun', sales: 58500, orders: 198 },
  ];

  const orderStatusData = [
    { name: 'Delivered', value: 342, color: '#10b981' },
    { name: 'Processing', value: 86, color: '#3b82f6' },
    { name: 'Pending', value: 45, color: '#f59e0b' },
    { name: 'Cancelled', value: 23, color: '#ef4444' },
  ];

  const categoryData = [
    { name: 'Electronics', sales: 125000, orders: 342 },
    { name: 'Fashion', sales: 89000, orders: 278 },
    { name: 'Home & Living', sales: 67000, orders: 210 },
    { name: 'Groceries', sales: 105000, orders: 398 },
  ];

  // Summary stats
  const totalSales = salesData.reduce((sum, item) => sum + item.sales, 0);
  const totalOrders = salesData.reduce((sum, item) => sum + item.orders, 0);
  const avgOrderValue = totalSales / totalOrders;
  const conversionRate = 78; // percent

  // Handle export (mock)
  const handleExport = (format) => {
    setExportLoading(true);
    setTimeout(() => {
      alert(`Exporting as ${format}... (demo)`);
      setExportLoading(false);
    }, 1000);
  };

  return (
    <div className="reports-page">
      {/* Header */}
      <div className="reports-header">
        <div>
          <h1 className="page-title"><i className="bi bi-graph-up"></i> Analytics & Reports</h1>
          <p className="page-subtitle">Track performance, sales trends, and order insights.</p>
        </div>
        <div className="header-actions">
          <select className="date-select" value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
            <option value="week">Last 7 days</option>
            <option value="month">Last 30 days</option>
            <option value="quarter">Last quarter</option>
            <option value="year">Last year</option>
          </select>
          <div className="export-buttons">
            <button className="btn-export" onClick={() => handleExport('CSV')} disabled={exportLoading}>
              <i className="bi bi-file-spreadsheet"></i> CSV
            </button>
            <button className="btn-export" onClick={() => handleExport('PDF')} disabled={exportLoading}>
              <i className="bi bi-file-pdf"></i> PDF
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card premium">
          <div className="stat-icon"><i className="bi bi-currency-dollar"></i></div>
          <div className="stat-info">
            <span className="stat-label">Total Sales</span>
            <span className="stat-value">₹{totalSales.toLocaleString()}</span>
            <span className="stat-trend positive"><i className="bi bi-arrow-up"></i> +18.2%</span>
          </div>
        </div>
        <div className="stat-card premium">
          <div className="stat-icon"><i className="bi bi-cart-check"></i></div>
          <div className="stat-info">
            <span className="stat-label">Total Orders</span>
            <span className="stat-value">{totalOrders}</span>
            <span className="stat-trend positive"><i className="bi bi-arrow-up"></i> +12.5%</span>
          </div>
        </div>
        <div className="stat-card premium">
          <div className="stat-icon"><i className="bi bi-receipt"></i></div>
          <div className="stat-info">
            <span className="stat-label">Avg. Order Value</span>
            <span className="stat-value">₹{avgOrderValue.toFixed(0)}</span>
            <span className="stat-trend positive"><i className="bi bi-arrow-up"></i> +5.3%</span>
          </div>
        </div>
        <div className="stat-card premium">
          <div className="stat-icon"><i className="bi bi-percent"></i></div>
          <div className="stat-info">
            <span className="stat-label">Conversion Rate</span>
            <span className="stat-value">{conversionRate}%</span>
            <span className="stat-trend positive"><i className="bi bi-arrow-up"></i> +2.1%</span>
          </div>
        </div>
      </div>

      {/* Charts Row 1: Sales Trend (Area/Line) */}
      <div className="chart-row">
        <div className="chart-card large">
          <div className="chart-header">
            <h3><i className="bi bi-graph-up"></i> Sales Trend</h3>
            <span className="badge-modern">Last 6 months</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" tickFormatter={(value) => `₹${value/1000}k`} />
              <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Sales']} />
              <Legend />
              <Area type="monotone" dataKey="sales" stroke="#3b82f6" fill="url(#colorSales)" strokeWidth={2} />
              <Line type="monotone" dataKey="orders" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2: Order Status (Pie) + Category Sales (Bar) */}
      <div className="chart-row two-cols">
        <div className="chart-card">
          <div className="chart-header">
            <h3><i className="bi bi-pie-chart"></i> Order Status</h3>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={orderStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value" label>
                {orderStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <div className="chart-header">
            <h3><i className="bi bi-bar-chart"></i> Sales by Category</h3>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={categoryData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tickFormatter={(value) => `₹${value/1000}k`} />
              <YAxis type="category" dataKey="name" width={100} />
              <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Sales']} />
              <Bar dataKey="sales" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders Table (summary) */}
      <div className="recent-orders-section">
        <h3 className="section-title"><i className="bi bi-clock-history"></i> Recent Orders</h3>
        <div className="recent-table-container">
          <table className="recent-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>#ORD-1001</td>
                <td>John Doe</td>
                <td>₹299</td>
                <td><span className="status-badge delivered">Delivered</span></td>
                <td>2024-06-15</td>
              </tr>
              <tr>
                <td>#ORD-1002</td>
                <td>Jane Smith</td>
                <td>₹450</td>
                <td><span className="status-badge processing">Processing</span></td>
                <td>2024-06-14</td>
              </tr>
              <tr>
                <td>#ORD-1003</td>
                <td>Mike Johnson</td>
                <td>₹125</td>
                <td><span className="status-badge pending">Pending</span></td>
                <td>2024-06-13</td>
              </tr>
              <tr>
                <td>#ORD-1004</td>
                <td>Sarah Wilson</td>
                <td>₹890</td>
                <td><span className="status-badge delivered">Delivered</span></td>
                <td>2024-06-12</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
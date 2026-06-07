'use client';

import './store-dashboard.css';
import { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  ShoppingCart, XCircle, Truck, CheckCircle, PlusCircle, CreditCard,
  Settings
} from 'lucide-react';

// Dummy data
const salesData = [
  { month: 'Jan', sales: 0.2 }, { month: 'Feb', sales: 0.4 }, { month: 'Mar', sales: 0.3 },
  { month: 'Apr', sales: 0.7 }, { month: 'May', sales: 0.6 }, { month: 'Jun', sales: 0.9 },
  { month: 'Jul', sales: 0.5 }, { month: 'Aug', sales: 0.8 }, { month: 'Sep', sales: 1.0 },
  { month: 'Oct', sales: 0.9 }, { month: 'Nov', sales: 0.6 }, { month: 'Dec', sales: 0.4 },
];

const categoryData = [
  { name: 'Electronics', count: 45 }, { name: 'Clothing', count: 32 },
  { name: 'Home', count: 28 }, { name: 'Books', count: 18 }, { name: 'Toys', count: 15 },
];

const topProducts = [
  { id: 1, name: 'Wireless Headphones', sales: 234, revenue: '₹46,800' },
  { id: 2, name: 'Smart Watch', sales: 189, revenue: '₹75,600' },
  { id: 3, name: 'Cotton T-Shirt', sales: 167, revenue: '₹25,050' },
  { id: 4, name: 'Coffee Maker', sales: 145, revenue: '₹43,500' },
  { id: 5, name: 'Backpack', sales: 132, revenue: '₹39,600' },
  { id: 6, name: 'Running Shoes', sales: 128, revenue: '₹64,000' },
  { id: 7, name: 'Desk Lamp', sales: 112, revenue: '₹16,800' },
  { id: 8, name: 'Novel "The Midnight"', sales: 98, revenue: '₹14,700' },
  { id: 9, name: 'Yoga Mat', sales: 94, revenue: '₹18,800' },
  { id: 10, name: 'Bluetooth Speaker', sales: 87, revenue: '₹34,800' },
  { id: 11, name: 'Sunglasses', sales: 76, revenue: '₹22,800' },
  { id: 12, name: 'Water Bottle', sales: 72, revenue: '₹7,200' },
];

export default function StoreDashboard() {
  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard</h1>

      {/* First row: Products + Sales Stat + Category wise */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Products</h3>
          <p className="stat-number">12,851</p>
        </div>

        <div className="stat-card large">
          <h3>Sales Stat</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[0, 1]} tickFormatter={(v) => v.toFixed(1)} />
              <Tooltip />
              <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="stat-card">
          <h3>Category wise product count</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={categoryData} layout="vertical" margin={{ left: 40 }}>
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={80} />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Second row: Orders + Sold Amount */}
      <div className="two-columns">
        <OrdersSummary />
        <SoldAmountCard />
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button className="action-btn"><CreditCard size={20} /> Money Withdraw</button>
        <button className="action-btn"><PlusCircle size={20} /> Add New Product</button>
      </div>

      {/* Third row: Shop Settings + Payment Settings and Top Products */}
      <div className="two-columns">
        <SettingsCards />
        <TopProductsTable />
      </div>
    </div>
  );
}

// ---------- Sub-components ----------
function OrdersSummary() {
  const orders = { newOrder: 318, cancelled: 4, onDelivery: 18, delivered: 147 };
  return (
    <div className="card">
      <h3>This Month</h3>
      <div className="orders-grid">
        <div className="order-item"><ShoppingCart size={28} color="#3b82f6" /><div><p>New Order</p><strong>{orders.newOrder}</strong></div></div>
        <div className="order-item"><XCircle size={28} color="#ef4444" /><div><p>Cancelled</p><strong>{orders.cancelled}</strong></div></div>
        <div className="order-item"><Truck size={28} color="#f59e0b" /><div><p>On delivery</p><strong>{orders.onDelivery}</strong></div></div>
        <div className="order-item"><CheckCircle size={28} color="#10b981" /><div><p>Delivered</p><strong>{orders.delivered}</strong></div></div>
      </div>
    </div>
  );
}

function SoldAmountCard() {
  return (
    <div className="card">
      <h3>Sold Amount</h3>
      <p className="label">Your sold amount (current month)</p>
      <p className="amount">Rs0.00</p>
      <p className="label">Last Month: <span className="last-amount">Rs0.00</span></p>
    </div>
  );
}

function SettingsCards() {
  return (
    <div className="settings-stack">
      <div className="card setting-card">
        <div><Settings size={24} /> <h3>Shop Settings</h3></div>
        <p>Go to setting</p>
        <button className="config-btn">Configure Now</button>
      </div>
      <div className="card setting-card">
        <div><CreditCard size={24} /> <h3>Payment Settings</h3></div>
        <p>Go to setting</p>
        <button className="config-btn">Configure Now</button>
      </div>
    </div>
  );
}

function TopProductsTable() {
  return (
    <div className="card">
      <h3>Top 12 Products</h3>
      <div className="table-responsive">
        <table className="products-table">
          <thead>
            <tr><th>#</th><th>Product Name</th><th>Sales</th><th>Revenue</th></tr>
          </thead>
          <tbody>
            {topProducts.map((p, idx) => (
              <tr key={p.id}>
                <td>{idx + 1}</td>
                <td>{p.name}</td>
                <td>{p.sales}</td>
                <td>{p.revenue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
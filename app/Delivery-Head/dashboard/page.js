"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getAllOrders } from "../../services/orderAPI";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import "./delivery-dashboard.css";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function DeliveryHeadDashboard() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState("today");
  const [selectedView, setSelectedView] = useState("overview");

  // ---------- Fetch orders ----------
  const {
    data: orders = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const response = await getAllOrders();
      if (!response.success) throw new Error("Failed to load orders");
      return response.data;
    },
    refetchInterval: 30000,
    staleTime: 10000,
    refetchOnWindowFocus: false,
  });

  // ---------- Calculate statistics ----------
  const calculateStats = () => {
    let totalOrders = 0;
    let pendingOrders = 0;
    let processingOrders = 0;
    let completedOrders = 0;
    let cancelledOrders = 0;
    let totalRevenue = 0;

    orders.forEach((order) => {
      (order.items || []).forEach((item) => {
        totalOrders++;
        const itemTotal = (item.mrp || 0) * (item.quantity || 1);

        switch (item.status) {
          case "pending":
            pendingOrders++;
            break;
          case "processing":
            processingOrders++;
            break;
          case "completed":
            completedOrders++;
            totalRevenue += itemTotal;
            break;
          case "cancelled":
            cancelledOrders++;
            break;
          default:
            break;
        }
      });
    });

    const deliveryRate = totalOrders > 0
      ? Math.round((completedOrders / totalOrders) * 100)
      : 0;

    return {
      totalOrders,
      pendingOrders,
      processingOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue,
      deliveryRate,
      activeOrders: pendingOrders + processingOrders,
    };
  };

  const stats = calculateStats();

  // ---------- Order status distribution for Doughnut chart ----------
  const statusData = {
    labels: ["Pending", "Processing", "Delivered", "Cancelled"],
    datasets: [
      {
        data: [
          stats.pendingOrders,
          stats.processingOrders,
          stats.completedOrders,
          stats.cancelledOrders,
        ],
        backgroundColor: ["#f59e0b", "#3b82f6", "#22c55e", "#ef4444"],
        borderColor: ["#fff", "#fff", "#fff", "#fff"],
        borderWidth: 2,
      },
    ],
  };

  // ---------- Revenue trend (mock data for demo) ----------
  const revenueData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Revenue",
        data: [12500, 18900, 15200, 22100, 19800, 27600, 24500],
        borderColor: "#0a2b4e",
        backgroundColor: "rgba(10, 43, 78, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // ---------- Order trend ----------
  const orderTrendData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Orders",
        data: [45, 62, 58, 79, 68, 92, 84],
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // ---------- Recent orders ----------
  const recentOrders = orders.slice(0, 5).flatMap((order) =>
    (order.items || []).map((item) => ({
      id: item._id,
      orderId: order._id,
      product: item.productName,
      quantity: item.quantity || 1,
      amount: (item.mrp || 0) * (item.quantity || 1),
      status: item.status,
      createdAt: order.createdAt,
      customer: "Guest",
    }))
  );

  // ---------- Status badge helper ----------
  const getStatusBadge = (status) => {
    const map = {
      pending: "bg-warning text-dark",
      processing: "bg-info text-white",
      completed: "bg-success text-white",
      cancelled: "bg-danger text-white",
    };
    return map[status] || "bg-secondary text-white";
  };

  const getStatusLabel = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // ---------- Format date ----------
  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ---------- Period selector ----------
  const periods = [
    { label: "Today", value: "today" },
    { label: "This Week", value: "week" },
    { label: "This Month", value: "month" },
    { label: "This Year", value: "year" },
  ];

  // ---------- Render ----------
  return (
    <div className="delivery-dashboard container-fluid px-4 py-4">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">📦 Delivery Dashboard</h4>
          <p className="text-muted small mb-0">
            Real-time overview of your delivery operations
          </p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          {periods.map((period) => (
            <button
              key={period.value}
              className={`btn btn-sm ${
                selectedPeriod === period.value
                  ? "btn-dark"
                  : "btn-outline-secondary"
              }`}
              onClick={() => setSelectedPeriod(period.value)}
            >
              {period.label}
            </button>
          ))}
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={() => refetch()}
          >
            <i className="bi bi-arrow-clockwise"></i> Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card bg-white rounded-3 p-3 shadow-sm border-start border-4 border-primary">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className="text-muted small mb-1">Total Orders</p>
                <h3 className="fw-bold mb-0">{stats.totalOrders}</h3>
              </div>
              <div className="stat-icon bg-primary bg-opacity-10 rounded-circle p-3">
                <i className="bi bi-cart-check text-primary fs-4"></i>
              </div>
            </div>
            <div className="mt-2">
              <span className="badge bg-primary bg-opacity-10 text-primary">
                +12.5% from last week
              </span>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card bg-white rounded-3 p-3 shadow-sm border-start border-4 border-warning">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className="text-muted small mb-1">Active Orders</p>
                <h3 className="fw-bold mb-0">{stats.activeOrders}</h3>
              </div>
              <div className="stat-icon bg-warning bg-opacity-10 rounded-circle p-3">
                <i className="bi bi-clock-history text-warning fs-4"></i>
              </div>
            </div>
            <div className="mt-2">
              <span className="badge bg-warning bg-opacity-10 text-warning">
                {stats.pendingOrders} pending · {stats.processingOrders} processing
              </span>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card bg-white rounded-3 p-3 shadow-sm border-start border-4 border-success">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className="text-muted small mb-1">Delivered</p>
                <h3 className="fw-bold mb-0">{stats.completedOrders}</h3>
              </div>
              <div className="stat-icon bg-success bg-opacity-10 rounded-circle p-3">
                <i className="bi bi-check-circle text-success fs-4"></i>
              </div>
            </div>
            <div className="mt-2">
              <span className="badge bg-success bg-opacity-10 text-success">
                {stats.deliveryRate}% delivery rate
              </span>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="stat-card bg-white rounded-3 p-3 shadow-sm border-start border-4 border-info">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className="text-muted small mb-1">Total Revenue</p>
                <h3 className="fw-bold mb-0">₹{stats.totalRevenue.toLocaleString()}</h3>
              </div>
              <div className="stat-icon bg-info bg-opacity-10 rounded-circle p-3">
                <i className="bi bi-currency-rupee text-info fs-4"></i>
              </div>
            </div>
            <div className="mt-2">
              <span className="badge bg-info bg-opacity-10 text-info">
                From {stats.completedOrders} deliveries
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-lg-4">
          <div className="chart-card bg-white rounded-3 p-3 shadow-sm h-100">
            <h6 className="fw-semibold mb-3">Order Status Distribution</h6>
            <div style={{ height: "240px" }}>
              {stats.totalOrders > 0 ? (
                <Doughnut
                  data={statusData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "bottom",
                        labels: {
                          padding: 10,
                          usePointStyle: true,
                          pointStyle: "circle",
                        },
                      },
                    },
                    cutout: "60%",
                  }}
                />
              ) : (
                <div className="text-center text-muted py-5">
                  <i className="bi bi-pie-chart fs-1"></i>
                  <p className="mt-2">No data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="chart-card bg-white rounded-3 p-3 shadow-sm h-100">
            <h6 className="fw-semibold mb-3">Revenue Trend</h6>
            <div style={{ height: "240px" }}>
              <Line
                data={revenueData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: (value) => "₹" + value.toLocaleString(),
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="chart-card bg-white rounded-3 p-3 shadow-sm h-100">
            <h6 className="fw-semibold mb-3">Order Trend</h6>
            <div style={{ height: "240px" }}>
              <Line
                data={orderTrendData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 20,
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row g-3 mb-4">
        <div className="col-12">
          <div className="bg-white rounded-3 p-3 shadow-sm">
            <h6 className="fw-semibold mb-3">Quick Actions</h6>
            <div className="d-flex flex-wrap gap-2">
              <button
                className="btn btn-dark rounded-pill px-4"
                onClick={() => router.push("/All-store-management/Order-Requests")}
              >
                <i className="bi bi-plus-circle me-2"></i>View Pending Orders
              </button>
              <button
                className="btn btn-outline-primary rounded-pill px-4"
                onClick={() => router.push("/All-store-management/All-Orders")}
              >
                <i className="bi bi-list me-2"></i>All Orders
              </button>
              <button
                className="btn btn-outline-success rounded-pill px-4"
                onClick={() => router.push("/All-store-management/delivery-tracker")}
              >
                <i className="bi bi-truck me-2"></i>Delivery Tracker
              </button>
              <button
                className="btn btn-outline-secondary rounded-pill px-4"
                onClick={() => refetch()}
              >
                <i className="bi bi-arrow-repeat me-2"></i>Sync Data
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-3 p-3 shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="fw-semibold mb-0">Recent Orders</h6>
          <button
            className="btn btn-sm btn-link text-decoration-none"
            onClick={() => router.push("/All-store-management/All-Orders")}
          >
            View All <i className="bi bi-chevron-right"></i>
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="text-center text-muted py-4">
            <i className="bi bi-inbox fs-1"></i>
            <p className="mt-2">No orders found</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Order ID</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Amount</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.slice(0, 8).map((order) => (
                  <tr key={order.id}>
                    <td>
                      <span className="fw-semibold">
                        #{order.orderId.substring(order.orderId.length - 8)}
                      </span>
                    </td>
                    <td>{order.product}</td>
                    <td>{order.quantity}</td>
                    <td>₹{order.amount.toFixed(2)}</td>
                    <td>{order.customer}</td>
                    <td className="small">{formatDate(order.createdAt)}</td>
                    <td>
                      <span className={`badge ${getStatusBadge(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() =>
                          router.push(
                            `/All-store-management/orders/${order.orderId}`
                          )
                        }
                      >
                        <i className="bi bi-eye"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
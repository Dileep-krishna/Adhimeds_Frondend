'use client';

import { useState } from 'react';
import './orders.css';

export default function OrdersPage() {
  const [orders, setOrders] = useState([
    { id: 'ORD-001', customer: 'John Doe', email: 'john@example.com', amount: 299, status: 'delivered', date: '2024-01-15', items: 3, payment: 'Paid' },
    { id: 'ORD-002', customer: 'Jane Smith', email: 'jane@example.com', amount: 450, status: 'processing', date: '2024-01-14', items: 2, payment: 'Pending' },
    { id: 'ORD-003', customer: 'Mike Johnson', email: 'mike@example.com', amount: 125, status: 'pending', date: '2024-01-13', items: 1, payment: 'Paid' },
    { id: 'ORD-004', customer: 'Sarah Wilson', email: 'sarah@example.com', amount: 890, status: 'delivered', date: '2024-01-12', items: 5, payment: 'Paid' },
    { id: 'ORD-005', customer: 'Robert Brown', email: 'robert@example.com', amount: 234, status: 'cancelled', date: '2024-01-11', items: 2, payment: 'Refunded' },
    { id: 'ORD-006', customer: 'Emily Davis', email: 'emily@example.com', amount: 567, status: 'processing', date: '2024-01-16', items: 4, payment: 'Paid' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [viewingOrder, setViewingOrder] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    customer: '', email: '', amount: '', status: 'pending', items: 1, payment: 'Paid', date: new Date().toISOString().split('T')[0]
  });

  // Derived stats
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.amount, 0);
  const avgOrder = totalRevenue / totalOrders;
  const deliveredCount = orders.filter(o => o.status === 'delivered').length;

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openModal = (order = null) => {
    if (order) {
      setEditingOrder(order);
      setFormData({
        customer: order.customer,
        email: order.email,
        amount: order.amount,
        status: order.status,
        items: order.items,
        payment: order.payment,
        date: order.date
      });
    } else {
      setEditingOrder(null);
      setFormData({
        customer: '', email: '', amount: '', status: 'pending', items: 1, payment: 'Paid', date: new Date().toISOString().split('T')[0]
      });
    }
    setShowModal(true);
  };

  const saveOrder = () => {
    if (!formData.customer || !formData.amount) return;
    if (editingOrder) {
      setOrders(orders.map(o => o.id === editingOrder.id ? { ...o, ...formData } : o));
    } else {
      const newId = `ORD-${String(orders.length + 101).slice(-3)}`;
      setOrders([...orders, { id: newId, ...formData }]);
    }
    setShowModal(false);
  };

  const deleteOrder = (id) => {
    setOrders(orders.filter(o => o.id !== id));
    setDeleteConfirm(null);
  };

  const updateStatus = (id, newStatus) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      delivered: 'badge-delivered',
      processing: 'badge-processing',
      pending: 'badge-pending',
      cancelled: 'badge-cancelled'
    };
    return classes[status] || 'badge-pending';
  };

  return (
    <div className="orders-page">
      {/* Hero Header */}
      <div className="hero-section orders-hero">
        <div>
          <h1 className="hero-title"><i className="bi bi-receipt"></i> Order Management</h1>
          <p className="hero-subtitle">Track, manage, and fulfill customer orders efficiently.</p>
        </div>
        <button className="btn-glow" onClick={() => openModal()}>
          <i className="bi bi-plus-circle"></i> Add Order
        </button>
      </div>

      {/* Stats Cards */}
      <div className="orders-stats">
        <div className="stat-card">
          <i className="bi bi-cart-check"></i>
          <div><span className="stat-number">{totalOrders}</span><span>Total Orders</span></div>
        </div>
        <div className="stat-card">
          <i className="bi bi-currency-dollar"></i>
          <div><span className="stat-number">${totalRevenue.toLocaleString()}</span><span>Revenue</span></div>
        </div>
        <div className="stat-card">
          <i className="bi bi-graph-up"></i>
          <div><span className="stat-number">${avgOrder.toFixed(0)}</span><span>Avg. Order</span></div>
        </div>
        <div className="stat-card">
          <i className="bi bi-check-circle"></i>
          <div><span className="stat-number">{deliveredCount}</span><span>Delivered</span></div>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="search-group">
          <i className="bi bi-search"></i>
          <input type="text" placeholder="Search by order ID or customer..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <div className="filter-group">
          <label><i className="bi bi-funnel"></i> Status</label>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Orders</option>
            <option value="delivered">Delivered</option>
            <option value="processing">Processing</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
              <th>Payment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => (
              <tr key={order.id} className="order-row">
                <td><strong>{order.id}</strong></td>
                <td>
                  <div className="customer-info">
                    <div className="customer-avatar">{order.customer.charAt(0)}</div>
                    <div>
                      <div>{order.customer}</div>
                      <small>{order.email}</small>
                    </div>
                  </div>
                </td>
                <td>${order.amount}</td>
                <td>
                  <div className="status-selector">
                    <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <select className="status-change" value={order.status} onChange={(e) => updateStatus(order.id, e.target.value)}>
                      <option value="pending">Set Pending</option>
                      <option value="processing">Set Processing</option>
                      <option value="delivered">Set Delivered</option>
                      <option value="cancelled">Set Cancelled</option>
                    </select>
                  </div>
                </td>
                <td>{order.date}</td>
                <td><span className={`payment-badge ${order.payment === 'Paid' ? 'paid' : 'pending'}`}>{order.payment}</span></td>
                <td>
                  <div className="action-icons">
                    <button className="action-icon view" onClick={() => setViewingOrder(order)}><i className="bi bi-eye"></i></button>
                    <button className="action-icon edit" onClick={() => openModal(order)}><i className="bi bi-pencil"></i></button>
                    <button className="action-icon delete" onClick={() => setDeleteConfirm(order.id)}><i className="bi bi-trash"></i></button>
                  </div>
                 </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredOrders.length === 0 && (
          <div className="empty-state">
            <i className="bi bi-inbox"></i>
            <p>No orders found</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><i className="bi bi-cart-plus"></i> {editingOrder ? 'Edit Order' : 'Create Order'}</h3>
              <button className="close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Customer Name</label>
                  <input type="text" value={formData.customer} onChange={e => setFormData({...formData, customer: e.target.value})} placeholder="Full name" />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="customer@example.com" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Amount ($)</label>
                  <input type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} placeholder="0.00" />
                </div>
                <div className="form-group">
                  <label>Items</label>
                  <input type="number" value={formData.items} onChange={e => setFormData({...formData, items: e.target.value})} min="1" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Payment</label>
                  <select value={formData.payment} onChange={e => setFormData({...formData, payment: e.target.value})}>
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Order Date</label>
                <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={saveOrder}>{editingOrder ? 'Update' : 'Create'} Order</button>
            </div>
          </div>
        </div>
      )}

      {/* View Order Modal */}
      {viewingOrder && (
        <div className="modal-overlay" onClick={() => setViewingOrder(null)}>
          <div className="modal-content view-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><i className="bi bi-info-circle"></i> Order Details</h3>
              <button className="close" onClick={() => setViewingOrder(null)}>&times;</button>
            </div>
            <div className="modal-body view-body">
              <div className="detail-row"><span>Order ID:</span><strong>{viewingOrder.id}</strong></div>
              <div className="detail-row"><span>Customer:</span><strong>{viewingOrder.customer}</strong></div>
              <div className="detail-row"><span>Email:</span><strong>{viewingOrder.email}</strong></div>
              <div className="detail-row"><span>Amount:</span><strong>${viewingOrder.amount}</strong></div>
              <div className="detail-row"><span>Items:</span><strong>{viewingOrder.items}</strong></div>
              <div className="detail-row"><span>Status:</span><span className={`status-badge ${getStatusBadgeClass(viewingOrder.status)}`}>{viewingOrder.status}</span></div>
              <div className="detail-row"><span>Payment:</span><span className={`payment-badge ${viewingOrder.payment === 'Paid' ? 'paid' : 'pending'}`}>{viewingOrder.payment}</span></div>
              <div className="detail-row"><span>Date:</span><strong>{viewingOrder.date}</strong></div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setViewingOrder(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content delete-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><i className="bi bi-exclamation-triangle"></i> Confirm Delete</h3>
              <button className="close" onClick={() => setDeleteConfirm(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this order? This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn-danger" onClick={() => deleteOrder(deleteConfirm)}>Delete Order</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
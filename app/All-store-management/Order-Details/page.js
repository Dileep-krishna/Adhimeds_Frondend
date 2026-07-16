"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOrderById, updateItemStatus, deleteItem, uploadBill, updateOrderStatus } from "../../services/orderAPI";
import { getStoreId } from "@/utils/jwtHelper";
import SERVERURL from "@/app/services/serverURL";
import "./order-details.css";

export default function OrderDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');
  const queryClient = useQueryClient();

  // ---------- Modal state ----------
  const [showBillModal, setShowBillModal] = useState(false);
  const [billFile, setBillFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showBillView, setShowBillView] = useState(false);

  // ---------- Fetch order ----------
  const {
    data: order,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const response = await getOrderById(orderId);
      console.log("📦 Order data from API:", response);
      if (!response.success) throw new Error("Failed to load order");
      console.log("📦 Order items:", response.data.items);
      return response.data;
    },
    enabled: !!orderId,
    refetchOnWindowFocus: false,
  });

  // ---------- Order‑level Accept (pending → confirmed) ----------
  const acceptOrderMutation = useMutation({
    mutationFn: async ({ billUrl }) => {
      if (!order) throw new Error("Order not found");
      const pendingItems = order.items.filter(item => item.status === "pending");
      if (pendingItems.length === 0) {
        throw new Error("No pending items to accept.");
      }
      console.log("📤 Accepting order with billUrl:", billUrl);
      // Update each pending item to 'confirmed'
      const promises = pendingItems.map(item =>
        updateItemStatus(orderId, item._id, "confirmed", undefined, billUrl)
      );
      await Promise.all(promises);
      // Update the order‑level status
      const statusResponse = await updateOrderStatus(orderId, "confirmed");
      console.log("📥 Order status update response:", statusResponse);
      // Return the updated order from the response
      return statusResponse.data || statusResponse;
    },
    onSuccess: async (updatedOrder) => {
      toast.success("Order accepted and confirmed!");
      // ✅ Update cache with the fresh order data
      if (updatedOrder) {
        queryClient.setQueryData(["order", orderId], updatedOrder);
      }
      // Invalidate and refetch to be extra safe
      await queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      await refetch();
      setShowBillModal(false);
      setBillFile(null);
    },
    onError: (error) => {
      console.error("Accept error:", error);
      toast.error(error.message || "Failed to accept order");
    },
  });

  // ---------- Order‑level Reject (pending → cancelled) ----------
  const rejectOrderMutation = useMutation({
    mutationFn: async () => {
      if (!order) throw new Error("Order not found");
      const pendingItems = order.items.filter(item => item.status === "pending");
      if (pendingItems.length === 0) {
        throw new Error("No pending items to reject.");
      }
      const promises = pendingItems.map(item =>
        updateItemStatus(orderId, item._id, "cancelled")
      );
      await Promise.all(promises);
      const statusResponse = await updateOrderStatus(orderId, "cancelled");
      return statusResponse.data || statusResponse;
    },
    onSuccess: async (updatedOrder) => {
      toast.success("All pending items rejected!");
      if (updatedOrder) {
        queryClient.setQueryData(["order", orderId], updatedOrder);
      }
      await queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      await refetch();
    },
    onError: (error) => toast.error(error.message || "Failed to reject order"),
  });

  // ---------- Handlers ----------
  const handleAcceptClick = () => setShowBillModal(true);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only PDF, JPEG, and PNG files are allowed.');
        setBillFile(null);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB.');
        setBillFile(null);
        return;
      }
      setBillFile(file);
    }
  };

  const handleUploadAndAccept = async () => {
    if (!billFile) {
      toast.error('Please select a bill file.');
      return;
    }
    if (!order) {
      toast.error('Order not found.');
      return;
    }

    setUploading(true);
    try {
      const pendingItems = order.items.filter(item => item.status === "pending");
      if (pendingItems.length === 0) {
        toast.error('No pending items to accept.');
        setUploading(false);
        return;
      }
      const firstPendingItemId = pendingItems[0]._id;

      console.log("📤 Uploading bill for item:", firstPendingItemId, "file:", billFile.name);
      const uploadResult = await uploadBill(orderId, firstPendingItemId, billFile);
      console.log("📥 Bill upload result:", uploadResult);
      if (!uploadResult.success) {
        toast.error('Bill upload failed: ' + (uploadResult.message || 'Unknown error'));
        setUploading(false);
        return;
      }
      const billUrl = uploadResult.billUrl;
      console.log("✅ Bill URL received:", billUrl);
      acceptOrderMutation.mutate({ billUrl });
    } catch (err) {
      console.error("🔥 Error uploading bill:", err);
      toast.error('Error uploading bill.');
    } finally {
      setUploading(false);
    }
  };

  // ---------- UI Helpers ----------
  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: "bg-warning text-dark",
      confirmed: "bg-info text-white",
      processing: "bg-primary text-white",
      completed: "bg-success text-white",
      cancelled: "bg-danger text-white",
      assigned: "bg-secondary text-white",
    };
    return map[status] || "bg-secondary text-white";
  };

  // ✅ Updated: uses SERVERURL and encodes spaces
  const getBillPreview = (url) => {
    console.log("🖼️ getBillPreview called with URL:", url);
    if (!url) {
      console.warn("⚠️ No bill URL provided.");
      return null;
    }
    const isImage = url.match(/\.(jpeg|jpg|png|gif|webp)$/i);
    const fullUrl = `${SERVERURL}${url}`;
    const encodedUrl = fullUrl.replace(/ /g, '%20');
    console.log("🖼️ Encoded full URL:", encodedUrl);
    console.log("🖼️ Is image?", isImage);

    if (isImage) {
      return (
        <img
          src={encodedUrl}
          alt="Bill"
          className="img-fluid rounded border"
          style={{ maxWidth: '100%', maxHeight: '150px' }}
          onLoad={() => console.log("✅ Image loaded successfully:", encodedUrl)}
          onError={(e) => {
            console.error("❌ Image failed to load:", encodedUrl);
            e.target.style.display = 'none';
          }}
        />
      );
    } else {
      return (
        <a href={encodedUrl} target="_blank" rel="noopener noreferrer" className="d-flex align-items-center text-decoration-none">
          <i className="bi bi-file-earmark-pdf fs-3 text-danger me-2"></i>
          <span>View PDF Bill</span>
        </a>
      );
    }
  };

  // ---------- Render ----------
  if (!orderId) {
    return (
      <div className="container-fluid py-4 bg-light min-vh-100">
        <div className="alert alert-danger">Order ID is missing.</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container-fluid py-4 bg-light min-vh-100 d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-fluid py-4 bg-light min-vh-100">
        <div className="alert alert-danger">Order not found.</div>
      </div>
    );
  }

  const orderData = order;
  const customerName = "Guest";
  const customerPhone = "N/A";
  const orderStatus = orderData.status || "pending";
  const totalAmount = orderData.items.reduce(
    (sum, item) => sum + (item.mrp || 0) * (item.quantity || 1),
    0
  );
  const hasPendingItems = orderData.items.some(item => item.status === "pending");
  const billUrl = orderData.items.find(item => item.billUrl)?.billUrl || null;
  console.log("📌 Final billUrl from order:", billUrl);

  return (
    <div className="container-fluid py-4 bg-light min-vh-100">
      <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
        {/* Header with gradient */}
        <div className="card-header bg-gradient-primary text-white py-4 px-4 d-flex justify-content-between align-items-center">
          <h4 className="mb-0 fw-bold">
            <i className="bi bi-file-earmark-text me-2"></i>Order Details
          </h4>
          <button className="btn btn-light btn-sm rounded-pill px-3" onClick={() => router.back()}>
            <i className="bi bi-arrow-left me-1"></i> Back
          </button>
        </div>

        <div className="card-body p-4">
          {/* Top Section */}
          <div className="row">
            <div className="col-lg-6">
              <div className="d-flex align-items-start gap-4">
                <div className="qr-code">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${orderData._id}`}
                    width={110}
                    height={110}
                    alt="QR"
                    className="rounded border p-1 shadow-sm"
                  />
                </div>
                <div>
                  <h5 className="fw-bold">{customerName}</h5>
                  <p className="text-muted">{customerPhone}</p>
                </div>
              </div>

              {/* Uploaded Bill Section */}
              <div className="mt-4 p-4 border rounded-3 bg-white shadow-sm" style={{ maxWidth: '400px' }}>
                <div className="d-flex justify-content-between align-items-center">
                  <h6 className="fw-semibold mb-0">
                    <i className="bi bi-file-earmark-check me-2 text-success"></i>
                    Uploaded Bill
                  </h6>
                  {billUrl && (
                    <button
                      className="btn btn-outline-primary btn-sm rounded-pill"
                      onClick={() => setShowBillView(true)}
                    >
                      <i className="bi bi-eye me-1"></i> View
                    </button>
                  )}
                </div>
                {billUrl ? (
                  <div className="mt-3">{getBillPreview(billUrl)}</div>
                ) : (
                  <div className="text-muted small">No bill uploaded yet.</div>
                )}
              </div>
            </div>

            {/* Order Info */}
            <div className="col-lg-6 d-flex justify-content-lg-end mt-4 mt-lg-0">
              <div className="bg-white p-4 rounded-3 shadow-sm w-100" style={{ maxWidth: '380px' }}>
                <table className="table table-borderless mb-0">
                  <tbody>
                    <tr><th className="fw-semibold">Order #</th><td className="text-primary fw-semibold">{orderData._id}</td></tr>
                    <tr><th className="fw-semibold">Status</th><td><span className={`badge ${getStatusBadge(orderStatus)} rounded-pill px-3 py-2`}>{orderStatus.charAt(0).toUpperCase() + orderStatus.slice(1)}</span></td></tr>
                    <tr><th className="fw-semibold">Date</th><td>{formatDate(orderData.createdAt)}</td></tr>
                    <tr><th className="fw-semibold">Total</th><td className="fw-bold text-primary">₹{totalAmount.toFixed(2)}</td></tr>
                    <tr><th className="fw-semibold">Payment</th><td>Cash on Delivery</td></tr>
                    <tr><th className="fw-semibold">Additional</th><td>—</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <hr className="my-4" />

          {/* Product Table */}
          <div className="table-responsive">
            <table className="table align-middle table-hover">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Photo</th>
                  <th>Description</th>
                  <th>Delivery Type</th>
                  <th className="text-center">Qty</th>
                  <th className="text-end">Price</th>
                  <th className="text-end">Total</th>
                  <th className="text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {orderData.items.map((item, idx) => {
                  const itemTotal = (item.mrp || 0) * (item.quantity || 1);
                  return (
                    <tr key={item._id || idx}>
                      <td>{idx + 1}</td>
                      <td className="text-center" style={{ fontSize: '1.5rem' }}>💊</td>
                      <td>
                        <div className="fw-semibold">{item.productName}</div>
                        <small className="text-muted">SKU: {item.sku || "-"}</small>
                      </td>
                      <td>{item.deliveryType || "-"}</td>
                      <td className="text-center">{item.quantity || 1}</td>
                      <td className="text-end">₹{(item.mrp || 0).toFixed(2)}</td>
                      <td className="text-end">₹{itemTotal.toFixed(2)}</td>
                      <td className="text-center">
                        <span className={`badge ${getStatusBadge(item.status)} rounded-pill px-2`}>
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="row justify-content-end mt-4">
            <div className="col-lg-3">
              <div className="bg-white p-3 rounded-3 shadow-sm">
                <table className="table table-borderless mb-0">
                  <tbody>
                    <tr><th>Sub Total :</th><td className="text-end">₹{totalAmount.toFixed(2)}</td></tr>
                    <tr><th>Tax :</th><td className="text-end">₹0.00</td></tr>
                    <tr><th>Shipping :</th><td className="text-end">₹0.00</td></tr>
                    <tr><th>Coupon :</th><td className="text-end">₹0.00</td></tr>
                    <tr className="table-light">
                      <th className="fs-5">Total :</th>
                      <th className="text-end fs-3 text-primary">₹{totalAmount.toFixed(2)}</th>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="text-end mt-4 d-flex justify-content-end gap-3">
            {hasPendingItems && (
              <>
                <button
                  className="btn btn-success shadow-sm rounded-pill px-4 py-2 fw-semibold"
                  onClick={handleAcceptClick}
                  disabled={acceptOrderMutation.isPending}
                >
                  {acceptOrderMutation.isPending ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Accepting...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      Accept Order
                    </>
                  )}
                </button>
                <button
                  className="btn btn-danger shadow-sm rounded-pill px-4 py-2 fw-semibold"
                  onClick={() => {
                    if (!confirm("Reject all pending items?")) return;
                    rejectOrderMutation.mutate();
                  }}
                  disabled={rejectOrderMutation.isPending}
                >
                  {rejectOrderMutation.isPending ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-x-circle me-2"></i>
                      Reject Order
                    </>
                  )}
                </button>
              </>
            )}
            <button
              className="btn btn-light shadow-sm rounded-circle"
              style={{ width: 55, height: 55 }}
              onClick={() => window.print()}
            >
              <i className="bi bi-printer fs-4"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Bill Upload Modal */}
      {showBillModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => {
            setShowBillModal(false);
            setBillFile(null);
          }}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header bg-gradient-primary text-white">
                <h5 className="modal-title"><i className="bi bi-upload me-2"></i>Upload Bill</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setShowBillModal(false);
                    setBillFile(null);
                  }}
                />
              </div>
              <div className="modal-body p-4">
                <p className="text-muted">Please upload the bill document (PDF or image) to accept the order.</p>
                <div className="border border-2 border-dashed rounded-3 p-4 text-center">
                  <i className="bi bi-cloud-upload fs-1 text-primary"></i>
                  <p className="mt-2">Drop your file here or click to browse</p>
                  <input
                    type="file"
                    className="form-control"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    style={{ opacity: 0, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                  />
                </div>
                {billFile && (
                  <div className="mt-3">
                    <span className="text-success">✅ {billFile.name}</span>
                    <button
                      className="btn btn-sm btn-outline-danger ms-2"
                      onClick={() => setBillFile(null)}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
              <div className="modal-footer border-0">
                <button
                  className="btn btn-secondary rounded-pill"
                  onClick={() => {
                    setShowBillModal(false);
                    setBillFile(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-success rounded-pill px-4"
                  onClick={handleUploadAndAccept}
                  disabled={uploading || !billFile}
                >
                  {uploading ? 'Uploading...' : 'Confirm Accept'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bill View Modal */}
      {showBillView && billUrl && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowBillView(false)}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header bg-gradient-primary text-white">
                <h5 className="modal-title"><i className="bi bi-file-earmark-text me-2"></i>Bill Document</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowBillView(false)} />
              </div>
              <div className="modal-body p-4 text-center">
                {billUrl.match(/\.(jpeg|jpg|png|gif|webp)$/i) ? (
                  <img
                    src={`${SERVERURL}${billUrl}`.replace(/ /g, '%20')}
                    alt="Bill"
                    className="img-fluid rounded"
                    onLoad={() => console.log("✅ Bill image loaded in modal")}
                    onError={(e) => {
                      console.error("❌ Bill image failed to load in modal");
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <iframe
                    src={`${SERVERURL}${billUrl}`.replace(/ /g, '%20')}
                    style={{ width: '100%', height: '500px' }}
                    className="border rounded"
                  />
                )}
              </div>
              <div className="modal-footer border-0">
                <button className="btn btn-secondary rounded-pill" onClick={() => setShowBillView(false)}>Close</button>
                <a
                  href={`${SERVERURL}${billUrl}`.replace(/ /g, '%20')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary rounded-pill px-4"
                >
                  Download
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
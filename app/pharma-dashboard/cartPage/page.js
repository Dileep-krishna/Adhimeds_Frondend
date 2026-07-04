"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import { useCart } from "@/context/CartContext";
import { useOrderNotifications } from "@/context/OrderNotificationContext";
import { toast } from "sonner";
import { placeOrder } from "../../services/orderAPI";
import "./cart.css";

export default function CartPage() {
  const { cartItems, updateQuantity, removeItem, clearCart } = useCart();
  const { triggerNewOrder } = useOrderNotifications();
  const router = useRouter();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

const handleCheckout = async () => {
  if (cartItems.length === 0) {
    toast.error("Your cart is empty.");
    return;
  }

  const loadingToast = toast.loading("Placing your order...");
  setIsCheckingOut(true);

  try {
    const response = await placeOrder(cartItems);

    if (response.success) {
      toast.success("✅ Order placed successfully!", { id: loadingToast });

      let order = response.order || response.data?.order;

      if (!order) {
        console.warn("⚠️ No order data in response – building from cart items");
        order = {
          _id: response.orderId || `temp-${Date.now()}`,
          items: cartItems.map(item => ({
            _id: item.id,
            productName: item.productName,
            quantity: item.quantity,
            status: "pending",
          })),
          createdAt: new Date().toISOString(),
        };
      }

      if (order.items) {
        order.items = order.items.map(item => ({
          ...item,
          status: item.status || "pending",
        }));
      }

      triggerNewOrder(order);
      clearCart();

      // ❌ REMOVED: router.push("/All-store-management/Order-Requests");
      // ✅ The order is now in the database – the admin will see it when they visit the Order‑Requests page.

      // Optional: stay on cart, show success, maybe clear the form
    } else {
      toast.error(response.message || "Failed to place order.", {
        id: loadingToast,
      });
    }
  } catch (error) {
    toast.error("Network error. Please try again.", { id: loadingToast });
  } finally {
    setIsCheckingOut(false);
  }
};

  return (
    <div className="cart-container container-fluid">
      <Navbar />
      <h5 className="mb-4">My Shopping Cart</h5>
      <div className="row">
        {/* LEFT SIDE – Cart Items */}
        <div className="col-md-8">
          <div className="cart-card p-3">
            {cartItems.length === 0 ? (
              <p className="text-muted">Your cart is empty</p>
            ) : (
              cartItems.map((item) => {
                const stock = item.stock ?? 0;
                return (
                  <div
                    key={item.id}
                    className="cart-item-card mb-4 p-3 border rounded shadow-sm bg-white"
                  >
                    <div className="product-header d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <div className="fw-semibold fs-5">{item.productName}</div>
                        <div className="text-muted small">
                          {item.company || "Company Name"}
                        </div>
                        <div className="text-muted small">
                          HSN Code: {item.hsn || "0000"}
                        </div>
                      </div>
                      <div className="product-icon" style={{ fontSize: "2rem" }}>
                        💊
                      </div>
                    </div>

                    <div className="seller-row d-flex justify-content-between align-items-center p-2 bg-light rounded">
                      <div>
                        <div className="fw-semibold">{item.storeName}</div>
                        <div className="small text-muted mt-1">
                          Rate: ₹{item.rate || 0} &nbsp; MRP: ₹{item.mrp || 0}{" "}
                          &nbsp; Stock: {stock}
                        </div>
                        <div className="small text-muted">
                          Qty/Box: {item.qtyPerBox || 1}
                        </div>
                        <div className="small mt-1">
                          <span className={stock > 0 ? "text-success" : "text-danger"}>
                            {stock > 0 ? "✅ Available" : "❌ Out of Stock"}
                          </span>
                        </div>
                      </div>

                      <div className="d-flex flex-column align-items-end">
                        <div className="d-flex align-items-center">
                          <input
                            type="number"
                            className="form-control form-control-sm me-2 qty-input"
                            style={{ width: "70px" }}
                            value={item.quantity}
                            onChange={(e) =>
                              updateQuantity(item.id, Number(e.target.value))
                            }
                          />
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => removeItem(item.id)}
                          >
                            Remove
                          </button>
                        </div>
                        <small className="text-danger mt-1">
                          Qty should be multiple of {item.qtyPerBox || 1}
                        </small>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT SIDE – Cart Summary */}
        <div className="col-md-4">
          <div className="summary-card p-3 border rounded shadow-sm bg-white">
            <h6 className="mb-3">Cart Value Details</h6>
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="summary-item d-flex justify-content-between mb-2"
              >
                <span>
                  {item.productName} – {item.storeName}
                </span>
                <span>₹{(item.mrp || 0) * item.quantity}</span>
              </div>
            ))}
            <div className="summary-item d-flex justify-content-between mb-3">
              <span>GST Amount</span>
              <span>₹0.00</span>
            </div>
            <hr />
            <div className="d-flex justify-content-between fw-bold mb-3">
              <span>Total Payable Amount</span>
              <span>
                ₹
                {cartItems.reduce(
                  (total, item) => total + (item.mrp || 0) * item.quantity,
                  0
                )}
              </span>
            </div>
            <button
              className="btn checkout-btn w-100"
              onClick={handleCheckout}
              disabled={isCheckingOut || cartItems.length === 0}
            >
              {isCheckingOut ? "Processing..." : "Proceed To Checkout"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
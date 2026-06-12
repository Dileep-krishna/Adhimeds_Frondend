"use client";

import Navbar from "../../components/Navbar";
import "./cart.css";
import { useCart } from "../../context/CartContext";

export default function CartPage() {
  const { cartItems, updateQuantity, removeItem } = useCart();

  return (
    <div className="cart-container container-fluid">
      <Navbar />

      <h5 className="mb-4">My Shopping Cart</h5>

      <div className="row">

        {/* LEFT SIDE */}
        <div className="col-md-8">
          <div className="cart-card p-3">

            {cartItems.length === 0 ? (
              <p className="text-muted">Your cart is empty</p>
            ) : (
              cartItems.map((item) => (
                <div key={item.id} className="mb-4">

                  {/* PRODUCT HEADER */}
                  <div className="product-header d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <div className="fw-semibold">
                        {item.productName}
                      </div>
                      <div className="text-muted small">
                        {item.company || "Company Name"}
                      </div>
                      <div className="text-muted small">
                        HSN Code: {item.hsn || "0000"}
                      </div>
                    </div>

                    <div className="product-icon">💊</div>
                  </div>

                  {/* STORE NAME */}
                  <div className="seller-row d-flex justify-content-between align-items-center p-2">

                    <div>
                      <div className="fw-semibold">
                        {item.storeName}
                      </div>

                      <div className="small text-muted mt-1">
                        Rate: ₹{item.rate || 0} &nbsp;
                        MRP: ₹{item.mrp || 0} &nbsp;
                        Stock: {item.stock || 0}
                      </div>

                      <div className="small text-muted">
                        Qty/Box: {item.qtyPerBox || 1}
                      </div>
                    </div>

                    {/* QTY + ACTION */}
                    <div className="d-flex flex-column align-items-end">

                      <div className="d-flex align-items-center">
                        <input
                          type="number"
                          className="form-control form-control-sm me-2 qty-input"
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

                  <hr />
                </div>
              ))
            )}

          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="col-md-4">
          <div className="summary-card p-3">

            <h6 className="mb-3">Cart Value Details</h6>

            {cartItems.map((item) => (
              <div
                key={item.id}
                className="summary-item d-flex justify-content-between mb-2"
              >
                <span>{item.storeName}</span>
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
                  (total, item) =>
                    total + (item.mrp || 0) * item.quantity,
                  0
                )}
              </span>
            </div>

            <button className="btn checkout-btn w-100">
              Proceed To Checkout
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}
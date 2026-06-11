"use client";

import Navbar from "../../components/Navbar";
import "./cart.css";

export default function CartPage() {
  return (
    <div className="cart-container container-fluid p">
         <Navbar />

      <h5 className="mb-4">My Shopping Cart</h5>

      <div className="row">

        {/* LEFT SIDE */}
        <div className="col-md-8">

          <div className="cart-card p-3">

            {/* HEADER */}
            <div className="row cart-header text-muted fw-bold mb-3">
              <div className="col-md-6">Distributor Name</div>
              <div className="col-md-2 text-center">Item Count</div>
              <div className="col-md-2 text-center">MRP</div>
              <div className="col-md-2 text-center">Action</div>
            </div>

            {/* ITEM */}
            <div className="row align-items-center cart-row">
              <div className="col-md-6 d-flex align-items-center">
                <span className="me-3 fs-4">+</span>
                <span>
                  Oriental Medical & Equipment Co.(omeco)-Adhi Veda Pharmaceutical Pvt Ltd
                </span>
              </div>

              <div className="col-md-2 text-center">01</div>
              <div className="col-md-2 text-center">₹0.00</div>

              <div className="col-md-2 text-center text-danger">
                🗑
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="col-md-4">

          <div className="summary-card p-3">

            <h6 className="mb-3">Cart Value Details</h6>

            <div className="summary-item d-flex justify-content-between align-items-center mb-2">
              <div>
                <input type="checkbox" className="me-2" defaultChecked />
                Oriental Medical & Equipment Co.(omeco)-A...
              </div>
              <span>₹0.00</span>
            </div>

            <div className="summary-item d-flex justify-content-between mb-3">
              <span>GST Amount</span>
              <span>₹0.00</span>
            </div>

            <hr />

            <div className="d-flex justify-content-between fw-bold mb-3">
              <span>Total Payable Amount</span>
              <span>₹0.00</span>
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
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AutoSizer, List } from "react-virtualized";
import "react-virtualized/styles.css";
import Navbar from "../../components/Navbar";
import { useCart } from "@/context/CartContext";
import "./cart.css";

export default function CartPage() {
  const searchParams = useSearchParams();
  const shopId = searchParams.get("shopId");
  console.log("🔍 [CartPage] shopId from URL:", shopId);

  const { cartItems, updateQuantity, removeItem, addItem } = useCart();

  const [storeProducts, setStoreProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [shopName, setShopName] = useState("");

  // Fetch products when shopId is present
  useEffect(() => {
    if (!shopId) {
      setStoreProducts([]);
      setShopName("");
      return;
    }

    async function fetchProducts() {
      setLoadingProducts(true);
      try {
        const res = await fetch("/api/medisoft/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ shopId }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        let productList = [];
        if (Array.isArray(data)) productList = data;
        else if (data?.products && Array.isArray(data.products)) productList = data.products;
        else if (data?.body && Array.isArray(data.body)) productList = data.body;
        else productList = [];
        setStoreProducts(productList);

        // Fetch shop name (optional)
        try {
          const shopsRes = await fetch("/api/medisoft/shops");
          if (shopsRes.ok) {
            const shopsData = await shopsRes.json();
            const shopsArray = Array.isArray(shopsData) ? shopsData : shopsData?.body || [];
            const found = shopsArray.find(s => s.shopid === shopId);
            if (found) setShopName(found.name);
          }
        } catch (e) {
          console.warn("Could not fetch shop name", e);
        }
      } catch (err) {
        console.error("Products fetch error:", err);
        setStoreProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    }

    fetchProducts();
  }, [shopId]);

  // Row renderer for react-virtualized (now used with AutoSizer)
  const rowRenderer = ({ index, key, style }) => {
    const item = storeProducts[index];
    if (!item) return null;
    return (
      <div key={key} style={style} className="border-bottom p-2 d-flex justify-content-between align-items-center">
        <div>
          <strong>{item.productname || item.itemname || "Product"}</strong>
          <br />
          <small>
            Qty: {item.quantity || 0} | Pack: {item.pack || "N/A"} | MRP: ₹{item.mrp || 0}
          </small>
        </div>
        <button
          className="btn btn-sm btn-primary"
          onClick={() => {
            addItem({
              id: item.id || item.productId || Math.random().toString(),
              productName: item.productname || item.itemname,
              storeName: shopName || "Store",
              mrp: item.mrp || 0,
              quantity: 1,
              rate: item.mrp || 0,
              stock: item.quantity || 0,
              qtyPerBox: 1,
              company: "",
              hsn: "",
            });
          }}
        >
          Add to Cart
        </button>
      </div>
    );
  };

  return (
    <div className="cart-container container-fluid">
      <Navbar />

      <h5 className="mb-4">My Shopping Cart</h5>

      {/* Show store products if a shop was selected */}
      {shopId && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="cart-card p-3">
              <h6 className="mb-3">
                Products from {shopName || `Store ${shopId}`}
              </h6>
              {loadingProducts ? (
                <p>Loading products...</p>
              ) : storeProducts.length === 0 ? (
                <p className="text-muted">No products found for this store.</p>
              ) : (
                // Fixed height container for AutoSizer
                <div style={{ height: "500px", width: "100%" }}>
                  <AutoSizer>
                    {({ height, width }) => (
                      <List
                        height={height}
                        rowCount={storeProducts.length}
                        rowHeight={80}
                        width={width}
                        rowRenderer={rowRenderer}
                      />
                    )}
                  </AutoSizer>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="row">
        {/* LEFT SIDE – Existing Cart Items (unchanged) */}
        <div className="col-md-8">
          <div className="cart-card p-3">
            {cartItems.length === 0 ? (
              <p className="text-muted">Your cart is empty</p>
            ) : (
              cartItems.map((item) => (
                <div key={item.id} className="mb-4">
                  <div className="product-header d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <div className="fw-semibold">{item.productName}</div>
                      <div className="text-muted small">{item.company || "Company Name"}</div>
                      <div className="text-muted small">HSN Code: {item.hsn || "0000"}</div>
                    </div>
                    <div className="product-icon">💊</div>
                  </div>

                  <div className="seller-row d-flex justify-content-between align-items-center p-2">
                    <div>
                      <div className="fw-semibold">{item.storeName}</div>
                      <div className="small text-muted mt-1">
                        Rate: ₹{item.rate || 0} &nbsp; MRP: ₹{item.mrp || 0} &nbsp; Stock: {item.stock || 0}
                      </div>
                      <div className="small text-muted">Qty/Box: {item.qtyPerBox || 1}</div>
                    </div>

                    <div className="d-flex flex-column align-items-end">
                      <div className="d-flex align-items-center">
                        <input
                          type="number"
                          className="form-control form-control-sm me-2 qty-input"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                        />
                        <button className="btn btn-danger btn-sm" onClick={() => removeItem(item.id)}>
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

        {/* RIGHT SIDE – Cart Summary (unchanged) */}
        <div className="col-md-4">
          <div className="summary-card p-3">
            <h6 className="mb-3">Cart Value Details</h6>
            {cartItems.map((item) => (
              <div key={item.id} className="summary-item d-flex justify-content-between mb-2">
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
                {cartItems.reduce((total, item) => total + (item.mrp || 0) * item.quantity, 0)}
              </span>
            </div>
            <button className="btn checkout-btn w-100">Proceed To Checkout</button>
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Offcanvas, Button } from "react-bootstrap";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import "./CartSidebar.css";

export default function CartSidebar({ show, onHide, selectedProduct, storeList }) {
  const router = useRouter();
  const { addItem } = useCart();

  const [quantities, setQuantities] = useState({});
  const [adding, setAdding] = useState({});

  useEffect(() => {
    if (storeList && storeList.length) {
      const initial = {};
      storeList.forEach((_, idx) => (initial[idx] = 1));
      setQuantities(initial);
    }
  }, [storeList]);

  // Get the maximum stock for a store (or product)
  const getMaxStock = (store, idx) => {
    // Use store's stockCount if available, else fallback to selectedProduct stock
    return parseInt(store.stockCount) || parseInt(selectedProduct?.stock) || 0;
  };

  const handleQuantityChange = (idx, value, store) => {
    // Allow empty temporarily
    if (value === '') {
      setQuantities(prev => ({ ...prev, [idx]: '' }));
      return;
    }

    let qty = parseInt(value);
    if (isNaN(qty) || qty < 1) qty = 1;

    // Cap at max stock
    const maxStock = getMaxStock(store, idx);
    if (qty > maxStock && maxStock > 0) {
      qty = maxStock;
      toast.warning(`Only ${maxStock} items available in stock.`, {
        className: "custom-toast",
      });
    }

    setQuantities(prev => ({ ...prev, [idx]: qty }));
  };

  const handleQuantityBlur = (idx, store) => {
    setQuantities(prev => {
      const current = prev[idx];
      if (current === '' || isNaN(parseInt(current)) || parseInt(current) < 1) {
        return { ...prev, [idx]: 1 };
      }
      // Also cap on blur
      const qty = parseInt(current);
      const maxStock = getMaxStock(store, idx);
      if (qty > maxStock && maxStock > 0) {
        toast.warning(`Only ${maxStock} items available.`, { className: "custom-toast" });
        return { ...prev, [idx]: maxStock };
      }
      return prev;
    });
  };

  const handleAddStoreItem = (store, idx) => {
    if (store.stock !== "In Stock") {
      toast.error("This product is out of stock at this store.", { className: "custom-toast" });
      return;
    }

    const qty = parseInt(quantities[idx]) || 1;
    const maxStock = getMaxStock(store, idx);

    if (qty > maxStock) {
      toast.error(`Only ${maxStock} items available. Please reduce quantity.`, { className: "custom-toast" });
      return;
    }

    setAdding(prev => ({ ...prev, [idx]: true }));

    try {
      const newItem = {
        id: selectedProduct.id || selectedProduct.productId || Math.random().toString(),
        productName: selectedProduct.productname || selectedProduct.itemname || store.productName,
        storeName: store.storeName,
        mrp: parseFloat(store.mrp) || 0,
        rate: parseFloat(store.rate) || 0,
        quantity: qty,
        stock: parseInt(selectedProduct.stock) || 0,
        qtyPerBox: store.qtyPerBox || 1,
        company: selectedProduct.manufacturer || "",
        hsn: selectedProduct.hsnCode || selectedProduct.hsn || "",
        batch: selectedProduct.batch || "",
        expiry: selectedProduct.expiry || "",
        pack: store.pack || "",
        scheme: store.scheme || "",
        gst: selectedProduct.gst || "0",
      };

      addItem(newItem);
      toast.success(`${newItem.productName} added to cart!`, { className: "custom-toast" });
      onHide();
    } catch (err) {
      console.error("Error adding to cart:", err);
      toast.error("Failed to add item. Please try again.", { className: "custom-toast" });
    } finally {
      setAdding(prev => ({ ...prev, [idx]: false }));
    }
  };

  const isProductInStock = parseInt(selectedProduct?.stock) > 0;

  return (
    <Offcanvas
      show={show}
      onHide={onHide}
      placement="end"
      className="cart-sidebar"
      backdrop={true}
      scroll={false}
    >
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Add to Cart</Offcanvas.Title>
      </Offcanvas.Header>

      <Offcanvas.Body className="cart-sidebar-body">
        {selectedProduct && storeList?.length > 0 && (
          <div>
            {/* PRODUCT HEADER – real data */}
            <div className="product-header d-flex justify-content-between">
              <div>
                <div className="product-title">
                  {selectedProduct.productname || selectedProduct.itemname || "Product"}
                </div>
                <div className="text-muted small">
                  Manufacturer: {selectedProduct.manufacturer || "N/A"}
                </div>
                <div className="text-muted small">
                  Batch: {selectedProduct.batch || "N/A"} &nbsp;|&nbsp; Expiry: {selectedProduct.expiry || "N/A"}
                </div>
                <div className="text-muted small">
                  HSN: {selectedProduct.hsnCode || selectedProduct.hsn || "N/A"} &nbsp;|&nbsp; GST: {selectedProduct.gst || "0"}%
                </div>
                <div className="text-muted small">
                  Stock: <span className={isProductInStock ? "text-success" : "text-danger"}>
                    {isProductInStock ? `✅ ${selectedProduct.stock}` : "❌ Out of Stock"}
                  </span>
                </div>
              </div>
              <div className="product-icon">💊</div>
            </div>

            <div className="d-flex align-items-center mt-3 mb-2">
              <span className="me-2">Available Stock</span>
              <div className="form-check form-switch m-0">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={isProductInStock}
                  disabled={true}
                />
              </div>
            </div>

            {storeList.map((store, idx) => {
              const isStoreInStock = store.stock === "In Stock";
              const maxStock = getMaxStock(store, idx);
              const currentQty = parseInt(quantities[idx]) || 1;
              const isQtyValid = currentQty <= maxStock;

              return (
                <div key={idx} className="store-card-new">
                  <div className="store-header d-flex justify-content-between">
                    <div className="fw-semibold">{store.storeName}</div>
                    <span className={`badge ${isStoreInStock ? "bg-success" : "bg-danger"}`}>
                      {store.stock}
                    </span>
                  </div>

                  <div className="store-details">
                    <div>{store.productName}</div>
                    <div>
                      Pack: {store.pack} | Rate: ₹{store.rate} | MRP: ₹{store.mrp}
                    </div>
                    <div>Scheme: {store.scheme || "—"}</div>
                    <div>Content: {store.content || "Available"}</div>
                    <div>Qty/Box: {store.qtyPerBox}</div>
                    {isStoreInStock && (
                      <div className="text-muted small">Max Qty: {maxStock}</div>
                    )}
                  </div>

                  <div className="store-actions d-flex justify-content-end align-items-center">
                    <input
                      type="number"
                      className="form-control form-control-sm qty-input me-2"
                      min="1"
                      max={maxStock || 1}
                      value={quantities[idx] ?? 1}
                      onChange={(e) => handleQuantityChange(idx, e.target.value, store)}
                      onBlur={() => handleQuantityBlur(idx, store)}
                      disabled={!isStoreInStock}
                    />
                    <Button
                      className="add-btn"
                      size="sm"
                      onClick={() => handleAddStoreItem(store, idx)}
                      disabled={adding[idx] || !isStoreInStock || !isQtyValid}
                    >
                      {adding[idx] ? "..." : "Add"}
                    </Button>
                  </div>

                  {!isQtyValid && isStoreInStock && (
                    <div className="text-danger small mt-1">
                      Quantity exceeds available stock (max: {maxStock})
                    </div>
                  )}

                  <div className="qty-warning">
                    Qty should be multiple of {store.qtyPerBox || 1}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
}
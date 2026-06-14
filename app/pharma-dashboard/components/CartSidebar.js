"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Offcanvas, Button, InputGroup, FormControl } from "react-bootstrap";
import { useCart } from "@/context/CartContext";
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

  const handleQuantityChange = (idx, value) => {
    let qty = parseInt(value) || 1;
    if (qty < 1) qty = 1;
    setQuantities(prev => ({ ...prev, [idx]: qty }));
  };

const handleAddStoreItem = (store, idx) => {
  setAdding(prev => ({ ...prev, [idx]: true }));

  try {
    const newItem = {
      productId: selectedProduct._id,
      productName: selectedProduct.productName,
      storeName: store.storeName,
      pack: store.pack,
      rate: store.rate,
      mrp: store.mrp,
      scheme: store.scheme,
      quantity: quantities[idx],
      qtyPerBox: store.qtyPerBox
    };

    addItem(newItem);
    router.push("/pharma-dashboard/cartPage");

  } catch (err) {
    console.error(err);
  } finally {
    setAdding(prev => ({ ...prev, [idx]: false }));
  }
};

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

            {/* PRODUCT HEADER */}
            <div className="product-header d-flex justify-content-between">
              <div>
                <div className="product-title">
                  {selectedProduct.productName}
                </div>
                <div className="text-muted small">
                  {selectedProduct.brand}
                </div>
                <div className="text-muted small">
                  HSN: {selectedProduct.hsnCode || "30049061"}
                </div>
              </div>

              <div className="product-icon">💊</div>
            </div>

            {/* STOCK TOGGLE */}
            <div className="d-flex align-items-center mt-3 mb-2">
              <span className="me-2">Available Stock</span>
              <div className="form-check form-switch m-0">
                <input className="form-check-input" type="checkbox" defaultChecked />
              </div>
            </div>

            {/* STORE LIST */}
            {storeList.map((store, idx) => (
              <div key={idx} className="store-card-new">

                {/* STORE HEADER */}
                <div className="store-header d-flex justify-content-between">
                  <div className="fw-semibold">{store.storeName}</div>
                  <span className={`badge ${store.stock === "In Stock" ? "bg-success" : "bg-danger"}`}>
                    {store.stock}
                  </span>
                </div>

                {/* DETAILS */}
                <div className="store-details">
                  <div>{store.productName}</div>
                  <div>
                    Pack: {store.pack} | Rate: ₹{store.rate} | MRP: ₹{store.mrp}
                  </div>
                  <div>Scheme: {store.scheme || "—"}</div>
                  <div>Content: {store.content}</div>
                  <div>Qty/Box: {store.qtyPerBox}</div>
                </div>

                {/* ACTION */}
                <div className="store-actions d-flex justify-content-end align-items-center">
                  
                  <input
                    type="number"
                    className="form-control form-control-sm qty-input me-2"
                    value={quantities[idx]}
                    onChange={(e) => handleQuantityChange(idx, e.target.value)}
                  />

                  <Button
                    className="add-btn"
                    size="sm"
                    onClick={() => handleAddStoreItem(store, idx)}
                    disabled={adding[idx]}
                  >
                    {adding[idx] ? "..." : "Add"}
                  </Button>

                </div>

                <div className="qty-warning">
                  Qty should be multiple of {store.qtyPerBox || 1}
                </div>

              </div>
            ))}

          </div>
        )}

      </Offcanvas.Body>
    </Offcanvas>
  );
}
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Offcanvas, Button, InputGroup, FormControl } from "react-bootstrap";
import { useCart } from "../../context/CartContext";

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

  const handleAddStoreItem = async (store, idx) => {
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
    <Offcanvas show={show} onHide={onHide} placement="end" size="lg">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Add to Cart</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        {selectedProduct && storeList?.length > 0 && (
          <div className="pending-product mb-4 p-3 border rounded bg-light">
            <h6 className="mb-2">{selectedProduct.productName}</h6>
            <div className="small text-muted mb-3">
              {selectedProduct.brand} | HSN: {selectedProduct.hsnCode || "30049061"}
            </div>
            <div className="fw-bold mb-2">Available Stock</div>
            {storeList.map((store, idx) => (
              <div key={idx} className="store-item mb-3 p-2 border rounded bg-white">
                <div className="d-flex justify-content-between">
                  <strong>{store.storeName}</strong>
                  <span className={`badge ${store.stock === "In Stock" ? "bg-success" : "bg-danger"}`}>
                    {store.stock}
                  </span>
                </div>
                <div className="small mt-1">
                  <div>{store.productName}</div>
                  <div>Pack: {store.pack} | Rate: ₹{store.rate} | MRP: ₹{store.mrp}</div>
                  <div>Scheme: {store.scheme || "—"}</div>
                  <div>Content: {store.content}</div>
                  <div>Qty/Box: {store.qtyPerBox}</div>
                </div>
                <div className="mt-2 d-flex align-items-center gap-2 flex-wrap">
                  <span>Quantity:</span>
                  <InputGroup style={{ width: "120px" }}>
                    <Button variant="outline-secondary" size="sm" onClick={() => handleQuantityChange(idx, quantities[idx] - 1)}>-</Button>
                    <FormControl
                      type="number"
                      value={quantities[idx]}
                      onChange={(e) => handleQuantityChange(idx, e.target.value)}
                      min="1"
                      step="1"
                      className="text-center"
                    />
                    <Button variant="outline-secondary" size="sm" onClick={() => handleQuantityChange(idx, quantities[idx] + 1)}>+</Button>
                  </InputGroup>
                  <span className="small text-muted">Qty should be multiple of 1</span>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleAddStoreItem(store, idx)}
                    disabled={adding[idx]}
                  >
                    {adding[idx] ? "Adding..." : "Add to Cart"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
}
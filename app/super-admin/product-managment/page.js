"use client";

import { useState } from "react";
import "./style.css";

export default function ProductPage() {
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Paracetamol 500mg",
      category: "Tablets",
      price: 20,
      stock: 100,
      status: "active",
    },
    {
      id: 2,
      name: "Cough Syrup",
      category: "Syrups",
      price: 80,
      stock: 50,
      status: "active",
    },
  ]);

  const [form, setForm] = useState({
    name: "",
    category: "Tablets",
    price: "",
    stock: "",
    status: "active",
  });

  const [editingId, setEditingId] = useState(null);

  const categories = ["Tablets", "Syrups", "Injection", "Capsules"];

  // ➕ Add Product
  const addProduct = () => {
    if (!form.name || !form.price) return;

    const newProduct = {
      id: Date.now(),
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
    };

    setProducts([newProduct, ...products]);
    resetForm();
  };

  // ✏️ Update Product
  const updateProduct = () => {
    setProducts(
      products.map((p) =>
        p.id === editingId ? { ...p, ...form } : p
      )
    );
    resetForm();
  };

  // ❌ Delete
  const deleteProduct = (id) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  // 🔄 Toggle Status
  const toggleStatus = (id) => {
    setProducts(
      products.map((p) =>
        p.id === id
          ? {
              ...p,
              status: p.status === "active" ? "inactive" : "active",
            }
          : p
      )
    );
  };

  // Reset Form
  const resetForm = () => {
    setForm({
      name: "",
      category: "Tablets",
      price: "",
      stock: "",
      status: "active",
    });
    setEditingId(null);
  };

  return (
    <div className="product-page">
      <h2>💊 Product Management</h2>

      {/* ➕ FORM */}
      <div className="form-box">
        <input
          type="text"
          placeholder="Product Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        >
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />

        <input
          type="number"
          placeholder="Stock"
          value={form.stock}
          onChange={(e) => setForm({ ...form, stock: e.target.value })}
        />

        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        {editingId ? (
          <button onClick={updateProduct}>Update</button>
        ) : (
          <button onClick={addProduct}>Add Product</button>
        )}
      </div>

      {/* 📋 TABLE */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Price ₹</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.category}</td>
                <td>{p.price}</td>
                <td>{p.stock}</td>

                <td>
                  <span
                    className={
                      p.status === "active"
                        ? "badge active"
                        : "badge inactive"
                    }
                  >
                    {p.status}
                  </span>
                </td>

                <td>
                  <button
                    className="btn edit"
                    onClick={() => {
                      setForm(p);
                      setEditingId(p.id);
                    }}
                  >
                    Edit
                  </button>

                  <button
                    className="btn delete"
                    onClick={() => deleteProduct(p.id)}
                  >
                    Delete
                  </button>

                  <button
                    className="btn toggle"
                    onClick={() => toggleStatus(p.id)}
                  >
                    Toggle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
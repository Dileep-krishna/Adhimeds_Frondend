"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import "./storelogin.css";

export default function StoreLoginPage() {
  const router = useRouter();

  // Dummy UI – no real authentication, but inputs are enabled
  const handleDummySubmit = (e) => {
    e.preventDefault();
    alert("This is a design-only store login page. No authentication is implemented.");
  };

  const backgroundImageUrl =
    "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format";

  return (
    <div className="container-fluid vh-100 p-0 overflow-hidden">
      <div className="row g-0 h-100">
        {/* LEFT SIDE – Medical Store Theme */}
        <div
          className="col-lg-6 d-none d-lg-flex flex-column justify-content-center align-items-center position-relative"
          style={{
            backgroundImage: `url(${backgroundImageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div
            className="position-absolute top-0 start-0 w-100 h-100"
            style={{ backgroundColor: "rgba(10, 25, 47, 0.65)" }}
          ></div>
          <div className="text-center text-white position-relative z-1 px-4 animate-fade-up">
            <div className="mb-4 animate-float">
              <img
                src="/images/logo.webp"
                alt="Store Logo"
                width="100"
                height="100"
                className="rounded-3 shadow-lg animate-pulse"
                style={{ objectFit: "contain" }}
                onError={(e) => (e.target.style.display = "none")}
              />
            </div>
            <h1 className="display-4 fw-bold mb-2">MEDICAL STORE</h1>
            <p className="lead mb-3">Your Trusted Pharmacy Partner</p>
            <div className="w-25 bg-white mx-auto my-3" style={{ height: "2px" }}></div>
            <p className="opacity-75">24/7 Healthcare & Medicine Delivery</p>
          </div>
        </div>

        {/* RIGHT SIDE – Store Login Form (design only, inputs enabled) */}
        <div className="col-12 col-lg-6 d-flex justify-content-center align-items-center bg-light p-4">
          <div
            className="card border-0 shadow-lg w-100 animate-zoom-in"
            style={{ maxWidth: "480px" }}
          >
            <div className="card-body p-4 p-md-5">
              <div className="text-center mb-4 animate-fade-up">
                <div className="mx-auto mb-3" style={{ width: "80px", height: "80px" }}>
                  <img
                    src="/images/logo.webp"
                    alt="Company Logo"
                    className="w-100 h-100 object-fit-contain rounded-3 shadow-sm"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                </div>
                <h1 className="h2 fw-bold text-primary">Store Login</h1>
                <p className="text-secondary">Access your pharmacy management dashboard</p>
                <div className="w-25 bg-primary mx-auto my-3" style={{ height: "2px", opacity: 0.3 }}></div>
                <p className="text-muted small">Secure login for registered medical stores</p>
              </div>

              {/* Working form – inputs are enabled, no real submission */}
              <form onSubmit={handleDummySubmit}>
                

                <div className="mb-3 animate-fade-up delay-200">
                  <label className="form-label fw-semibold">Email Address</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0">
                      <i className="bi bi-envelope"></i>
                    </span>
                    <input
                      type="email"
                      className="form-control border-start-0 ps-0"
                      placeholder="store@example.com"
                    />
                  </div>
                </div>

                <div className="mb-3 animate-fade-up delay-300">
                  <label className="form-label fw-semibold">Password</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0">
                      <i className="bi bi-lock"></i>
                    </span>
                    <input
                      type="password"
                      className="form-control border-start-0 ps-0"
                      placeholder="••••••"
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-4 animate-fade-up delay-400">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="rememberStore"
                    />
                    <label className="form-check-label text-secondary" htmlFor="rememberStore">
                      Keep me logged in
                    </label>
                  </div>
                  <button
                    type="button"
                    className="btn btn-link p-0 text-decoration-none text-primary"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  className="btn btn-dark w-100 py-2 rounded-pill fw-semibold animate-fade-up delay-500"
                  style={{ backgroundColor: "#0a2b4e", borderColor: "#0a2b4e" }}
                >
                  Sign In to Store
                </button>
              </form>

              <div className="mt-4 text-center animate-fade-up delay-600">
                <button
                  onClick={() => router.back()}
                  className="btn btn-link text-secondary text-decoration-none p-0"
                >
                  ← Back to previous page
                </button>
              </div>

              <div className="mt-3 text-center small text-muted animate-fade-up delay-700">
                Demo store: store@medical.com / password123
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
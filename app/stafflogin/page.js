"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import "./stafflogin.css";
import SERVERURL from "../services/serverURL";

export default function StaffLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  let redirectTimeout = useRef(null);

  useEffect(() => {
    return () => {
      if (redirectTimeout.current) clearTimeout(redirectTimeout.current);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${SERVERURL}/staff/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem("staffToken", data.data.token);
        storage.setItem("staffRole", data.data.role);
        storage.setItem("staffName", data.data.fullName);
        storage.setItem("staffId", data.data._id);

        toast.success(`Welcome, ${data.data.fullName}! Redirecting...`);

        redirectTimeout.current = setTimeout(() => {
          router.push("/staff-dashboard");
        }, 1000);
      } else {
        toast.error(data.message || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const backgroundImageUrl =
    "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format";

  return (
    <div className="container-fluid vh-100 p-0 overflow-hidden">
      <Toaster position="top-right" />
      <div className="row g-0 h-100">
        {/* LEFT SIDE – Branding */}
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
                alt="Company Logo"
                width="100"
                height="100"
                className="rounded-3 shadow-lg animate-pulse"
                style={{ objectFit: "contain" }}
                onError={(e) => (e.target.style.display = "none")}
              />
            </div>
            <h1 className="display-4 fw-bold mb-2">STAFF PORTAL</h1>
            <p className="lead mb-3">Employee Access Only</p>
            <div className="w-25 bg-white mx-auto my-3" style={{ height: "2px" }}></div>
            <p className="opacity-75">Secure internal dashboard for our team</p>
          </div>
        </div>

        {/* RIGHT SIDE – Staff Login Form (no district) */}
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
                <h1 className="h2 fw-bold text-primary">Staff Login</h1>
                <p className="text-secondary">Access your work dashboard</p>
                <div className="w-25 bg-primary mx-auto my-3" style={{ height: "2px", opacity: 0.3 }}></div>
                <p className="text-muted small">Use your company credentials</p>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Email */}
                <div className="mb-3 animate-fade-up delay-200">
                  <label className="form-label fw-semibold">Email Address</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0">
                      <i className="bi bi-envelope"></i>
                    </span>
                    <input
                      type="email"
                      className="form-control border-start-0 ps-0"
                      placeholder="staff@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Password */}
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
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-4 animate-fade-up delay-400">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="rememberStaff"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <label className="form-check-label text-secondary" htmlFor="rememberStaff">
                      Keep me logged in
                    </label>
                  </div>
                  <button
                    type="button"
                    className="btn btn-link p-0 text-decoration-none text-primary"
                    onClick={() => toast.info("Contact admin to reset password")}
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  className="btn btn-dark w-100 py-2 rounded-pill fw-semibold animate-fade-up delay-500"
                  style={{ backgroundColor: "#0a2b4e", borderColor: "#0a2b4e" }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Signing in...
                    </>
                  ) : (
                    "Staff Sign In"
                  )}
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
                Demo: staff@example.com / password123
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
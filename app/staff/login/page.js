"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import "./stafflogin.css";

export default function StaffLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("pharmacist");
  const [district, setDistrict] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const backgroundImageUrl =
    "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format";

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      alert("Please enter both email and password.");
      return;
    }
    if (!district.trim()) {
      alert("Please enter your district.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      localStorage.setItem("staffEmail", email);
      localStorage.setItem("staffRole", role);
      localStorage.setItem("staffDistrict", district);
      if (rememberMe) {
        localStorage.setItem("staffRemembered", "true");
      } else {
        localStorage.removeItem("staffRemembered");
      }

      setIsLoading(false);

      switch (role) {
        case "pharmacist":
          router.push("/staff/pharmacist/dashboard");
          break;
        case "delivery-head":
          router.push("/staff/delivery-head/dashboard");
          break;
        case "delivery-boy":
          router.push("/staff/delivery-boy/dashboard");
          break;
        default:
          router.push("/staff/pharmacist/dashboard");
      }
    }, 1000);
  };

  const handleForgotPassword = () => {
    alert("Password reset link would be sent to your registered email. (Demo)");
  };

  return (
    <div className="container-fluid vh-100 p-0 overflow-hidden">
      <div className="row g-0 h-100">
        {/* LEFT SIDE - BACKGROUND IMAGE + BRANDING */}
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
                alt="Logo"
                width="100"
                height="100"
                className="rounded-3 shadow-lg animate-pulse"
                style={{ objectFit: "contain" }}
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            </div>
            <h1 className="display-4 fw-bold mb-2">ADHIMEDICINE</h1>
            <p className="lead mb-3">STAFF PORTAL</p>
            <div className="w-25 bg-white mx-auto my-3" style={{ height: "2px" }}></div>
            <p className="opacity-75">Dedicated to your service</p>
          </div>
        </div>

        {/* RIGHT SIDE - LOGIN FORM */}
        <div className="col-12 col-lg-6 d-flex justify-content-center align-items-center bg-light p-4">
          <div
            className="card border-0 shadow-lg w-100 animate-zoom-in"
            style={{ maxWidth: "520px" }}
          >
            <div className="card-body p-4 p-md-5">
              <div className="text-center mb-4 animate-fade-up">
                <div className="mx-auto mb-3" style={{ width: "80px", height: "80px" }}>
                  <img
                    src="/images/logo.webp"
                    alt="Logo"
                    className="w-100 h-100 object-fit-contain rounded-3 shadow-sm"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                </div>
                <h1 className="h2 fw-bold text-primary">Staff Login</h1>
                <p className="text-secondary">Access your work portal</p>
                <div className="w-25 bg-primary mx-auto my-3" style={{ height: "2px", opacity: 0.3 }}></div>
                <p className="text-muted small">Secure access for medicine delivery staff</p>
              </div>

              <form onSubmit={handleLogin}>
                {/* Email */}
                <div className="mb-3 animate-fade-up delay-100">
                  <label className="form-label fw-semibold">Email Address</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0">
                      <i className="bi bi-envelope"></i>
                    </span>
                    <input
                      type="email"
                      className="form-control border-start-0 ps-0"
                      placeholder="staff@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="mb-3 animate-fade-up delay-200">
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
                      disabled={isLoading}
                      autoComplete="current-password"
                    />
                  </div>
                </div>

                {/* Role */}
                <div className="mb-3 animate-fade-up delay-300">
                  <label className="form-label fw-semibold">Role</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0">
                      <i className="bi bi-person-badge"></i>
                    </span>
                    <select
                      className="form-select border-start-0 ps-0"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      disabled={isLoading}
                    >
                      <option value="pharmacist">Pharmacist</option>
                      <option value="delivery-head">Delivery Head</option>
                      <option value="delivery-boy">Delivery Boy</option>
                    </select>
                  </div>
                </div>

                {/* District */}
                <div className="mb-3 animate-fade-up delay-400">
                  <label className="form-label fw-semibold">District</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0">
                      <i className="bi bi-geo-alt"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0 ps-0"
                      placeholder="e.g., Ernakulam"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Remember me & Forgot password */}
                <div className="d-flex justify-content-between align-items-center mb-4 animate-fade-up delay-500">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      disabled={isLoading}
                    />
                    <label className="form-check-label text-secondary" htmlFor="rememberMe">
                      Remember me
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="btn btn-link p-0 text-decoration-none text-primary"
                    disabled={isLoading}
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  className="btn btn-dark w-100 py-2 rounded-pill fw-semibold animate-fade-up delay-600"
                  style={{ backgroundColor: "#0a2b4e", borderColor: "#0a2b4e" }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Logging in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>

              <div className="mt-4 text-center animate-fade-up delay-700">
                <button
                  onClick={() => router.back()}
                  className="btn btn-link text-secondary text-decoration-none p-0"
                  disabled={isLoading}
                >
                  ← Back to previous page
                </button>
              </div>

              <div className="mt-3 text-center small text-muted animate-fade-up delay-800">
                Demo: any email / any password (district required)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
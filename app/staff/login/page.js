"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import "./stafflogin.css";
import SERVERURL from "../../services/serverURL";

export default function StaffLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  let redirectTimeout = useRef(null);
  let startTime = useRef(null);

  useEffect(() => {
    console.group("🟢 [StaffLogin] Component Lifecycle");
    console.log("Component mounted at", new Date().toISOString());
    console.log("SERVERURL:", SERVERURL);
    console.log("Environment:", process.env.NODE_ENV);
    
    // Validate SERVERURL format
    try {
      new URL(SERVERURL);
      console.log("✅ SERVERURL is valid URL");
    } catch (e) {
      console.error("❌ SERVERURL is INVALID:", SERVERURL);
    }
    
    // Check for existing token
    const localToken = localStorage.getItem("staffToken");
    const sessionToken = sessionStorage.getItem("staffToken");
    if (localToken || sessionToken) {
      console.log("⚠️ Existing token found - localStorage:", !!localToken, "sessionStorage:", !!sessionToken);
      console.log("  - staffRole:", localStorage.getItem("staffRole") || sessionStorage.getItem("staffRole"));
      console.log("  - staffName:", localStorage.getItem("staffName") || sessionStorage.getItem("staffName"));
    } else {
      console.log("No existing token found");
    }
    
    return () => {
      console.log("Component unmounting, clearing redirect timeout");
      if (redirectTimeout.current) {
        clearTimeout(redirectTimeout.current);
        console.log("Redirect timeout cleared");
      }
      console.groupEnd();
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    startTime.current = performance.now();
    console.group("🔐 [StaffLogin] Login Attempt");
    console.log("Timestamp:", new Date().toISOString());
    console.log("Email:", email);
    console.log("Remember Me:", rememberMe);
    console.log("Password length:", password ? password.length : 0);

    // Validation
    if (!email || !password) {
      console.warn("❌ Validation failed: missing email or password");
      toast.error("Please enter both email and password");
      console.groupEnd();
      return;
    }

    setLoading(true);
    console.log("Loading state set to true");

    try {
      const requestBody = { email, password };
      console.log("Request URL:", `${SERVERURL}/staff/login`);
      console.log("Request payload:", { email, password: "***" });
      console.log("Initiating fetch...");
      
      const fetchStart = performance.now();
      const response = await fetch(`${SERVERURL}/staff/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      const fetchEnd = performance.now();
      console.log(`⏱️ Fetch completed in ${(fetchEnd - fetchStart).toFixed(2)}ms`);
      
      console.log("Response status:", response.status, response.statusText);
      console.log("Response headers:");
      for (let [key, value] of response.headers.entries()) {
        console.log(`  ${key}: ${value}`);
      }
      
      // Clone response to log raw text and also parse JSON
      const responseClone = response.clone();
      const rawText = await responseClone.text();
      console.log("Raw response body (first 500 chars):", rawText.substring(0, 500));
      
      let data;
      try {
        data = JSON.parse(rawText);
        console.log("✅ Successfully parsed JSON response:", data);
      } catch (parseError) {
        console.error("❌ Failed to parse JSON. Raw response was not valid JSON.");
        console.error("Parse error:", parseError);
        throw new Error("Server returned invalid JSON. Check if backend route is correct.");
      }

      if (data.success) {
        console.log("🎉 Login successful!");
        console.log("User data:", {
          fullName: data.data.fullName,
          role: data.data.role,
          _id: data.data._id,
          district: data.data.district,
          tokenPreview: data.data.token ? data.data.token.substring(0, 20) + "..." : "missing"
        });
        
        const storage = rememberMe ? localStorage : sessionStorage;
        const storageType = rememberMe ? "localStorage" : "sessionStorage";
        console.log(`Storing auth data in ${storageType}`);
        
        try {
          storage.setItem("staffToken", data.data.token);
          storage.setItem("staffRole", data.data.role);
          storage.setItem("staffName", data.data.fullName);
          storage.setItem("staffId", data.data._id);
          if (data.data.district) storage.setItem("staffDistrict", data.data.district);
          
          // Verify storage
          const writtenToken = storage.getItem("staffToken");
          const writtenRole = storage.getItem("staffRole");
          console.log("Verification after write:");
          console.log("  - staffToken written:", !!writtenToken, "length:", writtenToken?.length);
          console.log("  - staffRole written:", writtenRole);
          console.log("  - staffName written:", storage.getItem("staffName"));
          console.log("  - staffId written:", storage.getItem("staffId"));
          
          if (!writtenToken || writtenToken !== data.data.token) {
            console.error("❌ Token write verification FAILED!");
          } else {
            console.log("✅ Token write verified");
          }
        } catch (storageError) {
          console.error("❌ Storage write failed:", storageError);
          toast.error("Could not save login data. Your browser may block local storage.");
          throw storageError;
        }
        
        toast.success(`Welcome, ${data.data.fullName}! Redirecting...`);
        
        console.log("Setting redirect timeout for /staff-dashboard (1000ms)");
        redirectTimeout.current = setTimeout(() => {
          console.log("⏰ Redirect timeout triggered, calling router.push('/staff-dashboard')");
          router.push("/staff-dashboard");
          console.log("Router push called");
        }, 1000);
      } else {
        console.warn("❌ Login failed - server returned success: false");
        console.warn("Message:", data.message || "Invalid credentials");
        console.warn("Full response data:", data);
        toast.error(data.message || "Invalid credentials");
      }
    } catch (error) {
      console.error("💥 Exception caught in login flow:");
      console.error("  - Name:", error.name);
      console.error("  - Message:", error.message);
      console.error("  - Stack:", error.stack);
      if (error.cause) console.error("  - Cause:", error.cause);
      
      if (error.message === "Failed to fetch") {
        console.error("Network error: Server unreachable or CORS issue");
        console.error("Check if backend is running at", SERVERURL);
        console.error("Try accessing", `${SERVERURL}/staff/login`, "manually in browser");
        toast.error("Cannot connect to server. Please check network or contact admin.");
      } else if (error.message.includes("JSON")) {
        console.error("JSON parse error - backend likely returned HTML or error page");
        toast.error("Server configuration error. Please contact admin.");
      } else {
        toast.error("Server error. Please try again later.");
      }
    } finally {
      setLoading(false);
      console.log("Loading state reset to false");
      if (startTime.current) {
        const duration = performance.now() - startTime.current;
        console.log(`⏱️ Total login flow duration: ${duration.toFixed(2)}ms`);
      }
      console.groupEnd();
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
                onError={(e) => {
                  console.warn("[StaffLogin] Logo image failed to load:", e.target.src);
                  e.target.style.display = "none";
                }}
              />
            </div>
            <h1 className="display-4 fw-bold mb-2">STAFF PORTAL</h1>
            <p className="lead mb-3">Employee Access Only</p>
            <div className="w-25 bg-white mx-auto my-3" style={{ height: "2px" }}></div>
            <p className="opacity-75">Secure internal dashboard for our team</p>
          </div>
        </div>

        {/* RIGHT SIDE – Staff Login Form */}
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
                    onError={(e) => {
                      console.warn("[StaffLogin] Logo image failed to load:", e.target.src);
                      e.target.style.display = "none";
                    }}
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
                      onChange={(e) => {
                        console.log("[StaffLogin] Email field changed to:", e.target.value);
                        setEmail(e.target.value);
                      }}
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
                      onChange={(e) => {
                        console.log("[StaffLogin] Password field changed (length:", e.target.value.length, ")");
                        setPassword(e.target.value);
                      }}
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
                      onChange={(e) => {
                        console.log("[StaffLogin] Remember me checkbox changed to:", e.target.checked);
                        setRememberMe(e.target.checked);
                      }}
                    />
                    <label className="form-check-label text-secondary" htmlFor="rememberStaff">
                      Keep me logged in
                    </label>
                  </div>
                  <button
                    type="button"
                    className="btn btn-link p-0 text-decoration-none text-primary"
                    onClick={() => {
                      console.log("[StaffLogin] Forgot password clicked");
                      toast.info("Contact admin to reset password");
                    }}
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
                  onClick={() => {
                    console.log("[StaffLogin] Back button clicked - calling router.back()");
                    router.back();
                  }}
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
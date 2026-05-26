"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import "./login.css";

export default function StaffLogin() {
  const router = useRouter();
  const [role, setRole] = useState("pharmacist");
  const [district, setDistrict] = useState("Ernakulam");

  const districts = [
    "Ernakulam",
    "Thiruvananthapuram",
    "Kozhikode",
    "Kollam",
    "Palakkad",
    "Thrissur",
    "Kannur",
  ];

  const handleLogin = () => {
    localStorage.setItem("staffRole", role);
    localStorage.setItem("staffDistrict", district);

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
  };

  return (
    <div className="staff-login-container">
      <div className="login-card">
        <div className="login-header">
          <i className="bi bi-person-badge"></i>
          <h2>Staff Login</h2>
          <p className="text-muted">Access your work portal</p>
        </div>

        <div className="login-form">
          <div className="input-group">
            <label>Role</label>
            <select
              className="form-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="pharmacist">Pharmacist</option>
              <option value="delivery-head">Delivery Head</option>
              <option value="delivery-boy">Delivery Boy</option>
            </select>
          </div>

          <div className="input-group">
            <label>District</label>
            <select
              className="form-select"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
            >
              {districts.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>

          <button className="login-btn" onClick={handleLogin}>
            <i className="bi bi-box-arrow-in-right"></i> Login
          </button>
        </div>
      </div>
    </div>
  );
}
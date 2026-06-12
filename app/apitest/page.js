"use client";

import { useState, useEffect } from "react";

export default function ApiTestPage() {
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const res = await fetch("/api/proxy-shops", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "medisoftapiuser",
            password: "xUs8$p-#!N",
          }),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setApiData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchShops();
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>📡 API Test – Fixed Proxy (GET with body)</h1>
      {loading && <p>⏳ Loading...</p>}
      {error && <p style={{ color: "red" }}>❌ {error}</p>}
      {apiData && <pre>{JSON.stringify(apiData, null, 2)}</pre>}
    </div>
  );
}
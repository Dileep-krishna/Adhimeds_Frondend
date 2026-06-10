fetch("https://api.medisoft.in/adhapi/shops/getshopslist", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    username: "your_username",
    password: "your_password"
  })
})
.then(res => {
  console.log("Response received");
  console.log("Status:", res.status);
  console.log("Status Text:", res.statusText);
  console.log("Headers:", [...res.headers.entries()]);
  console.log("Response type:", res.type);
  console.log("Response URL:", res.url);
  console.log("Response redirected:", res.redirected);
  
  // Clone the response to avoid consuming it before logging
  const clonedRes = res.clone();
  
  // Log raw text first
  return clonedRes.text().then(text => {
    console.log("Raw response text:", text);
    console.log("Raw response length:", text.length);
    
    // Try to parse JSON
    try {
      const jsonData = JSON.parse(text);
      console.log("Parsed JSON data:", jsonData);
      console.log("Data type:", typeof jsonData);
      console.log("Is array:", Array.isArray(jsonData));
      if (jsonData && typeof jsonData === 'object') {
        console.log("Object keys:", Object.keys(jsonData));
      }
      return jsonData;
    } catch (e) {
      console.error("Failed to parse JSON:", e.message);
      console.error("Response text was not valid JSON. Full text:", text);
      throw new Error("Invalid JSON response from server");
    }
  });
})
.then(data => {
  console.log("✅ Final processed data:", data);
  console.log("Data stringified:", JSON.stringify(data, null, 2));
  return data;
})
.catch(error => {
  console.error("❌ Fetch error occurred:", error);
  console.error("Error name:", error.name);
  console.error("Error message:", error.message);
  console.error("Error stack:", error.stack);
  
  if (error.cause) {
    console.error("Error cause:", error.cause);
  }
  
  // Additional network error details
  console.error("Network error - check if:");
  console.error("1. URL is correct:", "https://api.medisoft.in/adhapi/shops/getshopslist");
  console.error("2. CORS is properly configured on server");
  console.error("3. API endpoint is accessible");
  console.error("4. Username/password are correct");
  
  throw error; // Re-throw to allow further handling
});
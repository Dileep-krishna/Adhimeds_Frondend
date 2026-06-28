// ✅ Automatically switches based on environment
const SERVERURL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default SERVERURL;
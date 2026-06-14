import StoreAppSidebar from "./components/StoreAppSidebar";
import "./components/StoreAppSidebar";

export default function StoreLayout({ children }) {
  return (
    <div className="store-layout-container">
      <StoreAppSidebar />
      <main className="store-main-content">{children}</main>
    </div>
  );
}
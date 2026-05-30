'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './product-management.css';

export default function ProductManagementPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('all-products');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuStructure = [
 {
  title: 'PRODUCTS',
  items: [
    { id: 'all-products', label: 'All products', icon: 'bi-grid-3x3-gap-fill', desc: 'View, search and manage your entire product line.' },
    { id: 'inhouse', label: 'Inhouse Products', icon: 'bi-house-door-fill', desc: 'Manage products of your own.' },
    { id: 'seller', label: 'Seller Products', icon: 'bi-people-fill', desc: 'Oversee items listed by your sellers.' },
    { id: 'add-physical', label: 'Add New Physical Products', icon: 'bi-plus-circle-fill', desc: 'Create listings for physical products that require shipping.' },
    { 
      id: 'add-digital', 
      label: 'Add New Digital Products', 
      icon: 'bi-cloud-download-fill', 
      desc: 'Create downloadable products for instant delivery.',
      path: '/super-admin/product-managment/add-digital-product'   // ✅ navigation path
    },
  ],
},
    {
      title: 'PRODUCT SETUP',
      items: [
        { 
          id: 'category', 
          label: 'Category', 
          icon: 'bi-folder-tree', 
          desc: 'Organize your products into hierarchical groups.',
          path: '/super-admin/category-managment'   // ✅ navigation path
        },
        { id: 'brand', label: 'Brand', icon: 'bi-tag-fill', desc: 'Define and manage manufacturer or brand names.' },
        { id: 'units', label: 'Units', icon: 'bi-rulers', desc: 'Specify measurement standards.' },
        { id: 'colors', label: 'Colors', icon: 'bi-palette-fill', desc: 'Create or enable color variations.' },
        { id: 'attributes', label: 'Attributes', icon: 'bi-sliders2', desc: 'Define custom product properties.' },
        { id: 'size-guide', label: 'Size Guide', icon: 'bi-arrows-fullscreen', desc: 'Build measurement charts to help customers.' },
        { id: 'warranty', label: 'Warranty', icon: 'bi-shield-shaded', desc: 'Set up protection plans and guarantee terms.' },
        { id: 'notes', label: 'Notes', icon: 'bi-sticky-fill', desc: 'Add preset instructions for customers to show in website.' },
      ],
    },
    {
      title: 'PRODUCT OPERATION',
      items: [
        { id: 'reviews', label: 'Product Reviews', icon: 'bi-star-fill', desc: 'Manage customer ratings & feedbacks.' },
        { id: 'smart-bar', label: 'Smart Bar', icon: 'bi-layout-three-columns', desc: 'Configure product details bar across description page.' },
        { id: 'custom-label', label: 'Custom Label', icon: 'bi-tags-fill', desc: 'Design and assign special badges to product box.' },
      ],
    },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'all-products': return <AllProducts />;
      case 'inhouse': return <InhouseProducts />;
      case 'seller': return <SellerProducts />;
      case 'add-physical': return <AddPhysicalProduct />;
      case 'add-digital': return <AddDigitalProduct />;
      default: return <SetupPanel section={activeSection} />;
    }
  };

  const handleImportBulk = () => {
    alert('Import Bulk Product - Connect to your API');
  };
  const handleExportBulk = () => {
    alert('Export Bulk Product - Generate CSV/Excel');
  };
  const handleAddProduct = () => {
    router.push('/super-admin/product-managment/add-product');
  };

  return (
    <div className="d-flex">
      {/* Mobile toggle button */}
      <button
        className="btn btn-light mobile-toggle shadow-sm rounded-circle p-2"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <i className={`bi ${sidebarOpen ? 'bi-x-lg' : 'bi-list'}`} style={{ fontSize: '1.5rem' }}></i>
      </button>

      {/* Sidebar */}
      <div className={`product-sidebar ${sidebarOpen ? 'show' : ''}`}>
        <div className="sidebar-header">
          <h5>Product Management</h5>
          <p>Create, setup and manage all your products</p>
        </div>
        {menuStructure.map((section) => (
          <div key={section.title}>
            <div className="sidebar-section-title">{section.title}</div>
            <div className="sidebar-nav">
              {section.items.map((item) => (
                <button
                  key={item.id}
                  className={`nav-link w-100 text-start ${activeSection === item.id ? 'active' : ''}`}
                  onClick={() => {
                    // ✅ If item has a path, navigate; otherwise stay in page
                    if (item.path) {
                      router.push(item.path);
                    } else {
                      setActiveSection(item.id);
                      setSidebarOpen(false);
                    }
                  }}
                  title={item.desc}
                >
                  <i className={`bi ${item.icon}`}></i>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="product-main">
        <div className="container-fluid px-0">
          {/* Action Buttons Row */}
          <div className="d-flex justify-content-end gap-2 mb-4">
            <button className="btn btn-outline-primary" onClick={handleImportBulk}>
              <i className="bi bi-upload me-1"></i> Import Bulk Product
            </button>
            <button className="btn btn-outline-success" onClick={handleExportBulk}>
              <i className="bi bi-download me-1"></i> Export Bulk Product
            </button>
            <button className="btn btn-primary" onClick={handleAddProduct}>
              <i className="bi bi-plus-circle me-1"></i> Add Product
            </button>
          </div>

          {renderContent()}
        </div>
      </div>
    </div>
  );
}

// ---------- Content components (unchanged) ----------
function AllProducts() {
  const products = [
    { id: 1, name: 'Wireless Headphones', price: 49.99, stock: 120, status: 'Active' },
    { id: 2, name: 'Smart Watch', price: 199.99, stock: 45, status: 'Active' },
    { id: 3, name: 'USB-C Cable', price: 9.99, stock: 500, status: 'Inactive' },
  ];
  return (
    <>
      <h3 className="fw-bold mb-4">All Products</h3>
      <div className="card card-custom">
        <div className="table-responsive">
          <table className="table table-custom align-middle mb-0">
            <thead>
              <tr><th>Name</th><th>Price</th><th>Stock</th><th>Status</th></tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td className="fw-medium">{p.name}</td>
                  <td>${p.price}</td>
                  <td>{p.stock}</td>
                  <td><span className={`badge-status ${p.status === 'Active' ? 'badge-active' : 'badge-inactive'}`}>{p.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function InhouseProducts() {
  return <><h3 className="fw-bold mb-4">Inhouse Products</h3><div className="card card-custom p-5 text-center text-secondary">Manage your own products here. (Demo content)</div></>;
}
function SellerProducts() {
  return <><h3 className="fw-bold mb-4">Seller Products</h3><div className="card card-custom p-5 text-center text-secondary">Oversee items listed by your sellers. (Demo content)</div></>;
}
function AddPhysicalProduct() {
  return (
    <>
      <h3 className="fw-bold mb-4">Add New Physical Product</h3>
      <div className="card card-custom p-4">
        <form>
          <div className="mb-3"><label className="form-label">Product Name</label><input type="text" className="form-control" /></div>
          <div className="mb-3"><label className="form-label">Price</label><input type="text" className="form-control" /></div>
          <div className="mb-3"><label className="form-label">Description</label><textarea rows="3" className="form-control"></textarea></div>
          <button className="btn btn-primary">Create Product</button>
        </form>
      </div>
    </>
  );
}
function AddDigitalProduct() {
  return (
    <>
      <h3 className="fw-bold mb-4">Add New Digital Product</h3>
      <div className="card card-custom p-4">
        <form>
          <div className="mb-3"><label className="form-label">Product Name</label><input type="text" className="form-control" /></div>
          <div className="mb-3"><label className="form-label">File Upload</label><input type="file" className="form-control" /></div>
          <button className="btn btn-primary">Create Digital Product</button>
        </form>
      </div>
    </>
  );
}
function SetupPanel({ section }) {
  const titles = {
    category: 'Category', brand: 'Brand', units: 'Units', colors: 'Colors',
    attributes: 'Attributes', 'size-guide': 'Size Guide', warranty: 'Warranty',
    notes: 'Notes', reviews: 'Product Reviews', 'smart-bar': 'Smart Bar',
    'custom-label': 'Custom Label',
  };
  return (
    <>
      <h3 className="fw-bold mb-4">{titles[section] || 'Setup'}</h3>
      <div className="card card-custom p-5 text-center text-secondary">
        Configure {titles[section] || 'this section'} here. (Demo)
      </div>
    </>
  );
}
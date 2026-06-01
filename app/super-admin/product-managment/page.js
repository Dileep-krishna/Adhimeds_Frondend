'use client';

import { useRouter } from 'next/navigation';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './product-management.css';

export default function ProductManagementPage() {
  const router = useRouter();

  const handleImportBulk = () => {
    alert('Import Bulk Product - Connect to your API');
  };
  const handleExportBulk = () => {
    alert('Export Bulk Product - Generate CSV/Excel');
  };
  const handleAddProduct = () => {
    router.push('/super-admin/product-managment/products/add-product');
  };

  // Complete menu structure matching the screenshot
  const menuSections = [
    {
      title: 'PRODUCTS',
      items: [
        { id: 'all-products', label: 'All products', icon: 'bi-grid-3x3-gap-fill', desc: 'View, search and manage your entire product line.', path: '/super-admin/product-managment/products/all-product' },
        { id: 'inhouse', label: 'Inhouse Products', icon: 'bi-house-door-fill', desc: 'Manage products of your own.', path: '/super-admin/product-managment/inhouse-product' },
        { id: 'seller', label: 'Seller Products', icon: 'bi-people-fill', desc: 'Oversee items listed by your sellers.', path: '/super-admin/product-managment/all-seller-product' },
        { id: 'add-physical', label: 'Add New Physical Products', icon: 'bi-plus-circle-fill', desc: 'Create listings for physical products that require shipping.', path: '/super-admin/product-managment/products/add-product' },

      ],
    },
    {
      title: 'PRODUCT SETUP',
      items: [
        { id: 'category', label: 'Category', icon: 'bi-folder-tree', desc: 'Organize your products into hierarchical groups.', path: '/super-admin/product-managment/product-setup/category' },
        { id: 'brand', label: 'Brand', icon: 'bi-tag-fill', desc: 'Define and manage manufacturer or brand names.', path: '/super-admin/product-managment/product-setup/Brand' },

        { id: 'attributes', label: 'Attributes', icon: 'bi-sliders2', desc: 'Define custom product properties.', path: '/super-admin/product-managment/product-setup/Attribute' },
        { id: 'size-guide', label: 'Size Guide', icon: 'bi-arrows-fullscreen', desc: 'Build measurement charts to help customers.', path: '/super-admin/product-managment/product-setup/size-guide/size-chart' },
        { id: 'warranty', label: 'Warranty', icon: 'bi-shield-shaded', desc: 'Set up protection plans and guarantee terms.', path: '/super-admin/product-managment/product-setup/warranty' },
        { id: 'notes', label: 'Notes', icon: 'bi-sticky-fill', desc: 'Add preset instructions for customers to show in website.', path: '/super-admin/product-managment/product-setup/notes' },
      ],
    },
    {
      title: 'PRODUCT OPERATION',
      items: [
        { id: 'reviews', label: 'Product Reviews', icon: 'bi-star-fill', desc: 'Manage customer ratings & feedback.', path: '/super-admin/product-managment/product-operation/product-review' },

        { id: 'custom-label', label: 'Custom Label', icon: 'bi-tags', desc: 'Design and assign special badges to product box.', path: '/super-admin/product-managment/product-operation/custom-label' },
      ],
    },
  ];

  return (
    <div className="product-management-dashboard">
      <div className="container-fluid px-4 py-3">
        {/* Action Buttons Row */}
        <div className="d-flex justify-content-end gap-3 mb-4">
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

        {/* Card Sections */}
        {menuSections.map((section) => (
          <div key={section.title} className="mb-5">
            <h5 className="section-title mb-3">{section.title}</h5>
            <div className="row g-4">
              {section.items.map((item) => (
                <div key={item.id} className="col-md-6 col-lg-4 col-xl-3">
                  <div className="card product-card h-100">
                    <div className="card-body">
                      <div className="card-icon mb-3">
                        <i className={`bi ${item.icon}`}></i>
                      </div>
                      <h6 className="card-title fw-bold">{item.label}</h6>
                      <p className="card-text text-muted small">{item.desc}</p>
                      <button
                        className="btn btn-sm btn-outline-success mt-2"
                        onClick={() => router.push(item.path)}
                      >
                        Manage →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ========== KEEP ALL ORIGINAL COMPONENTS BELOW (unchanged) ==========
// (AllProducts, InhouseProducts, SellerProducts, AddPhysicalProduct, AddDigitalProduct, SetupPanel)
// They are not used in this new layout, but we keep them to avoid breaking any imports.

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
            <thead><tr><th>Name</th><th>Price</th><th>Stock</th><th>Status</th></tr></thead>
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
    category: 'Category', brand: 'Brand', 
    attributes: 'Attributes', 'size-guide': 'Size Guide', warranty: 'Warranty',
    notes: 'Notes', reviews: 'Product Reviews', 
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
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import './custom-review.css';
import { getCategoriesAPI } from '../../../../../services/categoryAPI';
import { createCustomReviewAPI } from '../../../../../services/customReviewService';
import { getProductsAPI } from '../../../../../services/productService';

export default function AddCustomReviewPage() {
  const router = useRouter();

  const [reviewerName, setReviewerName] = useState('');
  const [reviewerImage, setReviewerImage] = useState(null);
  const [reviewerImagePreview, setReviewerImagePreview] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [rating, setRating] = useState(5);
  const [dateOption, setDateOption] = useState('system');
  const [manualDate, setManualDate] = useState('');
  const [comment, setComment] = useState('');
  const [reviewImages, setReviewImages] = useState([]);
  const [reviewImagePreviews, setReviewImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getCategoriesAPI();
        console.log("📦 Categories API response:", res);
        if (res.success && res.data) {
          setCategories(res.data);
          console.log("✅ Categories set:", res.data);
          if (res.data.length) setSelectedCategory(res.data[0]._id || res.data[0].id);
        } else {
          toast.error(res.message || 'Failed to load categories');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Server error while loading categories');
      }
    };
    fetchCategories();
  }, []);

  // Fetch products when category changes
  useEffect(() => {
    if (!selectedCategory || categories.length === 0) return;

    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const selectedCatObj = categories.find(cat => (cat._id || cat.id) === selectedCategory);
        if (!selectedCatObj) throw new Error("Category not found");

        const categoryName = selectedCatObj.name;
        const query = `category=${encodeURIComponent(categoryName)}`;
        console.log(`🔍 Fetching products for category: "${categoryName}" (query: ${query})`);
        const res = await getProductsAPI(query);
        console.log("📦 Products API response:", res);

        if (res.success && Array.isArray(res.data)) {
          console.log("✅ Products fetched:", res.data);
          setProducts(res.data);
          if (res.data.length > 0) {
            const firstId = res.data[0]._id;
            console.log("✅ Setting selectedProduct to:", firstId);
            setSelectedProduct(firstId);
          } else {
            setSelectedProduct("");
          }
        } else {
          toast.error(res.message || "Failed to load products");
        }
      } catch (err) {
        console.error(err);
        toast.error("Error loading products");
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, categories]);

  const handleReviewerImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReviewerImage(file);
      setReviewerImagePreview(URL.createObjectURL(file));
    }
  };

  const handleReviewImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setReviewImages(files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setReviewImagePreviews(previews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reviewerName.trim()) {
      toast.error('Reviewer name is required');
      return;
    }
    if (!selectedProduct) {
      toast.error('Please select a product');
      return;
    }
    if (!comment.trim()) {
      toast.error('Comment is required');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('reviewerName', reviewerName);
      if (reviewerImage) formData.append('reviewerImage', reviewerImage);
      formData.append('categoryId', selectedCategory);
      formData.append('productId', selectedProduct);
      formData.append('rating', rating);
      formData.append('dateOption', dateOption);
      if (dateOption === 'manual') formData.append('reviewDate', manualDate);
      formData.append('comment', comment);
      reviewImages.forEach((img) => formData.append('newImages', img));

      const res = await createCustomReviewAPI(formData);
      if (res.success) {
        toast.success('Custom review added successfully');
        router.push('/super-admin/product-managment/product-operation/product-review');
      } else {
        toast.error(res.message || 'Failed to add review');
      }
    } catch (error) {
      console.error(error);
      toast.error('Server error');
    } finally {
      setLoading(false);
    }
  };

  const renderRatingStars = () => (
    <div className="rating-stars">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`star-btn ${star <= rating ? 'active' : ''}`}
          onClick={() => setRating(star)}
        >
          ★
        </button>
      ))}
    </div>
  );

  console.log("🔄 Rendering – products:", products);
  console.log("🔄 Rendering – selectedProduct:", selectedProduct);

  return (
    <div className="custom-review-page">
      <Toaster position="top-right" />
      <div className="container py-4">
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white border-0 pt-4 pb-0">
            <h3 className="mb-0">
              <i className="bi bi-star-fill text-warning me-2"></i>
              Add New Custom Review
            </h3>
            <hr className="mt-3" />
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="form-label fw-semibold">Custom Reviewer Name <span className="text-danger">*</span></label>
                <input type="text" className="form-control" value={reviewerName} onChange={(e) => setReviewerName(e.target.value)} placeholder="e.g., John Doe" required />
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold">Custom Reviewer Image</label>
                <input type="file" className="form-control" accept="image/*" onChange={handleReviewerImageChange} />
                {reviewerImagePreview ? (
                  <div className="mt-2">
                    <img src={reviewerImagePreview} alt="Reviewer preview" width={80} height={80} style={{ objectFit: 'cover', borderRadius: '50%' }} />
                  </div>
                ) : (
                  <div className="mt-2 text-muted small"><i className="bi bi-person-circle me-1"></i> If you do not use custom reviewer's image it will show default user image.</div>
                )}
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold">Category</label>
                <select className="form-select" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                  {categories.map((cat) => (
                    <option key={cat._id || cat.id} value={cat._id || cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold">Product <span className="text-danger">*</span></label>
                <select
                  className="form-select"
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  required
                  disabled={loadingProducts}
                >
                  <option value="">{loadingProducts ? 'Loading products...' : 'Select Product'}</option>
                  {products.map((prod) => {
                    console.log("🔧 Rendering option for product:", prod.productName);  // ✅ FIXED: use productName
                    return (
                      <option key={prod._id} value={prod._id}>
                        {prod.productName}
                      </option>
                    );
                  })}
                </select>
                {!loadingProducts && products.length === 0 && selectedCategory && (
                  <div className="text-warning small mt-1">No products found in this category</div>
                )}
                <div className="form-text">Select Product for Custom Review</div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold">Rating *</label>
                {renderRatingStars()}
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold">Date</label>
                <div className="d-flex gap-4 mb-2">
                  <div className="form-check">
                    <input type="radio" className="form-check-input" id="systemDate" name="dateOption" value="system" checked={dateOption === 'system'} onChange={() => setDateOption('system')} />
                    <label className="form-check-label" htmlFor="systemDate">System Date</label>
                  </div>
                  <div className="form-check">
                    <input type="radio" className="form-check-input" id="manualDate" name="dateOption" value="manual" checked={dateOption === 'manual'} onChange={() => setDateOption('manual')} />
                    <label className="form-check-label" htmlFor="manualDate">Select</label>
                  </div>
                </div>
                {dateOption === 'manual' && (
                  <input type="date" className="form-control w-auto" value={manualDate} onChange={(e) => setManualDate(e.target.value)} />
                )}
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold">Comment *</label>
                <textarea className="form-control" rows="4" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Your review" required />
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold">Review Images</label>
                <input type="file" className="form-control" accept="image/*" multiple onChange={handleReviewImagesChange} />
                {reviewImagePreviews.length > 0 && (
                  <div className="mt-3 d-flex flex-wrap gap-3">
                    {reviewImagePreviews.map((src, idx) => (
                      <img key={idx} src={src} alt={`Preview ${idx + 1}`} width={100} height={100} style={{ objectFit: 'cover', borderRadius: '0.25rem', border: '1px solid #dee2e6' }} />
                    ))}
                  </div>
                )}
                <div className="form-text mt-2">These images are visible in product review page gallery. Upload square images.</div>
              </div>

              <div className="d-flex justify-content-end">
                <button type="submit" className="btn btn-primary px-5 py-2 rounded-pill" disabled={loading}>
                  {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</> : <><i className="bi bi-save me-2"></i> Save</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-review-page {
          background-color: #f8fafc;
          min-height: 100vh;
        }
        .rating-stars { display: flex; gap: 0.5rem; }
        .star-btn { background: none; border: none; font-size: 2rem; cursor: pointer; color: #cbd5e1; transition: color 0.2s; padding: 0; line-height: 1; }
        .star-btn.active { color: #fbbf24; }
        .star-btn:hover { color: #f59e0b; }
        .form-label { font-weight: 600; margin-bottom: 0.5rem; }
        .card { border-radius: 1rem; }
      `}</style>
    </div>
  );
}
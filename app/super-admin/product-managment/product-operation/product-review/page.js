'use client';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './review.css';

export default function ProductReviewsPage() {
  // ---------- Sample Medical Products ----------
  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'Paracetamol 500mg Tablets',
      owner: 'Adhimeds (In-House)',
      rating: 4.5,
      reviews: [
        { id: 1, reviewer: 'Rajesh K.', rating: 5, comment: 'Effective for fever. Works fast.', date: '2024-12-10', images: [] },
        { id: 2, reviewer: 'Priya S.', rating: 4, comment: 'Good quality, but a bit bitter.', date: '2024-12-05', images: [] },
      ],
      customReviewsCount: 0,
    },
    {
      id: 2,
      name: 'Omron BP Monitor (Upper Arm)',
      owner: 'Omron Healthcare',
      rating: 4.8,
      reviews: [
        { id: 3, reviewer: 'Dr. Anil M.', rating: 5, comment: 'Accurate readings, easy to use.', date: '2024-12-08', images: [] },
      ],
      customReviewsCount: 0,
    },
    {
      id: 3,
      name: 'Vitamin D3 2000IU Capsules',
      owner: 'Sun Pharma',
      rating: 4.2,
      reviews: [
        { id: 4, reviewer: 'Neha G.', rating: 4, comment: 'Good supplement, no side effects.', date: '2024-12-01', images: [] },
      ],
      customReviewsCount: 0,
    },
    {
      id: 4,
      name: 'Digital Thermometer (Dr. Trust)',
      owner: 'Dr. Trust',
      rating: 4.6,
      reviews: [
        { id: 5, reviewer: 'Suresh P.', rating: 5, comment: 'Fast reading, backlight helpful.', date: '2024-11-28', images: [] },
      ],
      customReviewsCount: 0,
    },
  ]);

  // ---------- State for Modals ----------
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSideModal, setShowSideModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // ---------- Add Custom Review Form State ----------
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerImage, setReviewerImage] = useState(null);
  const [reviewerImagePreview, setReviewerImagePreview] = useState(null);
  const [category, setCategory] = useState('');
  const [productId, setProductId] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewDate, setReviewDate] = useState('');
  const [comment, setComment] = useState('');
  const [reviewImages, setReviewImages] = useState([]);
  const [reviewImagePreviews, setReviewImagePreviews] = useState([]);

  // Categories & filtered products for modal
  const categories = ['Medicine', 'Equipment', 'Supplements', 'Ayurveda'];
  const productsByCategory = useMemo(() => {
    if (!category) return [];
    // Mock mapping – in real app, filter based on product.category
    return products.filter(p => {
      if (category === 'Medicine') return p.name.includes('Paracetamol');
      if (category === 'Equipment') return p.name.includes('BP Monitor') || p.name.includes('Thermometer');
      if (category === 'Supplements') return p.name.includes('Vitamin D3');
      return false;
    });
  }, [category, products]);

  // ---------- Add Custom Review Save ----------
  const handleAddCustomReview = () => {
    if (!reviewerName.trim()) return alert('Reviewer name is required');
    if (!category) return alert('Select a category');
    if (!productId) return alert('Select a product');
    if (!comment.trim()) return alert('Write a review comment');
    const selectedProd = products.find(p => p.id === parseInt(productId));
    if (!selectedProd) return;

    const newReview = {
      id: Date.now(),
      reviewer: reviewerName,
      rating: rating,
      comment: comment,
      date: reviewDate || new Date().toISOString().split('T')[0],
      images: reviewImagePreviews, // store preview URLs (mock)
      isCustom: true,
    };

    // Update product
    const updatedProducts = products.map(p => {
      if (p.id === selectedProd.id) {
        const newReviews = [...p.reviews, newReview];
        const totalRating = newReviews.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = totalRating / newReviews.length;
        return {
          ...p,
          rating: parseFloat(avgRating.toFixed(1)),
          reviews: newReviews,
          customReviewsCount: p.customReviewsCount + 1,
        };
      }
      return p;
    });
    setProducts(updatedProducts);
    resetAddModal();
    setShowAddModal(false);
    alert('Custom review added successfully');
  };

  const resetAddModal = () => {
    setReviewerName('');
    setReviewerImage(null);
    setReviewerImagePreview(null);
    setCategory('');
    setProductId('');
    setRating(5);
    setReviewDate('');
    setComment('');
    setReviewImages([]);
    setReviewImagePreviews([]);
  };

  // Image handlers
  const handleReviewerImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReviewerImage(file);
      setReviewerImagePreview(URL.createObjectURL(file));
    }
  };
  const handleReviewImages = (e) => {
    const files = Array.from(e.target.files);
    setReviewImages(files);
    const previews = files.map(f => URL.createObjectURL(f));
    setReviewImagePreviews(previews);
  };

  // Delete custom review (bonus feature)
  const deleteReview = (productId, reviewId) => {
    if (confirm('Delete this review?')) {
      const updatedProducts = products.map(p => {
        if (p.id === productId) {
          const newReviews = p.reviews.filter(r => r.id !== reviewId);
          const totalRating = newReviews.reduce((sum, r) => sum + r.rating, 0);
          const avgRating = newReviews.length ? totalRating / newReviews.length : 0;
          return {
            ...p,
            reviews: newReviews,
            rating: parseFloat(avgRating.toFixed(1)),
            customReviewsCount: p.customReviewsCount - 1,
          };
        }
        return p;
      });
      setProducts(updatedProducts);
    }
  };

  return (
    <div className="reviews-container">
      <div className="header-actions">
        <h4 className="page-title">All Rating & Reviews</h4>
        <button className="btn-add" onClick={() => setShowAddModal(true)}>
          <i className="bi bi-plus-circle me-1"></i> Add Custom Reviews
        </button>
      </div>

      <div className="table-responsive">
        <table className="med-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Product Name</th>
              <th>Product Owner</th>
              <th>Rating</th>
              <th>Reviews</th>
              <th>Custom Reviews</th>
              <th>Options</th>
            </tr>
          </thead>
          <tbody>
            {products.map((prod, idx) => (
              <tr key={prod.id}>
                <td>{idx + 1}</td>
                <td><strong>{prod.name}</strong></td>
                <td>{prod.owner}</td>
                <td>
                  <div className="stars">{'★'.repeat(Math.floor(prod.rating))}{'☆'.repeat(5 - Math.floor(prod.rating))}</div>
                  <span>{prod.rating} out of 5</span>
                </td>
                <td>{prod.reviews.length} {prod.reviews.length === 1 ? 'review' : 'reviews'}</td>
                <td>{prod.customReviewsCount} </td>
                <td>
                  <button className="btn-view" onClick={() => { setSelectedProduct(prod); setShowSideModal(true); }}>
                    View Reviews
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ADD CUSTOM REVIEW MODAL (second screenshot) */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="modal-container modal-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h5>Add New Custom Review</h5>
                <button className="close-modal" onClick={() => setShowAddModal(false)}>×</button>
              </div>
              <div className="modal-body">
                {/* Custom Reviewer Name */}
                <div className="form-group">
                  <label>Custom Reviewer Name *</label>
                  <input type="text" className="form-control" value={reviewerName} onChange={(e) => setReviewerName(e.target.value)} />
                </div>
                {/* Custom Reviewer Image */}
                <div className="form-group">
                  <label>Custom Reviewer Image</label>
                  <input type="file" className="form-control" accept="image/*" onChange={handleReviewerImage} />
                  <small className="text-muted">If you do not use custom reviewer's image it will show default user image.</small>
                  {reviewerImagePreview && <img src={reviewerImagePreview} className="preview-img mt-2" width="60" alt="preview" />}
                </div>
                {/* Category */}
                <div className="form-group">
                  <label>Category *</label>
                  <select className="form-select" value={category} onChange={(e) => { setCategory(e.target.value); setProductId(''); }}>
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                {/* Product (depends on category) */}
                <div className="form-group">
                  <label>Product *</label>
                  <select className="form-select" value={productId} onChange={(e) => setProductId(e.target.value)} disabled={!category}>
                    <option value="">{category ? 'Select Product' : 'Please select category first'}</option>
                    {productsByCategory.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                {/* Rating Stars */}
                <div className="form-group">
                  <label>Rating *</label>
                  <div className="star-selector">
                    {[1,2,3,4,5].map(star => (
                      <i key={star} className={`bi bi-star${star <= rating ? '-fill' : ''} star-icon`} onClick={() => setRating(star)}></i>
                    ))}
                  </div>
                </div>
                {/* Date */}
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" className="form-control" value={reviewDate} onChange={(e) => setReviewDate(e.target.value)} />
                </div>
                {/* Comment */}
                <div className="form-group">
                  <label>Comment *</label>
                  <textarea className="form-control" rows="3" value={comment} onChange={(e) => setComment(e.target.value)}></textarea>
                </div>
                {/* Review Images */}
                <div className="form-group">
                  <label>Review Images</label>
                  <input type="file" className="form-control" multiple accept="image/*" onChange={handleReviewImages} />
                  <small className="text-muted">These images are visible in product review page gallery. Upload square images.</small>
                  <div className="image-previews mt-2">
                    {reviewImagePreviews.map((src, i) => (
                      <img key={i} src={src} alt="preview" className="preview-img me-2" width="60" />
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-cancel" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button className="btn-save" onClick={handleAddCustomReview}>Save</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SIDE MODAL for Product Details & Reviews */}
      <AnimatePresence>
        {showSideModal && selectedProduct && (
          <>
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="side-modal"
            >
              <div className="side-modal-header">
                <h5>Product Reviews</h5>
                <button className="close-modal" onClick={() => setShowSideModal(false)}>×</button>
              </div>
              <div className="side-modal-body">
                <div className="product-info">
                  <h6>{selectedProduct.name}</h6>
                  <p><strong>Owner:</strong> {selectedProduct.owner}</p>
                  <p><strong>Overall Rating:</strong> {selectedProduct.rating} ⭐ ({selectedProduct.reviews.length} reviews)</p>
                </div>
                <div className="reviews-list">
                  <h6>Customer Reviews</h6>
                  {selectedProduct.reviews.length === 0 && <p className="text-muted">No reviews yet.</p>}
                  {selectedProduct.reviews.map((review, idx) => (
                    <div key={review.id} className="review-card">
                      <div className="review-header">
                        <strong>{review.reviewer}</strong>
                        <div className="stars">{'★'.repeat(review.rating)}{'☆'.repeat(5-review.rating)}</div>
                        <small className="text-muted">{review.date}</small>
                        {review.isCustom && <span className="badge-custom ms-2">Custom</span>}
                        <button className="btn-icon delete ms-auto" onClick={() => deleteReview(selectedProduct.id, review.id)}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                      <p className="review-comment">{review.comment}</p>
                      {review.images && review.images.length > 0 && (
                        <div className="review-images">
                          {review.images.map((img, i) => <img key={i} src={img} alt="review" width="60" className="me-1" />)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
            <div className="side-overlay" onClick={() => setShowSideModal(false)} />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getAllCustomReviewsAPI } from '@/app/services/customReviewService';
import { getProductsAPI } from '@/app/services/productService';


export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const [productsRes, reviewsRes] = await Promise.all([
        getProductsAPI(),
        getAllCustomReviewsAPI(),
      ]);
      if (!productsRes.success) throw new Error(productsRes.message);

      const allReviews = reviewsRes.success ? reviewsRes.data : [];
      const reviewsByProduct = {};
      allReviews.forEach(review => {
        const pid = review.productId?._id || review.productId;
        if (!reviewsByProduct[pid]) reviewsByProduct[pid] = [];
        reviewsByProduct[pid].push(review);
      });

      const productsWithRating = productsRes.data.map(product => {
        const productReviews = reviewsByProduct[product._id] || [];
        const totalRating = productReviews.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = productReviews.length
          ? parseFloat((totalRating / productReviews.length).toFixed(1))
          : 0;
        return { ...product, avgRating, reviewCount: productReviews.length };
      });

      setProducts(productsWithRating);
    } catch (error) {
      console.error(error);
      toast.error('Server error while loading products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, fetchProducts };
}
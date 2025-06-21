import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import useStore from '../store/useStore';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';

// Mock product data
const mockProducts = [
  {
    id: 1,
    name: 'Wireless Earbuds',
    price: 59.99,
    originalPrice: 79.99,
    category: 'Electronics',
    brand: 'TechTrend',
    image: 'https://via.placeholder.com/300',
    rating: 4.5,
    reviews: 120,
    description: 'High-quality wireless earbuds with noise cancellation.',
  },
  {
    id: 2,
    name: 'Running Shoes',
    price: 89.99,
    originalPrice: 99.99,
    category: 'Fashion',
    brand: 'SportyFit',
    image: 'https://via.placeholder.com/300',
    rating: 4.0,
    reviews: 85,
    description: 'Comfortable running shoes for all terrains.',
  },
  {
    id: 3,
    name: 'Smart Watch',
    price: 199.99,
    originalPrice: 249.99,
    category: 'Electronics',
    brand: 'TechTrend',
    image: 'https://via.placeholder.com/300',
    rating: 4.8,
    reviews: 200,
    description: 'Advanced smart watch with fitness tracking.',
  },
  {
    id: 4,
    name: 'Backpack',
    price: 49.99,
    originalPrice: 59.99,
    category: 'Accessories',
    brand: 'TravelEase',
    image: 'https://via.placeholder.com/300',
    rating: 4.2,
    reviews: 65,
    description: 'Durable backpack for daily use.',
  },
];

function ProductDetails() {
  const { id } = useParams();
  const product = mockProducts.find((p) => p.id === Number(id)) || mockProducts[0];
  const { addToCart, addToWishlist } = useStore();
  const { t } = useTranslation();
  const [review, setReview] = useState({ rating: 0, comment: '' });
  const [reviews, setReviews] = useState([
    { id: 1, rating: 5, comment: t('great_product'), user: 'John' },
  ]);

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (review.rating && review.comment) {
      setReviews([...reviews, { id: reviews.length + 1, ...review, user: 'Anonymous' }]);
      setReview({ rating: 0, comment: '' });
      toast.success(t('review_submitted'));
    } else {
      toast.error(t('review_error'));
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Helmet>
        <title>{product.name} - ShopEase</title>
        <meta name="description" content={product.description} />
      </Helmet>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Product Images */}
        <Swiper
          modules={[Navigation]}
          spaceBetween={10}
          slidesPerView={1}
          navigation
          className="w-full"
        >
          {[product.image, product.image, product.image].map((img, idx) => (
            <SwiperSlide key={idx}>
              <motion.img
                src={img}
                alt={product.name}
                className="w-full h-96 object-cover"
                whileHover={{ scale: 1.2 }}
                transition={{ duration: 0.3 }}
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Product Info */}
        <div>
          <h2 className="text-3xl font-bold mb-4">{product.name}</h2>
          <p className="text-gray-600 mb-2">{product.description}</p>
          <p className="text-2xl font-semibold mb-2">
            ${product.price.toFixed(2)}{' '}
            <span className="line-through text-gray-400">${product.originalPrice.toFixed(2)}</span>
          </p>
          <p className="text-yellow-500 mb-4">
            {'★'.repeat(Math.floor(product.rating))} ({product.reviews} {t('reviews')})
          </p>
          <div className="flex space-x-4">
            <button
              onClick={() => {
                addToCart(product);
                toast.success(`${product.name} ${t('added_to_cart')}`);
              }}
              className="flex-1 bg-primary text-white py-2 rounded hover:bg-blue-700"
            >
              {t('add_to_cart')}
            </button>
            <button
              onClick={() => {
                addToWishlist(product);
                toast.success(`${product.name} ${t('added_to_wishlist')}`);
              }}
              className="px-4 bg-secondary text-white rounded hover:bg-orange-600"
            >
              ♥
            </button>
          </div>
        </div>
      </div>

      {/* Customer Reviews */}
      <div className="mt-10">
        <h3 className="text-2xl font-bold mb-4">{t('customer_reviews')}</h3>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <form onSubmit={handleReviewSubmit} className="mb-6">
            <div className="mb-4">
              <label className="block text-gray-700">{t('rating')}</label>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReview({ ...review, rating: star })}
                    className={`text-2xl ${star <= review.rating ? 'text-yellow-500' : 'text-gray-300'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">{t('comment')}</label>
              <textarea
                value={review.comment}
                onChange={(e) => setReview({ ...review, comment: e.target.value })}
                className="w-full p-2 border rounded"
                rows="4"
                required
              />
            </div>
            <button type="submit" className="bg-primary text-white py-2 px-4 rounded hover:bg-blue-700">
              {t('submit_review')}
            </button>
          </form>
          <div>
            {reviews.map((r) => (
              <div key={r.id} className="border-t py-4">
                <p className="text-yellow-500">{'★'.repeat(r.rating)}</p>
                <p className="text-gray-600">{r.comment}</p>
                <p className="text-sm text-gray-400">{t('by')} {r.user}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
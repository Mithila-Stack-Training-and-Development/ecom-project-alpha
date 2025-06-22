import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import useStore from '../store/useStore';

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { addToCart, user } = useStore();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/products/${id}`);
        if (!response.ok) throw new Error('Product not found');
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error(t('product_not_found'));
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, t]);

  const handleAddToCart = () => {
    if (!user) {
      toast.error(t('please_login_to_add_to_cart'));
      return;
    }
    if (product) {
      addToCart({ ...product, quantity: 1 });
      toast.success(t('added_to_cart'));
    }
  };

  if (loading) return <div className="text-center p-4">{t('loading')}...</div>;

  if (!product) return <div className="text-center p-4">{t('product_not_found')}</div>;

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-blue-600 hover:underline"
      >
        {t('back')}
      </button>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
        <p className="text-xl text-green-600 mb-4">${product.price.toFixed(2)}</p>
        <p className="text-gray-600 dark:text-gray-300 mb-4">{product.description}</p>
        <button
          onClick={handleAddToCart}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {t('add_to_cart')}
        </button>
      </div>
    </div>
  );
}

export default ProductDetails;
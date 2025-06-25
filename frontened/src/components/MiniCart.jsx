import { useState } from 'react';
import { motion } from 'framer-motion';
import useStore from '../store/useStore';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function MiniCart() {
  const { cart } = useStore();
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(true);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // If user has closed the cart, don't show it
  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed right-4 bottom-4 bg-white rounded-lg shadow-lg p-4 w-64 z-40"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Close button */}
      <button
        className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
        onClick={() => setIsVisible(false)}
        title={t('close')}
      >
        ×
      </button>

      <h3 className="text-lg font-semibold mb-2 mt-2 pr-4">{t('your_cart')}</h3>
      {cart.length === 0 ? (
        <p className="text-gray-600">{t('cart_empty')}</p>
      ) : (
        <>
          <div className="max-h-48 overflow-y-auto">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center mb-2">
                <img src={item.image} alt={item.name} className="w-12 h-12 object-cover mr-2" />
                <div>
                  <p className="text-sm">{item.name}</p>
                  <p className="text-gray-600">${item.price.toFixed(2)} x {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-right font-semibold mt-2">{t('total')}: ${total.toFixed(2)}</p>
          <Link to="/cart" className="block mt-2 bg-primary text-white py-2 text-center rounded hover:bg-blue-700">
            {t('view_cart')}
          </Link>
        </>
      )}
    </motion.div>
  );
}

export default MiniCart;

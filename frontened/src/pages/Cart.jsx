import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useStore from '../store/useStore';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

function Cart() {
  const { cart, removeFromCart, updateQuantity } = useStore();
  const { t } = useTranslation();
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="container mx-auto py-10">
      <h2 className="text-3xl font-bold mb-6 text-center">{t('your_cart')}</h2>
      {cart.length === 0 ? (
        <p className="text-center text-gray-600">{t('cart_empty')}</p>
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-6">
          {cart.map((item) => (
            <motion.div
              key={item.id}
              className="flex items-center border-b py-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <img src={item.image} alt={item.name} className="w-20 h-20 object-cover mr-4" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{item.name}</h3>
                <p className="text-gray-600">${item.price.toFixed(2)}</p>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="px-2 py-1 bg-gray-200 rounded"
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="px-2 py-1 bg-gray-200 rounded"
                  >
                    +
                  </button>
                </div>
              </div>
              <button
                onClick={() => {
                  removeFromCart(item.id);
                  toast.success(`${item.name} ${t('removed_from_cart')}`);
                }}
                className="text-red-600 hover:underline"
              >
                {t('remove')}
              </button>
            </motion.div>
          ))}
          <div className="text-right mt-4">
            <p className="text-xl font-semibold">{t('total')}: ${total.toFixed(2)}</p>
            <Link to="/checkout" className="mt-2 inline-block bg-primary text-white py-2 px-4 rounded hover:bg-blue-700">
              {t('proceed_to_checkout')}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
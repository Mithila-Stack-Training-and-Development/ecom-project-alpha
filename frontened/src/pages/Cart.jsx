// src/components/Cart.jsx
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useStore from '../store/useStore';

function Cart() {
  /* ──────────────────────────
     Pull only the bits we need
     (selector pattern avoids
     unnecessary re-renders)
  ───────────────────────────*/
  const { cart, updateQuantity, removeFromCart } = useStore((state) => ({
    cart: state.cart,
    updateQuantity: state.updateQuantity,
    removeFromCart: state.removeFromCart,
  }));

  const { t } = useTranslation();

  /* ──────────────────────────
     Derive the total just once
     whenever the cart changes
  ───────────────────────────*/
  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  /* ──────────────────────────
     Helpers keep the JSX tidy
  ───────────────────────────*/
  const inc = (id, qty) => updateQuantity(id, qty + 1);

  const dec = (id, qty) => {
    if (qty === 1) {
      removeFromCart(id);
      toast.success(t('removed_from_cart'));
    } else {
      updateQuantity(id, qty - 1);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h2 className="text-3xl font-bold mb-6 text-center">
        {t('your_cart')}
      </h2>

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
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 object-cover mr-4"
              />

              {/* Product info + qty controls */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{item.name}</h3>
                <p className="text-gray-600">${item.price.toFixed(2)}</p>

                <div className="flex items-center space-x-2 mt-2">
                  <button
                    onClick={() => dec(item.id, item.quantity)}
                    className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded"
                    aria-label={t('decrease')}
                  >
                    −
                  </button>

                  <span className="w-8 text-center">{item.quantity}</span>

                  <button
                    onClick={() => inc(item.id, item.quantity)}
                    className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded"
                    aria-label={t('increase')}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Remove button */}
              <button
                onClick={() => {
                  removeFromCart(item.id);
                  toast.success(`${item.name} ${t('removed_from_cart')}`);
                }}
                className="text-red-600 hover:underline ml-4"
              >
                {t('remove')}
              </button>
            </motion.div>
          ))}

          {/* Total & checkout */}
          <div className="text-right mt-6">
            <p className="text-xl font-semibold mb-2">
              {t('total')}: ${total.toFixed(2)}
            </p>

            <Link
              to="/checkout"
              className="inline-block bg-primary text-white py-2 px-6 rounded hover:bg-primary/90 transition"
            >
              {t('proceed_to_checkout')}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;

import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useState } from 'react';
import useStore from '../store/useStore';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';

function Checkout() {
  const { cart } = useStore();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    zipCode: '',
    paymentMethod: 'credit_card',
  });

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      toast.error(t('cart_empty'));
      return;
    }
    if (!formData.address || !formData.city || !formData.zipCode) {
      toast.error(t('fill_all_fields'));
      return;
    }
    toast.success(t('order_placed'));
    // Mock order placement; integrate with backend API here
  };

  return (
    <div className="container mx-auto py-10">
      <Helmet>
        <title>Checkout - ShopEase</title>
        <meta name="description" content="Complete your purchase with ShopEase's secure checkout." />
      </Helmet>
      <h2 className="text-3xl font-bold mb-6 text-center">{t('checkout')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">{t('order_summary')}</h3>
          {cart.length === 0 ? (
            <p className="text-gray-600">{t('cart_empty')}</p>
          ) : (
            <>
              {cart.map((item) => (
                <motion.div
                  key={item.id}
                  className="flex items-center mb-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <img src={item.image} alt={item.name} className="w-12 h-12 object-cover mr-2" />
                  <div>
                    <p className="text-sm">{item.name}</p>
                    <p className="text-gray-600">${item.price.toFixed(2)} x {item.quantity}</p>
                  </div>
                </motion.div>
              ))}
              <p className="text-right font-semibold mt-4">{t('total')}: ${total.toFixed(2)}</p>
            </>
          )}
        </div>

        {/* Checkout Form */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">{t('shipping_payment')}</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700">{t('address')}</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">{t('city')}</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">{t('zip_code')}</label>
              <input
                type="text"
                value={formData.zipCode}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">{t('payment_method')}</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full p-2 border rounded"
              >
                <option value="credit_card">{t('credit_card')}</option>
                <option value="paypal">{t('paypal')}</option>
                <option value="cash_on_delivery">{t('cash_on_delivery')}</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-white py-2 rounded hover:bg-blue-700"
            >
              {t('place_order')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
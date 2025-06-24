import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import useStore from '../store/useStore';

function OrderHistory() {
  const { t } = useTranslation();

  /* pull what we need from Zustand */
  const { user, orders, fetchOrders } = useStore((s) => ({
    user: s.user,
    orders: s.orders,
    fetchOrders: s.fetchOrders,
  }));

  /* fetch the logged-in user’s orders once */
  useEffect(() => {
    if (user?.token) fetchOrders(user.token);
  }, [user, fetchOrders]);

  if (!user)
    return (
      <p className="text-center py-10">
        {t('please_login_to_view_orders')}
      </p>
    );

  return (
    <div className="container mx-auto py-10">
      <Helmet>
        <title>{t('order_history')} – ShopEase</title>
        <meta
          name="description"
          content="View your past orders with ShopEase."
        />
      </Helmet>

      <h2 className="text-3xl font-bold mb-6 text-center">
        {t('order_history')}
      </h2>

      <div className="bg-white rounded-lg shadow-lg p-6">
        {orders.length === 0 ? (
          <p className="text-center text-gray-600">{t('no_orders')}</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="p-2">{t('order_id')}</th>
                <th className="p-2">{t('date')}</th>
                <th className="p-2">{t('total')}</th>
                <th className="p-2">{t('status')}</th>
                <th className="p-2">{t('items')}</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <td className="p-2">{order.id}</td>
                  <td className="p-2">
                    {new Date(order.date).toLocaleDateString()}
                  </td>
                  <td className="p-2">${order.total.toFixed(2)}</td>
                  <td className="p-2">
                    {t(order.status.toLowerCase())}
                  </td>
                  <td className="p-2">
                    {order.items.map((i) => i.name).join(', ')}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default OrderHistory;

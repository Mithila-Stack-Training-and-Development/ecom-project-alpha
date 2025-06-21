import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';

// Mock order data
const mockOrders = [
  { id: 1, date: '2025-06-15', total: 59.99, status: 'Delivered', items: ['Wireless Earbuds'] },
  { id: 2, date: '2025-06-10', total: 89.99, status: 'Shipped', items: ['Running Shoes'] },
];

function OrderHistory() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto py-10">
      <Helmet>
        <title>Order History - ShopEase</title>
        <meta name="description" content="View your past orders with ShopEase." />
      </Helmet>
      <h2 className="text-3xl font-bold mb-6 text-center">{t('order_history')}</h2>
      <div className="bg-white rounded-lg shadow-lg p-6">
        {mockOrders.length === 0 ? (
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
              {mockOrders.map((order) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <td className="p-2">{order.id}</td>
                  <td className="p-2">{order.date}</td>
                  <td className="p-2">${order.total.toFixed(2)}</td>
                  <td className="p-2">{t(order.status.toLowerCase())}</td>
                  <td className="p-2">{order.items.join(', ')}</td>
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
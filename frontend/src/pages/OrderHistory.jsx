import { useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import useStore from "../store/useStore";

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
const USD_TO_INR = 82;

function OrderHistory() {
  const { t } = useTranslation();

  /* pull state + action from Zustand */
  const { user, orders, fetchOrders } = useStore((s) => ({
    user: s.user,
    orders: s.orders,
    fetchOrders: s.fetchOrders,
  }));

  /* fetch each time token changes or component mounts */
  useEffect(() => {
    if (user?.token) fetchOrders(user.token);
  }, [user?.token, fetchOrders]);

  if (!user)
    return (
      <p className="text-center py-10">{t("please_login_to_view_orders")}</p>
    );

  return (
    <div className="container mx-auto py-10">
      <Helmet>
        <title>{t("order_history")} – ShopEase</title>
        <meta name="description" content="View your past orders with ShopEase." />
      </Helmet>

      <h2 className="text-3xl font-bold mb-6 text-center">
        {t("order_history")}
      </h2>

      <div className="bg-white rounded-lg shadow-lg p-6">
        {orders.length === 0 ? (
          <p className="text-center text-gray-600">{t("no_orders")}</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="p-2">{t("order_id")}</th>
                <th className="p-2">{t("date")}</th>
                <th className="p-2">{t("total")}</th>
                <th className="p-2">{t("status")}</th>
                <th className="p-2">{t("items")}</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <motion.tr
                  key={order._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <td className="p-2 break-words">{order._id}</td>
                  <td className="p-2">
                    {new Date(order.createdAt).toLocaleString()}
                  </td>
                  <td className="p-2">
                    ₹{(order.total * USD_TO_INR).toFixed(2)}
                  </td>
                  <td className="p-2">{t(order.status?.toLowerCase() || "pending")}</td>
                  <td className="p-2">
                    <div className="flex -space-x-2">
                      {order.items.slice(0, 3).map((i) => (
                        <img
                          key={i.productId}
                          src={
                            i.image?.startsWith("http")
                              ? i.image
                              : `${BACKEND_URL}${i.image || ""}`
                          }
                          alt={i.name}
                          className="w-8 h-8 object-cover rounded-full border"
                          title={i.name}
                        />
                      ))}
                      {order.items.length > 3 && (
                        <span className="text-sm text-gray-500 ml-2">
                          +{order.items.length - 3}
                        </span>
                      )}
                    </div>
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

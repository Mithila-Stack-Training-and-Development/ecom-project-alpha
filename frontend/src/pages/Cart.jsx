import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useStore from "../store/useStore";

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

function Cart() {
  const { cart, updateQuantity, removeFromCart } = useStore((s) => ({
    cart: s.cart,
    updateQuantity: s.updateQuantity,
    removeFromCart: s.removeFromCart,
  }));

  const { t } = useTranslation();
  const USD_TO_INR = 82;

  const total = useMemo(
    () =>
      cart.reduce(
        (sum, item) => sum + item.price * USD_TO_INR * item.quantity,
        0
      ),
    [cart]
  );

  const inc = (id, qty) => updateQuantity(id, qty + 1);
  const dec = (id, qty) =>
    qty === 1
      ? (removeFromCart(id), toast.success(t("removed_from_cart")))
      : updateQuantity(id, qty - 1);

  /* helper for img path */
  const imgSrc = (path) =>
    path?.startsWith("http") ? path : `${BACKEND_URL}${path || ""}`;

  return (
    <div className="container mx-auto py-10">
      <h2 className="text-3xl font-bold mb-6 text-center">{t("your_cart")}</h2>

      {cart.length === 0 ? (
        <p className="text-center text-gray-600">{t("cart_empty")}</p>
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
                src={imgSrc(item.image)}
                alt={item.name}
                className="w-20 h-20 object-cover mr-4"
              />

              {/* info + qty */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{item.name}</h3>
                <p className="text-gray-600">
                  ₹{(item.price * USD_TO_INR).toFixed(2)}
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <button
                    onClick={() => dec(item.id, item.quantity)}
                    className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded"
                    aria-label={t("decrease")}
                  >
                    −
                  </button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => inc(item.id, item.quantity)}
                    className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded"
                    aria-label={t("increase")}
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={() => {
                  removeFromCart(item.id);
                  toast.success(`${item.name} ${t("removed_from_cart")}`);
                }}
                className="text-red-600 hover:underline ml-4"
              >
                {t("remove")}
              </button>
            </motion.div>
          ))}

          {/* total + checkout */}
          <div className="text-right mt-6">
            <p className="text-xl font-semibold mb-2">
              {t("total")}: ₹{total.toFixed(2)}
            </p>
            <Link
              to="/checkout"
              className="inline-block bg-primary text-white py-2 px-6 rounded hover:bg-primary/90 transition"
            >
              {t("proceed_to_checkout")}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;

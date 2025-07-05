import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useState } from "react";
import useStore from "../store/useStore";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
const USD_TO_INR = 82;

function Checkout() {
  const { cart, user, clearCart } = useStore();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    address: "",
    city: "",
    zipCode: "",
    paymentMethod: "razorpay",
  });

  const totalUSD = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const totalINR = totalUSD * USD_TO_INR;
  const totalPaise = Math.round(totalINR * 100);

  const imgSrc = (p) => (p?.startsWith("http") ? p : `${BACKEND_URL}${p || ""}`);

  const sendOrder = async () => {
    if (!user?.token) {
      toast.error(t("please_login_to_place_order"));
      return false;
    }

    const orderItems = cart.map((i) => ({
      name: i.name,
      productId: i.id ?? i._id,
      image: i.image,
      quantity: i.quantity,
      price: i.price,
    }));

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ items: orderItems, total: totalUSD }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      toast.success(t("order_saved"));
      clearCart();
      return true;
    } catch (err) {
      console.error("Order save error:", err);
      toast.error(t("order_save_failed"));
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error(t("please_login_to_place_order"));
      navigate("/login"); // Redirect to login page
      return;
    }

    if (cart.length === 0) return toast.error(t("cart_empty"));
    if (!formData.address || !formData.city || !formData.zipCode)
      return toast.error(t("fill_all_fields"));

    if (formData.paymentMethod === "cod") {
      toast.success(t("order_placed_cod"));
      await sendOrder();
      return;
    }

    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalPaise }),
      });
      const order = await res.json();

      const rzp = new window.Razorpay({
        key: "rzp_test_icFDLBy8O62EJb",
        amount: order.amount,
        currency: "INR",
        name: "ShopEase",
        description: "Order Payment",
        order_id: order.id,
        handler: async (response) => {
          toast.success(t("payment_successful"));
          await sendOrder();
        },
        prefill: {
          name: "Customer Name",
          email: user?.email || "customer@example.com",
          contact: "9999999999",
        },
        theme: { color: "#0d6efd" },
        method: { upi: true, card: true, netbanking: true, wallet: true },
        modal: { ondismiss: () => toast.error(t("payment_cancelled")) },
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      toast.error(t("payment_init_failed"));
    }
  };

  const handleButtonClick = () => {
    if (!user) {
      toast.error(t("please_login_to_place_order"));
      navigate("/login"); // redirect if not logged in
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Helmet>
        <title>Checkout - ShopEase</title>
        <meta
          name="description"
          content="Complete your purchase with ShopEase's secure checkout."
        />
      </Helmet>

      <h2 className="text-3xl font-bold mb-6 text-center">{t("checkout")}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">{t("order_summary")}</h3>

          {cart.length === 0 ? (
            <p className="text-gray-600">{t("cart_empty")}</p>
          ) : (
            <>
              {cart.map((item) => (
                <motion.div
                  key={item.id}
                  className="flex items-center mb-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <img
                    src={imgSrc(item.image)}
                    alt={item.name}
                    className="w-12 h-12 object-cover mr-2"
                  />
                  <div>
                    <p className="text-sm">{item.name}</p>
                    <p className="text-gray-600">
                      ₹{(item.price * USD_TO_INR).toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                </motion.div>
              ))}

              <p className="text-right font-semibold mt-4">
                {t("total")}: ₹{totalINR.toFixed(2)}
              </p>
            </>
          )}
        </div>

        {/* Checkout Form */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">{t("shipping_payment")}</h3>

          <form onSubmit={handleSubmit}>
            {[
              { key: "address", label: t("address") },
              { key: "city", label: t("city") },
              { key: "zipCode", label: t("zip_code") },
            ].map((f) => (
              <div className="mb-4" key={f.key}>
                <label className="block text-gray-700">{f.label}</label>
                <input
                  type="text"
                  value={formData[f.key]}
                  onChange={(e) =>
                    setFormData({ ...formData, [f.key]: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
            ))}

            <div className="mb-4">
              <label className="block text-gray-700">{t("payment_method")}</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) =>
                  setFormData({ ...formData, paymentMethod: e.target.value })
                }
                className="w-full p-2 border rounded"
              >
                <option value="razorpay">
                  Razorpay (UPI / Card / Wallet / Netbanking)
                </option>
                <option value="cod">{t("cash_on_delivery")}</option>
              </select>
            </div>

            <button
              type="submit"
              onClick={handleButtonClick}
              className={`w-full py-2 rounded hover:bg-blue-700 text-white ${
                user ? "bg-primary" : "bg-gray-400 cursor-pointer"
              }`}
            >
              {user ? t("place_order") : t("please_login_to_place_order")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Checkout;

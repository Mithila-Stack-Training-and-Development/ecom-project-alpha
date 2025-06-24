import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import useStore from "../store/useStore";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Dialog } from "@headlessui/react";

/* ──────────────────────────
   MOCK DATA
──────────────────────────── */
const mockProducts = [
  {
    id: 1,
    name: "Wireless Earbuds",
    price: 59.99,
    originalPrice: 79.99,
    category: "Electronics",
    brand: "TechTrend",
    image :"hero1.jpg" ,
    rating: 4.5,
    reviews: 120,
    description: "High-quality wireless earbuds with noise cancellation."
  },
  {
    id: 2,
    name: "Running Shoes",
    price: 89.99,
    originalPrice: 99.99,
    category: "Fashion",
    brand: "SportyFit",
    image: "hero2.jpg",
    rating: 4.0,
    reviews: 85,
    description: "Comfortable running shoes for all terrains."
  },
  {
    id: 3,
    name: "Smart Watch",
    price: 199.99,
    originalPrice: 249.99,
    category: "Electronics",
    brand: "TechTrend",
    image: "hero3.jpeg",
    rating: 4.8,
    reviews: 200,
    description: "Advanced smart watch with fitness tracking."
  },
  {
    id: 4,
    name: "Backpack",
    price: 49.99,
    originalPrice: 59.99,
    category: "Accessories",
    brand: "TravelEase",
    image: "hero4.jpg",
    rating: 4.2,
    reviews: 65,
    description: "Durable backpack for daily use."
  }
];

/* ──────────────────────────
   HOME COMPONENT
──────────────────────────── */
function Home() {
  /* UI state */
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  /* helpers */
  const categories = ["All", "Electronics", "Fashion", "Accessories"];
  const { addToCart, addToWishlist } = useStore();
  const { t } = useTranslation();

  /* ─ Filtering ─ */
  const filteredProducts = mockProducts.filter((p) => {
    const categoryMatch =
      selectedCategory === "All" || p.category === selectedCategory;
    const priceMatch = p.price >= priceRange[0] && p.price <= priceRange[1];
    return categoryMatch && priceMatch;
  });

  /* ─ Scroll‑to‑load toast (guarded) ─ */
  const isLoading = useRef(false); // prevents toast spam

  useEffect(() => {
    const handleScroll = () => {
      const nearBottom =
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 200; // 200 px from bottom

      if (nearBottom && !isLoading.current) {
        isLoading.current = true;

        const toastId = toast.loading(t("loading_more_products")); // single toast

        /* TODO: replace timeout with real fetch */
        setTimeout(() => {
          toast.dismiss(toastId); // hide spinner
          isLoading.current = false;
        }, 1500);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [t]);

  /* ──────────────────────────
     RENDER
  ──────────────────────────── */
  return (
    <div className="container mx-auto py-10">
      {/* Deal of the Day Carousel */}
      <Swiper
        modules={[Navigation, Autoplay]}
        spaceBetween={20}
        slidesPerView={1}
        navigation
        autoplay={{ delay: 3000 }}
        className="mb-10"
      >
        {mockProducts.map((product) => (
          <SwiperSlide key={product.id}>
            <div className="bg-white text-white p-6 rounded-lg text-center overflow-hidden ">
              <h3 className="text-2xl font-bold">{t("deal_of_the_day")}</h3>
              <p>
                {product.name} - {t("save")}{" "}
                {Math.round(
                  ((product.originalPrice - product.price) /
                    product.originalPrice) *
                    100
                )}
                %
              </p>
              <img
                src={product.image}
                alt={product.name}
                className="mx-auto h-48"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        {/* Categories */}
        <div>
          <label className="block text-sm font-medium">{t("category")}</label>
          <div className="flex space-x-2">
            {categories.map((category) => (
              <motion.button
                key={category}
                className={`px-4 py-2 rounded-full ${
                  selectedCategory === category
                    ? "bg-primary text-white"
                    : "bg-gray-200"
                }`}
                onClick={() => setSelectedCategory(category)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {t(category.toLowerCase())}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium">{t("price_range")}</label>
          <input
            type="range"
            min="0"
            max="500"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([0, Number(e.target.value)])}
            className="w-full"
          />
          <p>
            {t("up_to")} ${priceRange[1]}
          </p>
        </div>
      </div>

      {/* Featured product grid */}
      <h2 className="text-3xl font-bold mb-6 text-center">
        {t("featured_products")}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <motion.div
            key={product.id}
            className="bg-white rounded-lg shadow-lg overflow-hidden relative"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <Link to={`/product/${product.id}`}>
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover"
                loading="lazy"
              />
            </Link>
            <div className="p-4">
              <h3 className="text-lg font-semibold">{product.name}</h3>
              <p className="text-gray-600">
                ${product.price.toFixed(2)}{" "}
                <span className="line-through text-gray-400">
                  ${product.originalPrice.toFixed(2)}
                </span>
              </p>
              <p className="text-yellow-500">
                {"★".repeat(Math.floor(product.rating))} ({product.reviews})
              </p>

              {/* cart / wishlist */}
              <div className="flex space-x-2 mt-2">
                <button
                  onClick={() => {
                    addToCart(product);
                    toast.success(`${product.name} ${t("added_to_cart")}`);
                  }}
                  className="flex-1 bg-primary text-white py-2 rounded hover:bg-blue-700"
                >
                  {t("add_to_cart")}
                </button>
                <button
                  onClick={() => {
                    addToWishlist(product);
                    toast.success(`${product.name} ${t("added_to_wishlist")}`);
                  }}
                  className="px-4 bg-secondary text-white rounded hover:bg-orange-600"
                >
                  ♥
                </button>
              </div>

              {/* quick‑view */}
              <button
                onClick={() => setQuickViewProduct(product)}
                className="mt-2 w-full bg-gray-600 text-white py-1 rounded hover:bg-gray-700"
              >
                {t("quick_view")}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick‑view modal */}
      <Dialog
        open={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      >
        {quickViewProduct && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white text-gray-900 rounded-lg p-8 w-full max-w-lg"
          >
            <Dialog.Title className="text-2xl font-bold mb-4">
              {quickViewProduct.name}
            </Dialog.Title>
            <img
              src={quickViewProduct.image}
              alt={quickViewProduct.name}
              className="w-full h-64 object-cover mb-4"
            />
            <p className="text-gray-600 mb-2">
              {quickViewProduct.description}
            </p>
            <p className="text-xl font-semibold">
              ${quickViewProduct.price.toFixed(2)}{" "}
              <span className="line-through text-gray-400">
                ${quickViewProduct.originalPrice.toFixed(2)}
              </span>
            </p>
            <p className="text-yellow-500 mb-4">
              {"★".repeat(Math.floor(quickViewProduct.rating))} (
              {quickViewProduct.reviews})
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  addToCart(quickViewProduct);
                  toast.success(
                    `${quickViewProduct.name} ${t("added_to_cart")}`
                  );
                }}
                className="flex-1 bg-primary text-white py-2 rounded hover:bg-blue-700"
              >
                {t("add_to_cart")}
              </button>
              <button
                onClick={() => {
                  addToWishlist(quickViewProduct);
                  toast.success(
                    `${quickViewProduct.name} ${t("added_to_wishlist")}`
                  );
                }}
                className="px-4 bg-secondary text-white rounded hover:bg-orange-600"
              >
                ♥
              </button>
            </div>
            <button
              onClick={() => setQuickViewProduct(null)}
              className="mt-4 text-gray-600 hover:text-gray-800"
            >
              {t("close")}
            </button>
          </motion.div>
        )}
      </Dialog>

      {/* Personalized Recommendations */}
      <h2 className="text-3xl font-bold mt-10 mb-6 text-center">
        {t("recommended_for_you")}
      </h2>
      <Swiper
        modules={[Navigation]}
        spaceBetween={20}
        slidesPerView={4}
        navigation
        className="mb-10"
      >
        {mockProducts.map((product) => (
          <SwiperSlide key={product.id}>
            <Link to={`/product/${product.id}`}>
              <div className="bg-white rounded-lg shadow-lg p-4">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-32 mx-auto"
                />
                <p className="text-center">{product.name}</p>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

export default Home;

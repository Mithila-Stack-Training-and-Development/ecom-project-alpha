/* src/pages/AdminPanel.jsx */
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import useStore from "../store/useStore";
import { motion } from "framer-motion";

function AdminPanel() {
  const { theme, user } = useStore();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ─ Form state ─ */
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    category: "",
    brand: "",
    rating: "",
    reviews: "",
  });
  const [imageFile, setImageFile] = useState(null);

  /* ─ Fetch existing products ─ */
  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Failed to fetch products");
      setProducts(await res.json());
    } catch (err) {
      toast.error(err.message);
    }
  };
  useEffect(() => { fetchProducts(); }, []);

  /* ─ Handle form inputs ─ */
  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const handleFileChange = (e) => setImageFile(e.target.files[0]);

  /* ─ Submit new product ─ */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) return toast.error("Image is required");

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    fd.append("image", imageFile);

    try {
      setLoading(true);
      const res = await fetch("/api/products", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) throw new Error((await res.json()).message || "Upload failed");
      toast.success("Product added");
      setForm({
        name: "",
        description: "",
        price: "",
        originalPrice: "",
        category: "",
        brand: "",
        rating: "",
        reviews: "",
      });
      setImageFile(null);
      fetchProducts();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ─ Optional delete (needs backend DELETE route) ─ */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).message || "Delete failed");
      toast.success("Deleted");
      setProducts((p) => p.filter((x) => x._id !== id));
    } catch (err) {
      toast.error(err.message);
    }
  };

  /* ─ JSX ─ */
  return (
    <div
      className={`min-h-screen py-10 ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Admin – Add Product</h1>

        {/* Upload form */}
        <form
          onSubmit={handleSubmit}
          encType="multipart/form-data"
          className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-gray-800 p-6 rounded shadow mb-10"
        >
          {[
            { n: "name", l: "Name", t: "text", r: true },
            { n: "description", l: "Description", t: "textarea", r: true },
            { n: "price", l: "Price ($)", t: "number", r: true, step: "0.01" },
            { n: "originalPrice", l: "Original ($)", t: "number", step: "0.01" },
            { n: "category", l: "Category", t: "text", r: true },
            { n: "brand", l: "Brand", t: "text" },
            { n: "rating", l: "Rating 0‑5", t: "number", step: "0.1", min: 0, max: 5 },
            { n: "reviews", l: "Reviews", t: "number" },
          ].map((f) => (
            <div key={f.n} className="flex flex-col">
              <label className="mb-1 font-medium">{f.l}</label>
              {f.t === "textarea" ? (
                <textarea
                  name={f.n}
                  value={form[f.n]}
                  onChange={handleChange}
                  required={f.r}
                  className="border rounded p-2 dark:bg-gray-700"
                />
              ) : (
                <input
                  type={f.t}
                  name={f.n}
                  value={form[f.n]}
                  onChange={handleChange}
                  required={f.r}
                  step={f.step}
                  min={f.min}
                  max={f.max}
                  className="border rounded p-2 dark:bg-gray-700"
                />
              )}
            </div>
          ))}

          {/* Image selector (spans two cols) */}
          <div className="md:col-span-2">
            <label className="block mb-1 font-medium">Image *</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              required
              className="w-full"
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className="md:col-span-2 bg-primary text-white py-2 rounded hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "Uploading…" : "Add Product"}
          </motion.button>
        </form>

        {/* Product table */}
        <h2 className="text-2xl font-semibold mb-4">Current Products</h2>
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded shadow">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="p-2 text-left">Image</th>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Price ($)</th>
                <th className="p-2 text-left">Category</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-b border-gray-100 dark:border-gray-700">
                  <td className="p-2">
                    <img
                      src={`http://localhost:5000${p.image}`}
                      alt={p.name}
                      className="h-12 w-12 object-cover rounded"
                    />
                  </td>
                  <td className="p-2">{p.name}</td>
                  <td className="p-2">${p.price?.toFixed(2)}</td>
                  <td className="p-2">{p.category}</td>
                  <td className="p-2 text-right">
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-4 text-center">
                    No products yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;

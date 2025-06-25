import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import toast from 'react-hot-toast';
import { FiSearch, FiMoon, FiSun, FiMic, FiLogIn, FiUserPlus, FiShoppingCart } from 'react-icons/fi';
import useStore from './store/useStore';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import AdminPanel from './pages/AdminPanel';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';
import MiniCart from './components/MiniCart';
import { useTranslation } from 'react-i18next';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import ProtectedRoute from './components/ProtectedRoute';
import './i18n';
import UserProfile from './pages/UserProfile';

// Debounce utility
const debounce = (func, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};

function App() {
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', otp: '' });
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const { toggleTheme, theme, setUser, user, logout } = useStore();
  const { t, i18n } = useTranslation();

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, [setUser]);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/products');
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        setFilteredProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to load products');
      }
    };
    fetchProducts();
  }, []);

  // Debounced search filter
  const handleSearchChange = debounce((query) => {
    const results = filteredProducts.filter(product =>
      product.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredProducts(results);
  }, 300);

  useEffect(() => {
    handleSearchChange(searchQuery);
  }, [searchQuery]);

  // Google Sign-In initialization
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id: '786507203800-godbekcnq455ed3bgr2e6q4k0cq5o0nt.apps.googleusercontent.com', // Replace with your Client ID
        callback: handleCredentialResponse,
      });
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleCredentialResponse = async (response) => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      });
      const data = await res.json();
      if (res.ok) {
        const userWithToken = { id: data.user.id, email: data.user.email, token: data.token };
        setUser(userWithToken);
        localStorage.setItem('user', JSON.stringify(userWithToken));
        toast.success(t('login_success'));
        setIsLoginOpen(false);
        setIsSignupOpen(false); // Close signup modal if open
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Google login failed: ' + error.message);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    console.log('Form data:', formData);
    if (!e.target.checkValidity()) {
      toast.error('Please fill all required fields.');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/auth/signup/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password.trim(),
        }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message);
        setFormData({ ...formData, step: 'otp' });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Server error');
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/signup/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          otp: formData.otp,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        const userWithToken = { id: data.user.id, email: formData.email, token: data.token };
        setUser(userWithToken);
        localStorage.setItem('user', JSON.stringify(userWithToken));
        toast.success(t('signup_success'));
        setFormData({ name: '', email: '', password: '', otp: '' });
        setIsSignupOpen(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Server error');
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!e.target.checkValidity()) {
      toast.error('Please fill all required fields.');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });
      console.log('Login fetch response:', response);
      const data = await response.json();
      console.log('Login Response:', data);
      if (response.ok) {
        const userWithToken = { id: data.user.id, email: loginData.email, token: data.token };
        setUser(userWithToken);
        localStorage.setItem('user', JSON.stringify(userWithToken));
        toast.success(t('login_success'));
        setLoginData({ email: '', password: '' });
        setIsLoginOpen(false);
      } else {
        console.warn('Login failed:', data.message || 'Unknown issue');
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Server error');
    }
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    toast.success(`${t('searching_for')} ${searchQuery}`);
  };

  const startVoiceSearch = () => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      toast.error(t('voice_search_not_supported'));
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = i18n.language === 'en' ? 'en-US' : 'hi-IN';
    recognition.onresult = (event) => {
      const query = event.results[0][0].transcript;
      setSearchQuery(query);
      toast.success(`${t('searching_for')} ${query}`);
    };
    recognition.onerror = () => toast.error(t('voice_search_error'));
    recognition.start();
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'hi' : 'en');
  };

  const handleGoogleSignIn = (e) => {
    e.preventDefault();
    if (window.google) {
      window.google.accounts.id.prompt(); // Trigger Google One Tap
    } else {
      toast.error('Google Sign-In not loaded');
    }
  };

  const addToCart = async (productId) => {
    if (!user) {
      toast.error(t('please_login_to_add_to_cart'));
      setIsLoginOpen(true);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(t('item_added_to_cart'));
        // Optionally update cart state here if you manage it in the frontend
      } else {
        toast.error(data.message || t('failed_to_add_to_cart'));
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error(t('server_error'));
    }
  };

  return (
    <HelmetProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
          <Helmet>
            <title>ShopEase - Your Online Shopping Destination</title>
            <meta name="description" content="ShopEase offers a wide range of products with fast delivery and great deals." />
          </Helmet>
          <Toaster position="top-right" />
          {/* Navbar */}
          <nav className="bg-gray-900 text-white p-4 sticky top-0 z-50 shadow-lg">
            <div className="container mx-auto flex justify-between items-center">
              {user ? (
                <Link to="/" className="text-xl font-semibold hover:text-gray-300">
                  Hi, {user.name || user.email.split('@')[0]}!
                </Link>
              ) : (
                <Link to="/" className="text-2xl font-bold hover:text-gray-300">
                  ShopEase
                </Link>
              )}
              <div className="flex items-center space-x-4">
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    placeholder={t('search_placeholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="p-2 rounded-full w-64 bg-gray-800 text-white focus:outline-none"
                  />
                  <button type="submit" className="absolute right-8 top-2">
                    <FiSearch />
                  </button>
                  <button type="button" onClick={startVoiceSearch} className="absolute right-2 top-2">
                    <FiMic />
                  </button>
                </form>
                <Link to="/cart" className="hover:text-gray-300">
                  {t('cart')}
                </Link>
                <Link to="/orders" className="hover:text-gray-300">
                  {t('orders')}
                </Link>
                <Link to="/admin" className="hover:text-gray-300">
                  {t('admin')}
                </Link>
                {user ? (
                  <button onClick={handleLogout} className="hover:text-gray-300 flex items-center">
                    <FiLogIn className="mr-1" /> {t('logout')}
                  </button>
                ) : (
                  <>
                    <button onClick={() => setIsLoginOpen(true)} className="hover:text-gray-300 flex items-center">
                      <FiLogIn className="mr-1" /> {t('login')}
                    </button>
                    <button onClick={() => setIsSignupOpen(true)} className="hover:text-gray-300 flex items-center">
                      <FiUserPlus className="mr-1" /> {t('signup')}
                    </button>
                  </>
                )}
                <button onClick={toggleTheme} className="hover:text-gray-300">
                  {theme === 'dark' ? <FiSun /> : <FiMoon />}
                </button>
                <button onClick={toggleLanguage} className="hover:text-gray-300">
                  {i18n.language === 'en' ? 'हिंदी' : 'English'}
                </button>
              </div>
            </div>
            {/* Search Results */}
            {searchQuery && filteredProducts.length > 0 && (
              <div className="container mx-auto mt-2 p-4 bg-white text-gray-900 rounded shadow-lg dark:bg-gray-800 dark:text-white">
                <h3 className="text-lg font-bold">Search Results</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                  {filteredProducts.map(product => (
                    <li key={product._id} className="p-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                      <Link to={`/product/${product._id}`} className="block">
                        {product.name} - ${product.price.toFixed(2)}
                        <p className="text-sm text-gray-600 dark:text-gray-400">{product.description}</p>
                        <button
                          onClick={(e) => { e.preventDefault(); addToCart(product._id); }}
                          className="mt-2 bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 disabled:bg-gray-400"
                          disabled={!user}
                        >
                          <FiShoppingCart className="inline mr-1" /> {t('add_to_cart')}
                        </button>
                      </Link>
                    </li>
                  ))}
                </ul>
                {filteredProducts.length === 0 && <p>No products found.</p>}
              </div>
            )}
          </nav>

          {/* Routes */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
          </Routes>

          {/* Mini Cart */}
          <MiniCart />

          {/* Signup Modal */}
          <Dialog
            open={isSignupOpen}
            onClose={() => setIsSignupOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          >
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white text-gray-900 rounded-lg p-8 w-full max-w-md"
            >
              <Dialog.Title className="text-2xl font-bold mb-6 text-center">
                {t('signup')}
              </Dialog.Title>
              <form onSubmit={formData.step === 'otp' ? handleVerifyOTP : handleSignupSubmit}>
                {formData.step !== 'otp' ? (
                  <>
                    <div className="mb-4">
                      <label className="block text-gray-700">{t('name')}</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full p-2 border rounded"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700">{t('email')}</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full p-2 border rounded"
                        required
                        pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700">{t('password')}</label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full p-2 border rounded"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-primary text-white py-2 rounded hover:bg-blue-700"
                    >
                      {t('get_otp')}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="mb-4">
                      <label className="block text-gray-700">{t('enter_otp')}</label>
                      <input
                        type="text"
                        value={formData.otp}
                        onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                        className="w-full p-2 border rounded"
                        required
                        pattern="[0-9]{6}"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-primary text-white py-2 rounded hover:bg-blue-700"
                    >
                      {t('verify_otp')}
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full mt-2 bg-gray-800 text-white py-2 rounded hover:bg-gray-900"
                >
                  {t('google_signin')}
                </button>
                <p className="mt-4 text-center">
                  {t('already_have_account')} <button onClick={() => { setIsSignupOpen(false); setIsLoginOpen(true); }} className="text-blue-600 hover:underline">{t('login')}</button>
                </p>
              </form>
              <button
                onClick={() => setIsSignupOpen(false)}
                className="mt-4 text-gray-600 hover:text-gray-800"
              >
                {t('close')}
              </button>
            </motion.div>
          </Dialog>

          {/* Login Modal */}
          <Dialog
            open={isLoginOpen}
            onClose={() => setIsLoginOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          >
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white text-gray-900 rounded-lg p-8 w-full max-w-md"
            >
              <Dialog.Title className="text-2xl font-bold mb-6 text-center">
                {t('login')}
              </Dialog.Title>
              <form onSubmit={handleLoginSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700">{t('email')}</label>
                  <input
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">{t('password')}</label>
                  <input
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary text-white py-2 rounded hover:bg-blue-700"
                >
                  {t('login')}
                </button>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full mt-2 bg-gray-800 text-white py-2 rounded hover:bg-gray-900"
                >
                  {t('google_signin')}
                </button>
                <p className="mt-4 text-center">
                  {t('no_account')} <button onClick={() => { setIsLoginOpen(false); setIsSignupOpen(true); }} className="text-blue-600 hover:underline">{t('signup')}</button>
                </p>
              </form>
              <button
                onClick={() => setIsLoginOpen(false)}
                className="mt-4 text-gray-600 hover:text-gray-800"
              >
                {t('close')}
              </button>
            </motion.div>
          </Dialog>

          {/* Footer */}
          <footer className="bg-gray-900 text-white py-6 mt-10">
            <div className="container mx-auto text-center">
              <p>© 2025 ShopEase. {t('rights_reserved')}</p>
              <div className="mt-2 flex justify-center space-x-4">
                <a href="#" className="hover:text-gray-300">{t('privacy_policy')}</a>
                <a href="#" className="hover:text-gray-300">{t('terms_of_service')}</a>
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </HelmetProvider>
  );
}

export default App;
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
  import { Toaster } from 'react-hot-toast';
  import { motion } from 'framer-motion';
  import { useState } from 'react';
  import { Dialog } from '@headlessui/react';
  import toast from 'react-hot-toast';
  import { FiSearch, FiMoon, FiSun, FiMic, FiLogIn, FiUserPlus } from 'react-icons/fi';
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
  import './i18n';

  function App() {
    const [isSignupOpen, setIsSignupOpen] = useState(false);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [searchQuery, setSearchQuery] = useState('');
    const { toggleTheme, theme, setUser, user, logout } = useStore();
    const { t, i18n } = useTranslation();

    const handleSignupSubmit = async (e) => {
      e.preventDefault();
      try {
        const response = await fetch('http://localhost:5000/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await response.json();
        if (response.ok) {
          setUser(data.user);
          localStorage.setItem('token', data.token); // Store token
          toast.success(t('signup_success'));
          setFormData({ name: '', email: '', password: '' });
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
      try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(loginData),
        });
        const data = await response.json();
        if (response.ok) {
          setUser({ id: data.user.id, email: loginData.email }); // Adjust based on API response
          localStorage.setItem('token', data.token); // Store token
          toast.success(t('login_success'));
          setLoginData({ email: '', password: '' });
          setIsLoginOpen(false);
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error('Server error');
      }
    };

    const handleLogout = () => {
      logout();
      localStorage.removeItem('token');
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

    return (
      <HelmetProvider>
        <Router>
          <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
            <Helmet>
              <title>ShopEase - Your Online Shopping Destination</title>
              <meta name="description" content="ShopEase offers a wide range of products with fast delivery and great deals." />
            </Helmet>
            <Toaster position="top-right" />
            {/* Navbar */}
            <nav className="bg-gray-900 text-white p-4 sticky top-0 z-50 shadow-lg">
              <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold">
                  ShopEase
                </Link>
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
            </nav>

            {/* Routes */}
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/orders" element={<OrderHistory />} />
              <Route path="/admin" element={<AdminPanel />} />
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
                <form onSubmit={handleSignupSubmit}>
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
                    {t('signup')}
                  </button>
                  <button
                    type="button"
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
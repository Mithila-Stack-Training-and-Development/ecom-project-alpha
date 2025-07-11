import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      signup: 'Sign Up',
      login: 'Login',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      password: 'Password',
      contact_type: 'Contact Type',
      get_otp: 'Get OTP',
      enter_otp: 'Enter OTP',
      verify_otp: 'Verify OTP',
      google_signin: 'Sign in with Google',
      already_have_account: 'Already have an account?',
      no_account: 'Don\'t have an account?',
      login_success: 'Logged in successfully!',
      signup_success: 'Signed up successfully!',
      searching_for: 'Searching for',
      search_placeholder: 'Search products...',
      voice_search_not_supported: 'Voice search not supported in this browser.',
      voice_search_error: 'Error with voice search.',
      cart: 'Cart',
      orders: 'Orders',
      admin: 'Admin',
      logout: 'Logout',
      close: 'Close',
      rights_reserved: 'All rights reserved.',
      privacy_policy: 'Privacy Policy',
      terms_of_service: 'Terms of Service',
    },
  },
  hi: {
    translation: {
      signup: 'साइन अप करें',
      login: 'लॉगिन करें',
      name: 'नाम',
      email: 'ईमेल',
      phone: 'फोन',
      password: 'पासवर्ड',
      contact_type: 'संपर्क प्रकार',
      get_otp: 'OTP प्राप्त करें',
      enter_otp: 'OTP दर्ज करें',
      verify_otp: 'OTP सत्यापित करें',
      google_signin: 'Google के साथ साइन इन करें',
      already_have_account: 'पहले से खाता है?',
      no_account: 'खाता नहीं है?',
      login_success: 'सफलतापूर्वक लॉगिन हुआ!',
      signup_success: 'सफलतापूर्वक साइन अप हुआ!',
      searching_for: 'खोज रहा है',
      search_placeholder: 'उत्पाद खोजें...',
      voice_search_not_supported: 'इस ब्राउज़र में वॉयस खोज समर्थित नहीं है।',
      voice_search_error: 'वॉयस खोज में त्रुटि।',
      cart: 'कार्ट',
      orders: 'ऑर्डर',
      admin: 'एडमिन',
      logout: 'लॉगआउट',
      close: 'बंद करें',
      rights_reserved: 'सभी अधिकार सुरक्षित।',
      privacy_policy: 'गोपनीयता नीति',
      terms_of_service: 'सेवा की शर्तें',
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
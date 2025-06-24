// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const firebaseConfig = {
 apiKey: "AIzaSyBJrGI6Wg4F01WaEwHk57mtzJR1Cq89UeI",
  authDomain: "shikha-fba90.firebaseapp.com",
  projectId: "shikha-fba90",
  storageBucket: "shikha-fba90.firebasestorage.app",
  messagingSenderId: "183993162220",
  appId: "1:183993162220:web:615854e5d6d3612efb48c9",
  measurementId: "G-WKY78F9E98"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup };

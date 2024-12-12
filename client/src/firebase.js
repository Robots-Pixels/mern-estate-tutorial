// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-estate-75744.firebaseapp.com",
  projectId: "mern-estate-75744",
  storageBucket: "mern-estate-75744.firebasestorage.app",
  messagingSenderId: "499931731347",
  appId: "1:499931731347:web:49df224b320c8367a0c466"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
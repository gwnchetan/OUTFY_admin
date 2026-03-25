import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
apiKey: "AIzaSyBSUs1LItNrNozdJUvKDSOr6j5zrHTbens",
authDomain: "outfy-44079.firebaseapp.com",
projectId: "outfy-44079",
storageBucket: "outfy-44079.firebasestorage.app",
messagingSenderId: "576758192507",
appId: "1:576758192507:web:58c93ce04ff5d19793c5de",
measurementId: "G-LJ2DNPBFP3"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);      // Firestore database
export const auth = getAuth(app);         // Authentication
export const storage = getStorage(app);   // Firebase Storage
export const googleProvider = new GoogleAuthProvider();  // Google login
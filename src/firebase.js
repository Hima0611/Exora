import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDVaXJC2BF9s70PZMD2CX0s210cj446APw",
  authDomain: "exorablog-601a4.firebaseapp.com",
  projectId: "exorablog-601a4",
  storageBucket: "exorablog-601a4.firebasestorage.app",
  messagingSenderId: "446591239991",
  appId: "1:446591239991:web:c6f467702ae6479abd7cb2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

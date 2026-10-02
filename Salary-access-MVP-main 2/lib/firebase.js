
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCK7ZlNXxm8ElEuGGPwL5fBQMn_ZIRUSSY",
  authDomain: "salary-access-mvp.firebaseapp.com",
  projectId: "salary-access-mvp",
  storageBucket: "salary-access-mvp.firebasestorage.app",
  messagingSenderId: "412968751724",
  appId: "1:412968751724:web:0835a590875cc48012be49",
  measurementId: "G-RHJ38E8Y6N"
};
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };

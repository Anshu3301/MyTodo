// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCIfZHX_WXEuL6X5c2K7eK89VMktk5GZYI",
  authDomain: "todo-app-71d48.firebaseapp.com",
  projectId: "todo-app-71d48",
  storageBucket: "todo-app-71d48.firebasestorage.app",
  messagingSenderId: "186727760691",
  appId: "1:186727760691:web:30f16903a77d3071c87446",
  measurementId: "G-TB2BQ31ZEW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
export const db = getFirestore(app);
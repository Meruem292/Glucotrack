import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAR-veptcWwAV5-MvQQkbx3tJXIR85kiDs",
  authDomain: "glucotrack-8eea8.firebaseapp.com",
  projectId: "glucotrack-8eea8",
  storageBucket: "glucotrack-8eea8.firebasestorage.app",
  messagingSenderId: "449946335990",
  appId: "1:449946335990:web:5eeac0a68be201f4140ad7",
  measurementId: "G-0Y0NT0QQ44"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

export { app, auth, database };

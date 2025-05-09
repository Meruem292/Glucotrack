import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyB-n9OVoxcjtc3k0nKzjJI4me3NeRAtprc",
  authDomain: "glucotrack-47958.firebaseapp.com",
  databaseURL: "https://glucotrack-47958-default-rtdb.firebaseio.com",
  projectId: "glucotrack-47958",
  storageBucket: "glucotrack-47958.firebasestorage.app",
  messagingSenderId: "1038369727029",
  appId: "1:1038369727029:web:00403ded52e6ed32c9077c",
  measurementId: "G-RZNCQZJELN",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

export { app, auth, database };

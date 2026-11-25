// Firebase configuration for UNO RISHIKA
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAaTB1SNK6Dxw4LLU1YpGUSggnaZfgXgIk",
  authDomain: "unorishika.firebaseapp.com",
  projectId: "unorishika",
  storageBucket: "unorishika.firebasestorage.app",
  messagingSenderId: "617343883313",
  appId: "1:617343883313:web:a22d9896ed9971f1b9dd10",
  measurementId: "G-WRV45FPLXF"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Analytics conditionally (only supported in browser environments)
export let analytics = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

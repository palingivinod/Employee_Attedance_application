import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

// Load configuration securely from Vite environment variables (.env)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

let app = null;
let firestoreDb = null;
let realtimeDb = null;
let analytics = null;

try {
  if (firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
    firestoreDb = getFirestore(app);
    if (firebaseConfig.databaseURL) {
      realtimeDb = getDatabase(app);
    }
    if (typeof window !== "undefined") {
      isSupported().then((supported) => {
        if (supported) {
          analytics = getAnalytics(app);
        }
      }).catch(() => {});
    }
  }
} catch (error) {
  console.warn("Firebase initialization warning (will fallback to LocalStorage):", error);
}

export { app, firestoreDb as db, firestoreDb, realtimeDb, analytics, firebaseConfig };

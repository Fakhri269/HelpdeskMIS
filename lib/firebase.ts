import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCIfiMrduJ4tOCbpqhQNPHYOv1gQLBMawU",
  authDomain: "helpdesk-mis.firebaseapp.com",
  projectId: "helpdesk-mis",
  storageBucket: "helpdesk-mis.firebasestorage.app",
  messagingSenderId: "622684649448",
  appId: "1:622684649448:web:2b0e9490daa7def3b6165d",
  measurementId: "G-Y37RLLZLPT"
};

// Initialize Firebase only if not already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Analytics conditionally (only in browser environment)
let analytics;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, analytics };

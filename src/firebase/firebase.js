import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAL7WYa5t-8Gl6UrsEamaIhFaslWPgmBpo",
  authDomain: "nexus-chat-c7688.firebaseapp.com",
  projectId: "nexus-chat-c7688",
  storageBucket: "nexus-chat-c7688.firebasestorage.app",
  messagingSenderId: "1066884462630",
  appId: "1:1066884462630:web:176d0021b63eb2d2724ee7",
  measurementId: "G-1589RKWWCR"
};

const app = initializeApp(firebaseConfig);

let analytics = null;

isSupported()
  .then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  })
  .catch((error) => {
    console.warn("Firebase Analytics is unavailable:", error);
  });

export { app, analytics };
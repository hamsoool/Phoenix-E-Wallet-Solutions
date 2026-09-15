import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyAyubn_JmJWVYoqer3F48WUopqZFv1Z9f4",
    authDomain: "phoenix-e-wallet.firebaseapp.com",
    projectId: "phoenix-e-wallet",
    storageBucket: "phoenix-e-wallet.firebasestorage.app",
    messagingSenderId: "1043225526130",
    appId: "1:1043225526130:web:30ad455e25893db15767eb",
    measurementId: "G-EZSYB5L7PB"
  };

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app };
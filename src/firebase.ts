// Connexion Firebase (config publique fournie par la console Firebase).
// Ces clés sont publiques par nature : la sécurité est assurée par les règles Firestore + l'authentification.
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const env = import.meta.env;
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY ?? "AIzaSyAir7kG50hUYUudfsjwoifqR3Ostc8ejzA",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN ?? "boutique-as-casinca.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID ?? "boutique-as-casinca",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET ?? "boutique-as-casinca.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "269687330247",
  appId: env.VITE_FIREBASE_APP_ID ?? "1:269687330247:web:39196a3d7b9545e18875e2",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyC2yXjkCEiwkRcbXC3F-vWNEeqjP4Fpi9A",
    authDomain: "frostbyte-c7211.firebaseapp.com",
    projectId: "frostbyte-c7211",
    storageBucket: "frostbyte-c7211.firebasestorage.app",
    messagingSenderId: "620253391844",
    appId: "1:620253391844:web:2ddf598aa99a47bdc035f1",
    measurementId: "G-7YN2LY3DEF"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Eksporter tjenester
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from "firebase/auth";

// import { getFirestore, collection, getDocs } from 'firebase/firestore';
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDH7W8hzY9P7xith4jgDdcRchtD4T4E8cs",
    authDomain: "browser-livesplit.firebaseapp.com",
    projectId: "browser-livesplit",
    storageBucket: "browser-livesplit.appspot.com",
    messagingSenderId: "133429696371",
    appId: "1:133429696371:web:abb60437f2aa2ac1905706",
    measurementId: "G-31MTCLKD4T"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
// Initalize Firebase features
export const db = getFirestore(app);
export const auth = getAuth(app);

console.log('Initalized Firebase');

/**
 * Returns boolean to confirm Firebase has been initialized
 */
export const firebaseIsInitalized = () => {
    return !!app;
}

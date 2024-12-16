import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_API_KEY,
    authDomain: "chatapp-7d828.firebaseapp.com",
    projectId: "chatapp-7d828",
    storageBucket: "chatapp-7d828.appspot.com",
    messagingSenderId: "385701299329",
    appId: "1:385701299329:web:1fcf77eaab6cee27963980"
};

const app = initializeApp(firebaseConfig);

export const auth=getAuth()
export const db=getFirestore()
export const storage=getStorage()
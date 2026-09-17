import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// ถ้ายัังไม่ใช้ Analytics ให้คอมเมนต์หรือลบบรรทัดนี้ออกก่อนได้ครับเพื่อกันเหนียว
// import { getAnalytics } from "firebase/analytics"; 

const firebaseConfig = {
  apiKey: "AIzaSyBkop8zZu0SXT4l9afi4I6YLC3z-KNZ_w4",
  authDomain: "mooddrink-gen351.firebaseapp.com",
  projectId: "mooddrink-gen351",
  storageBucket: "mooddrink-gen351.firebasestorage.app",
  messagingSenderId: "610615862575",
  appId: "1:610615862575:web:76ced546bdf81e87686dda",
  measurementId: "G-X16G0Y10JV"
};


const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();


export const db = getFirestore(app);
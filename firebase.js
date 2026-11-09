// =========================================
// ROSITA'S BIRTHDAY WEBSITE — FIREBASE
// =========================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    query,
    orderBy,
    serverTimestamp,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyD_HgOLYUPxxSmVow8bE3m_FSlKa40d_AM",
    authDomain: "rosita-birthday-celebration.firebaseapp.com",
    projectId: "rosita-birthday-celebration",
    storageBucket: "rosita-birthday-celebration.firebasestorage.app",
    messagingSenderId: "853104141604",
    appId: "1:853104141604:web:25eea4cbf24cc85c79bfb1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Export Firestore functions
export {
    db,
    collection,
    addDoc,
    query,
    orderBy,
    serverTimestamp,
    onSnapshot
};
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// import { getAuth } from "firebase/auth";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/setup#config-object
const firebaseConfig = {
    apiKey: "AIzaSyDx6ccFMx1DYfOgR7TEPBoBN3x-EQ8G2eI",
    authDomain: "solroof-plant-details.firebaseapp.com",
    projectId: "solroof-plant-details",
    storageBucket: "solroof-plant-details.firebasestorage.app",
    messagingSenderId: "124400494542",
    appId: "1:124400494542:web:1a94632bd42b1640432d9f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
// const auth = getAuth(app);

export { db };

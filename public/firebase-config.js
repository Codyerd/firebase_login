// Import Firebase SDK functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendEmailVerification, sendSignInLinkToEmail, isSignInWithEmailLink,
    RecaptchaVerifier, deleteUser, PhoneAuthProvider, multiFactor } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBbMcyaySxb75YnfZi8342CwwhqgaWfbdk",
    authDomain: "test-login-app-30eb5.firebaseapp.com",
    projectId: "test-login-app-30eb5",
    storageBucket: "test-login-app-30eb5.appspot.com",
    messagingSenderId: "766937935567",
    appId: "1:766937935567:web:6d7603de720b01f74551ba",
    measurementId: "G-CQ7WRKP3C4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Export Firebase services
export { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendEmailVerification,
    sendSignInLinkToEmail, isSignInWithEmailLink, deleteUser, RecaptchaVerifier, PhoneAuthProvider, multiFactor };

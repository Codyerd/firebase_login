import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "./firebase-config.js";

const apiUrl = "http://localhost:3000";

document.addEventListener("DOMContentLoaded", () => {
    // Get button elements
    const signupButton = document.getElementById("signup");
    const signinButton = document.getElementById("signin");
    const signoutButton = document.getElementById("signout");

    // Attach event listeners with logging
    signupButton.addEventListener("click", () => {
        console.log("Sign Up button clicked");
        signup();
    });

    signinButton.addEventListener("click", () => {
        console.log("Sign In button clicked");
        signin();
    });

    signoutButton.addEventListener("click", () => {
        console.log("Sign Out button clicked");
        signout();
    });
});

// Sign Up Function
async function signup() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    console.log(`Sign Up Attempt: Email=${email}, Password=${password}`);
    try {
        const response = await fetch(`${apiUrl}/admin-create-user`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        document.getElementById("message").textContent = data.message || data.error;
    } catch (error) {
        console.error("Error signing up:", error);
    }
}

// Sign In Function
async function signin() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    console.log(`Sign In Attempt: Email=${email}, Password=${password}`);

    try {
        // Authenticate using Firebase Client SDK
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        // Get the Firebase ID token
        const idToken = await userCredential.user.getIdToken();

        console.log("Received ID token:", idToken);

        // Send the token to our backend for verification
        const response = await fetch(`${apiUrl}/verify-token`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: idToken })
        });

        const data = await response.json();
        console.log("Sign In Response:", data);

        if (data.message === "Token is valid") {
            localStorage.setItem("token", idToken);
            document.getElementById("message").textContent = "Login Successful!";
            showUser(email);
        } else {
            document.getElementById("message").textContent = "Login failed";
        }
    } catch (error) {
        console.log("Error signing in:", error);
        document.getElementById("message").textContent = error.message;
    }
}

// Sign Out Function
async function signout() {
    localStorage.removeItem("token");
    signOut(auth).then(() => {
        document.getElementById("message").textContent = "Signed out successfully!";
        document.getElementById("auth-section").style.display = "block";
        document.getElementById("user-section").style.display = "none";
    }).catch((error) => {
        console.log("Error signing out:", error);
        document.getElementById("message").textContent = error.message;
    });
}

// Show User Info
function showUser(email) {
    document.getElementById("auth-section").style.display = "none";
    document.getElementById("user-section").style.display = "block";
    document.getElementById("user-info").textContent = `Logged in as: ${email}`;
}

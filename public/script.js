import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, 
    sendSignInLinkToEmail, isSignInWithEmailLink, deleteUser, sendEmailVerification, RecaptchaVerifier, PhoneAuthProvider, multiFactor } from "./firebase-config.js";

const apiUrl = "http://localhost:3000";

document.addEventListener("DOMContentLoaded", () => {
    const signupButton = document.getElementById("signup");
    const signinButton = document.getElementById("signin");
    const signoutButton = document.getElementById("signout");

    signupButton.addEventListener("click", initiateEmailVerification);
    signinButton.addEventListener("click", signin);
    signoutButton.addEventListener("click", signout);
});

// ✅ Step 1: Send Email Verification Before Allowing Registration
async function initiateEmailVerification() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email) {
        document.getElementById("message").textContent = "Please enter a valid email.";
        return;
    }

    try {
        // ✅ Create a temporary account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);
        await signOut(auth); // ✅ Immediately log the user out to prevent unwanted access

        // ✅ Store the email temporarily to track verification
        localStorage.setItem("verifiedEmail", email);

        // ✅ Schedule deletion of unverified accounts
        setTimeout(async () => {
            const currentUser = auth.currentUser;
            if (currentUser && !currentUser.emailVerified) {
                await deleteUser(currentUser);
                console.log("Unverified account deleted:", email);
            }
        }, 15 * 60 * 1000); // 15 minutes timeout

        document.getElementById("message").textContent = "Verification email sent! Check your inbox.";
    } catch (error) {
        console.error("Error sending verification email:", error);
        document.getElementById("message").textContent = error.message;
    }
}

// ✅ Step 2: Register the User After Verification
async function signin() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        if (!userCredential.user.emailVerified) {
            document.getElementById("message").textContent = "Please verify your email before logging in.";
            await auth.signOut();
            return;
        }
        showLandingPage(email);
        document.getElementById("message").textContent = "Signed in successfully!";
    } catch (error) {
        console.error("Error signing in:", error);
        document.getElementById("message").textContent = error.message;
    }
}

// ✅ Step 3: Sign Out
async function signout() {
    try {
        await signOut(auth);
        showAuthForm();
        document.getElementById("message").textContent = "Signed out successfully!";
    } catch (error) {
        console.error("Error signing out:", error);
    }
}

function showLandingPage(email) {
    document.getElementById("auth-section").style.display = "none";
    document.getElementById("user-section").style.display = "block";
    document.getElementById("user-info").textContent = `Welcome, ${email}!`;
}

// ✅ Step 4: Show Auth Form If User is Not Logged In
function showAuthForm() {
    document.getElementById("auth-section").style.display = "block";
    document.getElementById("user-section").style.display = "none";
}
//  Sign In (Require Email Verification & SMS OTP)
// async function signin() {
//     const email = document.getElementById("email").value;
//     const password = document.getElementById("password").value;

//     try {
//         const userCredential = await signInWithEmailAndPassword(auth, email, password);

//         if (!userCredential.user.emailVerified) {
//             document.getElementById("message").textContent = "Please verify your email before logging in.";
//             await auth.signOut();
//             return;
//         }

//         // TODO: establish SMS OTP
//         // const multiFactorUser = multiFactor(userCredential.user);
//         // if (multiFactorUser.enrolledFactors.length === 0) {
//         //     await promptForPhoneNumber(userCredential.user);
//         // } else {
//         //     await startSMSVerification(userCredential.user);
//         // }
//     } catch (error) {
//         console.error("Error signing in:", error);
//         document.getElementById("message").textContent = error.message;
//     }
// }

//  Validate Phone Number Before Sending OTP
function isValidPhoneNumber(phone) {
    const phoneRegex = /^\+\d{10,15}$/; //  Ensures correct format +1234567890
    return phoneRegex.test(phone);
}

//  Add Phone Number for MFA (First-Time Setup)
async function promptForPhoneNumber(user) {
    let phoneNumber = prompt("Enter your phone number (e.g., +1603567890):");
    if (!phoneNumber || !isValidPhoneNumber(phoneNumber)) {
        document.getElementById("message").textContent = "Invalid phone number format.";
        return;
    }

    try {
        const phoneAuthProvider = new PhoneAuthProvider(auth);
        const verificationId = await phoneAuthProvider.verifyPhoneNumber(phoneNumber, window.recaptchaVerifier);

        const otp = prompt("Enter the OTP sent to your phone:");
        const credential = PhoneAuthProvider.credential(verificationId, otp);

        await multiFactor(user).enroll(credential, "Phone OTP");

        document.getElementById("message").textContent = "Phone number added successfully!";
    } catch (error) {
        console.error("Error adding phone:", error);
        document.getElementById("message").textContent = error.message;
    }
}

//  Start SMS OTP Verification (Subsequent Logins)
async function startSMSVerification(user) {
    try {
        const phoneAuthProvider = new PhoneAuthProvider(auth);
        const verificationId = await phoneAuthProvider.verifyPhoneNumber(user.phoneNumber, window.recaptchaVerifier);

        const otp = prompt("Enter the OTP sent to your phone:");
        const credential = PhoneAuthProvider.credential(verificationId, otp);

        await multiFactor(user).resolveSignIn(credential);

        document.getElementById("message").textContent = "Login successful!";
    } catch (error) {
        console.error("Error in MFA login:", error);
        document.getElementById("message").textContent = error.message;
    }
}

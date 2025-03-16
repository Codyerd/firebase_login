const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const admin = require("firebase-admin");

// Load Firebase Admin SDK
const serviceAccount = require("./admin.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
app.use(bodyParser.json());

// Serve frontend files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// API Route: Verify Firebase token
app.post("/verify-token", async (req, res) => {
  const { token } = req.body;

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    res.json({ message: "Token is valid", uid: decodedToken.uid });
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// API Route: Admin create user
app.post("/admin-create-user", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await admin.auth().createUser({ email, password });
    res.status(201).json({ message: "User created", userId: user.uid });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Catch-all route to serve `index.html` for SPA apps
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [{ username: 'newuser', password: 'password123' }]; // Stores user objects
let reviews = {}; // Stores reviews by ISBN

const SECRET_KEY = "your-secret-key"; // Use a secure key in production

// Middleware to authenticate token and extract username
const authenticateJWT = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }
    console.log("Received token:", token);   
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.username = decoded.username; // Attach username to request
        next();
    } catch (err) {
        return res.status(403).json({ message: "Invalid token" });
    }
};

// Function to check if username exists
const isValid = (username) => users.some(user => user.username === username);

// Function to authenticate user credentials
const authenticatedUser = (username, password) => 
    users.some(user => user.username === username && user.password === password);

// Login Route
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Both username and password are required" });
    }
    if (!isValid(username)) {
        return res.status(400).json({ message: "Username does not exist" });
    }
    if (!authenticatedUser(username, password)) {
        return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
    return res.status(200).json({ message: "Login successful", token });
});

// ✅ Fix: Update or Add a Book Review (Now uses JWT)
regd_users.put("/review/:isbn", authenticateJWT, (req, res) => {
    const username = req.username; // Extracted from JWT
    const { review } = req.body; // Get review from request body
    const { isbn } = req.params; // Extract ISBN from URL

    if (!review) {
        return res.status(400).json({ message: "Review is required" });
    }

    if (!reviews[isbn]) {
        reviews[isbn] = [];
    }

    const existingReviewIndex = reviews[isbn].findIndex(r => r.username === username);

    if (existingReviewIndex !== -1) {
        reviews[isbn][existingReviewIndex].review = review;
        return res.status(200).json({ message: "Review updated successfully" });
    } else {
        reviews[isbn].push({ username, review });
        return res.status(201).json({ message: "Review added successfully" });
    }
});

// ✅ Fetch all reviews for a book
regd_users.get("/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    return res.status(200).json({ reviews: reviews[isbn] || [] });
});

// ✅ Delete a Review (Only allows user to delete their own review)
regd_users.delete("/review/:isbn", authenticateJWT, (req, res) => {
    const username = req.username; // Extracted from JWT
    const { isbn } = req.params; // Extract ISBN from URL

    if (!reviews[isbn]) {
        return res.status(404).json({ message: "No reviews found for this book." });
    }

    // Find the review from the user
    const reviewIndex = reviews[isbn].findIndex(r => r.username === username);

    if (reviewIndex === -1) {
        return res.status(403).json({ message: "You can only delete your own reviews." });
    }

    // Remove the review
    reviews[isbn].splice(reviewIndex, 1);

    return res.status(200).json({ message: "Review deleted successfully" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
module.exports.reviews = reviews;

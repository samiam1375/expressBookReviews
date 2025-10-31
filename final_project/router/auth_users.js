const express = require('express');
const jwt = require('jsonwebtoken'); // For creating and verifying JSON Web Tokens
let books = require("./booksdb.js"); // Assuming this exports the 'books' object directly
const regd_users = express.Router();

// This array will hold our registered users.
// It's the same 'users' array that general.js's /register endpoint modifies.
let users = [];

// Helper function to check if a username is valid (e.g., not empty)
const isValid = (username) => { //returns boolean
  return (username && username.trim().length > 0);
}

// Helper function to check if username and password match a registered user
const authenticatedUser = (username, password) => { //returns boolean
  let validusers = users.filter((user) => {
    return (user.username === username && user.password === password)
  });
  if (validusers.length > 0) {
    return true;
  } else {
    return false;
  }
}

// Only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required for login." });
  }

  // Validate the provided username and password against registered users
  if (authenticatedUser(username, password)) {
    // IMPORTANT: This JWT_SECRET must match the one in your index.js
    // It's used to sign the token, ensuring its authenticity.
    let accessToken = jwt.sign({
      data: username // The payload: we're storing the username in the token
    }, "your_jwt_secret_key", { expiresIn: 60 * 60 }); // Token expires in 1 hour

    // Save the user credentials (JWT) for the session
    req.session.authorization = {
      accessToken: accessToken,
      username: username // Store username in session for easy access in protected routes
    }
    return res.status(200).json({ message: "User successfully logged in", token: accessToken });
  } else {
    // If credentials do not match, return an unauthorized error
    return res.status(401).json({ message: "Invalid Login. Check username and password." });
  }
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review; // Assuming review content is passed as a query parameter
  // The username is retrieved from the session, which was set during successful login
  const username = req.session.authorization.username;

  if (!review) {
    return res.status(400).json({ message: "Review content cannot be empty." });
  }

  if (books[isbn]) {
    // Ensure the reviews object exists for the book
    if (!books[isbn].reviews) {
      books[isbn].reviews = {};
    }
    // Add or update the review for the authenticated user
    books[isbn].reviews[username] = review;
    return res.status(200).json({ message: `Review for ISBN ${isbn} by user ${username} added/updated successfully.` });
  } else {
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users; // Export the users array so general.js can use it for registration

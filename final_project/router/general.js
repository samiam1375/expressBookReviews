const express = require('express');
let books = require("./booksdb.js"); // Assuming this exports the 'books' object directly
let isValid = require("./auth_users.js").isValid; // Assuming this exports a function named 'isValid'
let users = require("./auth_users.js").users; // Assuming this exports an array named 'users'
const public_users = express.Router();

// Helper function to check if a username already exists
const doesExist = (username) => {
  let userswithsamename = users.filter((user) => {
    return user.username === username
  });
  if (userswithsamename.length > 0) {
    return true;
  } else {
    return false;
  }
}

// Register a new user
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!doesExist(username)) {
      users.push({ "username": username, "password": password });
      return res.status(200).json({ message: "User successfully registered. Now you can login." });
    } else {
      return res.status(409).json({ message: "User already exists!" });
    }
  }
  return res.status(400).json({ message: "Unable to register user. Username and password are required." });
});

// Get the list of all books available in the shop using Promise callbacks
public_users.get('/', function (req, res) {
  const getBooksPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(books);
    }, 500); // Simulate a 500ms delay
  });

  getBooksPromise.then((bookList) => {
    return res.status(200).send(JSON.stringify(bookList, null, 4));
  }).catch((error) => {
    return res.status(500).json({ message: "Error retrieving books.", error: error.message });
  });
});

// Get book details based on ISBN using Promise callbacks
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  const getBookByIsbnPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      if (books[isbn]) {
        resolve(books[isbn]);
      } else {
        reject(new Error("Book not found."));
      }
    }, 300); // Simulate a 300ms delay
  });

  getBookByIsbnPromise.then((bookDetails) => {
    return res.status(200).json(bookDetails);
  }).catch((error) => {
    return res.status(404).json({ message: error.message });
  });
});

// Get book details based on author using Promise callbacks
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;

  const getBooksByAuthorPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      let booksByAuthor = {};
      let found = false;

      for (const isbn in books) {
        if (books[isbn].author === author) {
          booksByAuthor[isbn] = books[isbn];
          found = true;
        }
      }

      if (found) {
        resolve(booksByAuthor);
      } else {
        reject(new Error("No books found by this author."));
      }
    }, 400); // Simulate a 400ms delay
  });

  getBooksByAuthorPromise.then((bookList) => {
    return res.status(200).json(bookList);
  }).catch((error) => {
    return res.status(404).json({ message: error.message });
  });
});

// Get all books based on title using Promise callbacks
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;

  const getBooksByTitlePromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      let booksByTitle = {};
      let found = false;

      for (const isbn in books) {
        if (books[isbn].title === title) {
          booksByTitle[isbn] = books[isbn];
          found = true;
        }
      }

      if (found) {
        resolve(booksByTitle);
      } else {
        reject(new Error("No books found with this title."));
      }
    }, 450); // Simulate a 450ms delay
  });

  getBooksByTitlePromise.then((bookList) => {
    return res.status(200).json(bookList);
  }).catch((error) => {
    return res.status(404).json({ message: error.message });
  });
});

// Get book review for a given ISBN
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews);
  } else {
    return res.status(404).json({ message: "Book not found." });
  }
});

module.exports.general = public_users;

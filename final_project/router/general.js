const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    // Retrieve username and password from the request body
  const { username, password } = req.body;

  // Check if both username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Both username and password are required" });
  }

  // Check if the username already exists
  if (users[username]) {
    return res.status(400).json({ message: "Username already exists" });
  }

  // Add the new user to the users object
  users[username] = { username, password }; // You can store hashed passwords in a real app

  // Return a success message
  return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
   // Use JSON.stringify to send the list of books in a pretty format
   return res.status(200).json(JSON.parse(JSON.stringify(books)));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
     // Retrieve the ISBN from the request parameters
  const isbn = req.params.isbn;

  // Check if the book exists by ISBN
  const book = books[isbn]; // Assuming `books` is an object where ISBN is the key

  if (book) {
    // If the book is found, return the book details
    return res.status(200).json(book);
  } else {
    // If the book is not found, return an error message
    return res.status(404).json({ message: "Book not found" });
  }
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
   // Retrieve the author's name from the request parameters
  const author = req.params.author.toLowerCase();

  // Create an array to hold the books by the requested author
  const booksByAuthor = [];

  // Iterate over the books to find matching authors
  for (let isbn in books) {
    if (books[isbn].author.toLowerCase() === author) {
      // If the author matches, add the book to the array
      booksByAuthor.push(books[isbn]);
    }
  }

  // If books by the author are found, return them
  if (booksByAuthor.length > 0) {
    return res.status(200).json(booksByAuthor);
  } else {
    // If no books are found by the author, return an error message
    return res.status(404).json({ message: "No books found by this author" });
  }

});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

module.exports.general = public_users;

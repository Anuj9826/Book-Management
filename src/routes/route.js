const express = require('express');
const router = express.Router();
const userController = require("../controller/userController");
const booksController = require("../controller/booksController");
const reviewController = require("../controller/reviewController");
const commnMid = require("../middleware/auth");

// ---------------------------- USER APIs ------------------------------------------ //

router.post("/register", userController.createUser)
router.post("/login", userController.loginUser)

// ---------------------------- BOOKS APIs ------------------------------------------ //

router.post("/books", commnMid.Authentication, commnMid.Auth2, booksController.createBook)
router.get('/books', commnMid.Authentication, booksController.getBook)
router.get('/books/:bookId', commnMid.Authentication, booksController.getBookById)
router.put('/books/:bookId', commnMid.Authentication, commnMid.AuthByQuery, booksController.updateBook)
router.delete('/books/:bookId', commnMid.Authentication, commnMid.AuthByQuery, booksController.deleteBookById)

// ---------------------------- Review APIs ------------------------------------------ //

router.post("/books/:bookId/review", reviewController.createReview)
router.put("/books/:bookId/review/:reviewId", reviewController.updateReview)
router.delete("/books/:bookId/review/:reviewId", reviewController.deleteReview)

router.all("/**", function (req, res) {    // To check whether correct api is provided or not
    res.status(404).send({
        status: false,
        msg: "The api you request is not available"
    })
})


module.exports = router;
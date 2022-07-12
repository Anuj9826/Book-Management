const userModel = require("../models/userModel");
const booksModel = require("../models/booksModel");
const reviewModel = require("../models/reviewModel");

// ------------------------------------------------ CREATE Reviews ----------------------------------------------------------------------- \\

const createReview = async function (req, res) {
  try {
    let data = req.body
    let BookId = req.params.bookId

    if (Object.keys(data).length == 0) { 
      return res.status(400).send({ status: false, msg: "Please provide your Book details in body" }) };

    if (!(/^[0-9a-fA-F]{24}$/.test(BookId))) { 
      return res.status(400).send({ status: false, message: "BookId format isn't correct" }) }


    if (!req.body.reviewedBy) req.body.reviewedBy = "Guest";
    else if ((req.body.reviewedBy).trim().length == 0) {
      return res.status(400).send({ status: false, msg: "Please provide reviewedBy name" })
    } else if (/\d/.test(req.body.reviewedBy)) {
      return res.status(400).send({ status: false, message: "reviewedBy cannot have numbers" });
    }
    else {
      req.body.reviewedBy;
    }

    if (!req.body.bookId) req.body.bookId = BookId

    if (!req.body.reviewedAt) req.body.reviewedAt = new Date()

    if (!data.rating) { return res.status(400).send({ status: false, msg: "Rating field is required" }) };

    if (data.rating) {
      if (!(data.rating >= 1 && data.rating <= 5)) {
        return res.status(400).send({ status: false, message: "Rating must be in between 1 to 5." })
      }
    }

    if((data.isDeleted)===true)
        return res.status(400).send({status:false,msg:"This isDeleted field value sholud be in false"})

    let book = await booksModel.findOne({ _id: req.params.bookId, isDeleted: false });
    if (!book) { return res.status(404).send({ status: false, message: "BookId Not Found" }) };

    const reviewData = await reviewModel.create(data)
   

    let finalData = {
      _id: reviewData._id,
      bookId: book._id,
      reviewedBy: reviewData.reviewedBy,
      reviewedAt: reviewData.reviewedAt,
      rating: reviewData.rating,
      review: reviewData.review
    }
    let bookData ={
      _id: book._id,
      title: book.title,
      excerpt: book.excerpt,
      userId: book.userId,
      category: book.category,
      subcategory: book.subcategory,
      isDeleted: book.isDeleted,
      reviews: book.reviews,
      releasedAt: book.releasedAt,
      createdAt: book.createdAt,
      updatedAt: book.updatedAt,
      reviewsData:finalData
    }
    // if (/\d/.test(req.body.review)) {
    //   return res.status(400).send({ status: false, message: "review cannot have numbers" });
    // }
    const countData = await reviewModel.countDocuments({ bookId: BookId, isDeleted: false })
    const updateReview = await booksModel.findByIdAndUpdate({ _id: BookId }, { $set: { reviews: countData } }, { new: true })

    { return res.status(201).send({status:true, message:"Success", data:bookData}) }
  }
  catch (err) {
    { return res.status(500).send({ status: false, msg: "Error", error: err.message }); }
  }
};

// ----------------------------------------- UPDATE /books/:bookId/review/:reviewId ------------------------------------------------------ \\

const updateReview = async function (req, res) {
  try {
    let bookId = req.params.bookId;
    let reviewId = req.params.reviewId;
    let data = req.body;

    if (!/^[0-9a-fA-F]{24}$/.test(bookId)) {
      return res.status(400).send({ status: false, message: "BookId format isn't correct" });
    }

    let book = await booksModel.findById({ _id: bookId });
    if (!book || book.isDeleted == true) {
      return res.status(404).send({ status: false, message: "No Book Found by this BookId" });
    }
    //seperate them
    if (!/^[0-9a-fA-F]{24}$/.test(reviewId)) {
      return res.status(400).send({ status: false, message: "ReviewId format isn't correct" });
    }

    let review = await reviewModel.findById({ _id: reviewId });
    if (!review || review.isDeleted == true) {
      return res.status(404).send({ status: false, message: "No Review Found by this reviewId" });
    }

    if (Object.keys(data).length == 0) {
      return res.status(400).send({ status: false, msg: "Please provide your Review details in body", });
    }

    if (data.reviewedBy) {
      if (!data.reviewedBy.match(/^[a-zA-Z. ]+$/)) {
        return res.status(400).send({ status: false, msg: "Reviewer can't be a number" })
      }
    }
    if(!data.reviewedBy)req.body.reviewedBy="Guest"
    else if (data.reviewedBy.trim().length == 0) {
      return res.status(400).send({ status: false, msg: "Please provide reviewedBy name" })
    }

    if (data.rating) {
      if (!(data.rating >= 1 && data.rating <= 5)) {
        return res.status(400).send({ status: false, message: "Rating must be in between 1 to 5." })
      }
    }
    if (data.review.trim().length == 0) {
      return res.status(400).send({ status: false, msg: "Please provide review" })
    }
    if (data.review) {
      if (!data.review.match(/^[a-zA-Z. ]+$/)) {
        return res.status(400).send({ status: false, msg: "Review can't be a number" })
      }
    }

    let updateReviewData = await reviewModel.findOneAndUpdate(
      { _id: reviewId }, { $set: { reviewedBy: data.reviewedBy, rating: data.rating, review: data.review }, }, { new: true });
    let data3 = await reviewModel.find({ _id: reviewId, isDeleted: false })

    const data2 = {
      _id: book._id,
      title: book.title,
      excerpt: book.excerpt,
      userId: book.userId,
      category: book.category,
      subcategory: book.subcategory,
      isDeleted: book.isDeleted,
      reviews: book.reviews,
      releasedAt: book.releasedAt,
      createdAt: book.createdAt,
      updatedAt: book.updatedAt,
      reviewsData: data3.length == 0 ? [] : data3
    };

    { return res.status(200).send({ status: true, message: "Books list", data: data2 }); }

  } catch (err) {
    { return res.status(500).send({ status: false, msg: "Error", error: err.message }); }
  }
};

// ---------------------------------------- DELETE /books/:bookId/review/:reviewId ------------------------------------------------------- \\

const deleteReview = async function (req, res) {
  try {
    let book_id = req.params.bookId;
    let review_id = req.params.reviewId;

    if (!/^[0-9a-fA-F]{24}$/.test(book_id)) { 
      return res.status(400).send({ status: false, message: "BookId format isn't correct" }); }

    let book = await booksModel.findOne({ _id: book_id, isDeleted: false });
    //console.log(book)

    if (!book) {
      return res.status(404).send({ status: false, message: "Book not found" });
    }

    //write validation for bothb cases
    if (!/^[0-9a-fA-F]{24}$/.test(review_id)) {
      return res.status(400).send({ status: false, message: "ReviewId format isn't correct" });
    }

    let checkReview = await reviewModel.findOne({ _id: review_id});

    if (!checkReview) {
      return res.status(404).send({ status: false, message: "Review not found" });
    }
    else if(checkReview.isDeleted==true){
      return res.status(404).send({status:false, message:"Review already deleted"})
    }

    const deleteReviewData = await reviewModel.findOneAndUpdate({ _id: review_id }, { $set: { isDeleted: true, deletedAt: new Date() } }, { new: true });
    let countData1 = await reviewModel.countDocuments({ bookId: book_id, isDeleted: false })
    // console.log(countData1)
    const updateReview = await booksModel.findByIdAndUpdate({ _id: book_id }, { $set: { reviews: countData1 } }, { new: true })

    {
      return res.status(200).send({ status: true, message: "Review is deleted succesfully" });
    }
  } catch (err) {
    {
      return res.status(500).send({ status: false, error: err.message });
    }
  }
};
module.exports = { updateReview, createReview, deleteReview };
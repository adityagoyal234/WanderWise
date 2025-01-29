const express=require("express");
const router=express.Router({meregParams:true});
const Listing = require("../models/listing.js");
const  wrapAsync=require("../utils/wrapAsync.js");
const ExpressError=require("../utils/ExpressError.js");
const {reviewSchema}=require("../schema.js")
const Review=require("../models/review.js");
const validateReview=(req,res,next)=>{
    const error=reviewSchema.validate(req.body);
    if(error && error.details){
      const errorMessage = error.details.map((e) => e.message).join(", "); 
      throw new ExpressError(400, errorMessage);
    }else{
      next();
    }
     
  };


// POST Reviews  route  //
router.post("/",validateReview, wrapAsync(async(req,res)=>{
  const ObjectId = require('mongoose').Types.ObjectId;
if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid ID format' });
}
    console.log("Request body:", req.body); 
    console.log("Listing ID:", req.params.id)
    console.log(req.params.id);
    let listing=await Listing.findById(req.params.id);
    let newReview=new Review(req.body.review);
    console.log('Listing Reviews:', listing.reviews);

    listing.reviews.push(newReview._id); 
    await newReview.save();
    await listing.save();
    res.redirect(`/listings/${listing._id}`)
   
   }));
   router.delete("/:reviewId", async (req, res) => {
     console.log(`Delete request for reviewId: ${req.params.reviewId} in listingId: ${req.params.id}`);
       await Listing.findByIdAndUpdate(req.params.id, { $pull: { reviews: req.params.reviewId } });
       await Review.findByIdAndDelete(req.params.reviewId);
       res.redirect(`/listings/${req.params.id}`);
     
   });
//it is not working file//
   module.exports=router;
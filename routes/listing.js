const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js")
const Listing = require("../models/listing.js");
const multer = require('multer');
const { storage } = require("../cloudConfig..js")
const upload = multer({ storage });
const { isLoggedIn, isHost, isAdmin } = require("../middleware/auth.js");
const validateListing = (req, res, next) => {
  const error = listingSchema.validate(req.body);

  if (error && error.details) {
    const errorMessage = error.details.map((e) => e.message).join(", ");
    throw new ExpressError(400, errorMessage);
  } else {
    next();
  }

};
const savaRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

//Index Route with Search, Pagination, Filters, and Sorting
router.get("/", wrapAsync(async (req, res) => {
  const { search, minPrice, maxPrice, location, sort, page = 1 } = req.query;
  const limit = 4;
  const skip = (parseInt(page) - 1) * limit;

  // Initialize query object with all conditions
  const query = {
    $and: []
  };

  // Search query
  if (search) {
    query.$and.push({
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    });
  }

  // Location filter
  if (location) {
    query.$and.push({
      location: { $regex: location, $options: 'i' }
    });
  }

  // Price range filter
  if (minPrice || maxPrice) {
    const priceQuery = {};
    if (minPrice) priceQuery.$gte = Number(minPrice);
    if (maxPrice) priceQuery.$lte = Number(maxPrice);
    query.$and.push({ price: priceQuery });
  }

  // If no conditions were added, remove $and operator
  if (query.$and.length === 0) {
    delete query.$and;
  }

  // Sort options
  let sortOption = { createdAt: -1 }; // Default sort by newest
  if (sort === 'price_asc') sortOption = { price: 1 };
  else if (sort === 'price_desc') sortOption = { price: -1 };
  else if (sort === 'rating_desc') sortOption = { rating: -1 };

  // Get total count for pagination
  const total = await Listing.countDocuments(query);
  const totalPages = Math.ceil(total / limit);

  // Get listings with pagination
  const listings = await Listing.find(query)
    .sort(sortOption)
    .skip(skip)
    .limit(limit);

  // Build query string for pagination links
  const queryParams = new URLSearchParams();
  if (search) queryParams.append('search', search);
  if (minPrice) queryParams.append('minPrice', minPrice);
  if (maxPrice) queryParams.append('maxPrice', maxPrice);
  if (location) queryParams.append('location', location);
  if (sort) queryParams.append('sort', sort);
  const queryString = queryParams.toString() ? `&${queryParams.toString()}` : '';

  // Log the query for debugging
  console.log('Final Query:', JSON.stringify(query, null, 2));
  console.log('Query params:', req.query);

  res.render("index.ejs", {
    listings,
    currentPage: parseInt(page),
    totalPages,
    queryString,
    query: req.query  // Pass the raw query parameters
  });
}));

// Auto-suggest endpoint
router.get("/suggest", wrapAsync(async (req, res) => {
  const searchQuery = req.query.q || "";
  const suggestions = await Listing.find({
    $or: [
      { title: { $regex: searchQuery, $options: 'i' } },
      { location: { $regex: searchQuery, $options: 'i' } }
    ]
  })
    .select('title location')
    .limit(5);

  res.json(suggestions);
}));

// Auto-suggest API endpoint
router.get("/api/suggestions", wrapAsync(async (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 2) {
    return res.json([]);
  }

  // Get unique locations that match the query
  const locations = await Listing.distinct("location", {
    location: { $regex: q, $options: 'i' }
  });

  // Get unique titles that match the query
  const titles = await Listing.distinct("title", {
    title: { $regex: q, $options: 'i' }
  });

  // Combine and limit suggestions
  const suggestions = [...new Set([...locations, ...titles])].slice(0, 5);
  res.json(suggestions);
}));

//New Route
router.get("/new", (req, res) => {
  console.log(req.user);
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged in to create a listing!");
    return res.redirect("/login");
  }
  res.render("new.ejs");
});


// Create Route
router.post("/", upload.single("listing[image]"),
  validateListing,
  wrapAsync(async (req, res, next) => {
    if (!req.isAuthenticated()) {
      req.session.redirectUrl = req.originalUrl;
      req.flash("error", "You must be logged in to create a listing!");
      return res.redirect("/login");
    }
    upload.single("listing[image]");

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    // Flash success message and redirect
    req.flash("success", "New listing created !")
    res.redirect("/listings");
  }));



//Edit Route
router.get("/:id/edit", isLoggedIn, wrapAsync(async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);

  // Debug logs
  console.log("Edit attempt - Current user:", {
    id: req.user._id,
    username: req.user.username,
    role: req.user.role
  });

  const isUserAdmin = req.user.role === 'admin';
  const isUserOwner = listing.owner.equals(req.user._id);

  if (!isUserAdmin && !isUserOwner) {
    req.flash("error", "You don't have permission to edit this listing");
    return res.redirect(`/listings/${listing._id}`);
  }

  res.render("edit.ejs", { listing });
}));

//Update Route
router.put("/:id", isLoggedIn, validateListing, wrapAsync(async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);

  // Debug logs
  console.log("Update attempt - Current user:", {
    id: req.user._id,
    username: req.user.username,
    role: req.user.role
  });

  const isUserAdmin = req.user.role === 'admin';
  const isUserOwner = listing.owner.equals(req.user._id);

  if (!isUserAdmin && !isUserOwner) {
    req.flash("error", "You don't have permission to update this listing");
    return res.redirect(`/listings/${listing._id}`);
  }

  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  req.flash("success", "Listing Updated")
  res.redirect(`/listings/${id}`);
}));

//Delete Route
router.delete("/:id", isLoggedIn, wrapAsync(async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);

  // Debug logs
  console.log("Delete attempt - Current user:", {
    id: req.user._id,
    username: req.user.username,
    role: req.user.role
  });
  console.log("Listing owner:", listing.owner);

  // Check if user is admin
  const isUserAdmin = req.user.role === 'admin';
  const isUserOwner = listing.owner.equals(req.user._id);

  console.log("Permission check:", {
    isUserAdmin,
    isUserOwner,
    canDelete: isUserAdmin || isUserOwner
  });

  if (!isUserAdmin && !isUserOwner) {
    req.flash("error", "You don't have permission to delete this listing");
    return res.redirect(`/listings/${id}`);
  }

  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log("Successfully deleted listing:", deletedListing);
  req.flash("success", "Listing deleted!")
  res.redirect("/listings");
}));

module.exports = router;
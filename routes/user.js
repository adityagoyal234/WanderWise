const express = require("express");
const router = express.Router();
const User = require("../models/user");
const passport = require("passport");
const { isAdmin } = require("../middleware/auth");

// Root route
router.get("/", (req, res) => {
  res.redirect("/listings");
});

// Check current user role
router.get("/check-role", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.json({ error: "Not logged in" });
  }
  console.log("Current user:", req.user);
  res.json({
    user: req.user.username,
    role: req.user.role,
    id: req.user._id
  });
});

// Update user role (admin only)
router.post("/update-role/:userId", isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['user', 'host', 'admin'].includes(role)) {
      req.flash("error", "Invalid role");
      return res.redirect("/listings");
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    );

    console.log("Updated user:", user);
    req.flash("success", `User role updated to ${role}`);
    res.redirect("/listings");
  } catch (error) {
    console.error("Error updating role:", error);
    req.flash("error", "Failed to update role");
    res.redirect("/listings");
  }
});

router.get("/signup", (req, res) => {
  res.render("user/signup");
});


router.post("/signup",
  async (req, res) => {
    try {
      let { username, email, password, role } = req.body;
      const newUser = new User({ email, username, role });
      const registeredUser = await User.register(newUser, password);
      console.log("Registered user:", registeredUser); // Debug log

      req.login(registeredUser, (err) => {
        if (err) {
          return next(err);
        }
        req.flash("success", "Welcome to Wonderlust!");
        res.redirect("/listings");
      });
    } catch (e) {
      req.flash("error", e.message);
      res.redirect("/signup");
    }
  });
const savaRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};
router.get("/login", (req, res) => {
  res.render("user/login");
});
router.post("/login", savaRedirectUrl,
  passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
  async (req, res) => {
    req.flash("success", "Welcome back to Wonderlust!");
    let redirectUrl = req.session.redirectUrl || "/listings";
    // res.redirect(res.locals.redirectUrl);
    res.redirect(redirectUrl);
  }
);


router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "you are logged out now!");
    res.redirect("/listings")
  })
})

module.exports = router;

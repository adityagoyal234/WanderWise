const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in to access this page!");
        return res.redirect("/login");
    }
    next();
};

const isAdmin = (req, res, next) => {
    console.log("Checking admin access for user:", req.user);
    console.log("User role:", req.user?.role);

    if (!req.isAuthenticated() || req.user.role !== 'admin') {
        console.log("Admin access denied");
        req.flash("error", "You don't have permission to access this page!");
        return res.redirect("/listings");
    }
    console.log("Admin access granted");
    next();
};

const isHost = (req, res, next) => {
    if (!req.isAuthenticated() || (req.user.role !== 'host' && req.user.role !== 'admin')) {
        req.flash("error", "You don't have permission to access this page!");
        return res.redirect("/listings");
    }
    next();
};

module.exports = { isLoggedIn, isAdmin, isHost }; 
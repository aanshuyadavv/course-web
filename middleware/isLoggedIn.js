const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

module.exports.isLoggedIn = async (req, res, next) => {
  //   console.log(req.cookies);
  if (!req.cookies.token) {
    req.flash("message", "Access denied. Please log in.");
    res.redirect("/user/login");
    return;
  }

  try {
    const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
    console.log(decoded);

    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(404).send("User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    res.status(400).send("Invalid token.");
  }
};

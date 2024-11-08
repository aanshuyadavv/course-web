module.exports.isAdmin = async (req, res, next) => {
  //   console.log(req.user);
  if (req.user && req.user.role === "admin") {
    return next();
  }
  req.flash("error", "You do not have permission to perform this action.");
  res.redirect("/course/all");
};

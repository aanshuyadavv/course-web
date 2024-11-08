const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const { isLoggedIn } = require("../middleware/isLoggedIn");

router.get("/", (req, res) => {
  res.render("user home page");
});

router.post("/register", async (req, res) => {
  try {
    console.log(req.body);
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.send("fill all details");
    }

    const existUser = await User.findOne({ email });
    if (existUser) {
      req.flash("message", "User with this email exists. Login");
      res.redirect("/");
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const newUser = new User({ name, email, password: hash, role });
    await newUser.save();
    req.flash("message", "user registered successfully");
    res.redirect("/course/all");
    return;
  } catch (error) {
    console.log(error);
    res.send("registration failed");
  }
});
router.get("/login", async (req, res) => {
  const message = req.flash("message");
  res.render("login", { message });
});
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.send("fill all details");
    }

    const existUser = await User.findOne({ email });
    if (!existUser) {
      req.flash("message", "user doesn't exist, please register");
      res.redirect("/user/login");
      return;
    }

    const result = await bcrypt.compare(password, existUser.password);
    if (result) {
      const token = jwt.sign(
        { email: existUser.email },
        process.env.JWT_SECRET
      );
      res.cookie("token", token);
      req.flash("message", "successfully logged in");
      res.redirect("/course/all");
      return;
    } else {
      req.flash("message", "invalid password");
      res.redirect("/user/login");
      return;
    }
  } catch (error) {
    console.log(error);
    res.send("login failed");
  }
});
router.post("/logout", isLoggedIn, async (req, res) => {
  try {
    res.cookie("token", "", { expires: new Date(0) });
    res.send("logged out successfully");
  } catch (error) {
    console.log(error);
    res.send("logout failed");
  }
});

module.exports = router;

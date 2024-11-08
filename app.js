const express = require("express");
const app = express();
const db = require("./config/mongoose-connection");
const port = 3000;
const user = require("./routes/User");
const course = require("./routes/Course");
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");
const methodOverride = require("method-override");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const { isLoggedIn } = require("./middleware/isLoggedIn");
const { isAdmin } = require("./middleware/isAdmin");

app.use(
  session({
    secret: "geeksforgeeks",
    saveUninitialized: true,
    resave: true,
  })
);

app.use(flash());
app.use(methodOverride("_method"));

app.use(cookieParser());
require("dotenv").config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

db();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

app.post("/create-order", isLoggedIn, async (req, res) => {
  try {
    const options = {
      amount: 50000, // Amount in smallest currency unit (e.g., for INR, 50000 = Rs. 500)
      currency: "INR",
      receipt: "receipt_order_74394",
    };
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post("/verify-payment", (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  const generated_signature = crypto
    .createHmac("sha256", "YOUR_SECRET_KEY")
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (generated_signature === razorpay_signature) {
    res.send("Payment verified successfully");
  } else {
    res.status(400).send("Invalid payment verification");
  }
});

app.get("/", (req, res) => {
  const message = req.flash("message");
  res.render("index", { message });
});
app.use("/user", user);
app.use("/course", course);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

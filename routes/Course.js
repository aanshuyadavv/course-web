const express = require("express");
const router = express.Router();
const Course = require("../models/courseModel");
const { isLoggedIn } = require("../middleware/isLoggedIn");
const { isAdmin } = require("../middleware/isAdmin");
const upload = require("../config/multer-config");
const User = require("../models/userModel");

// Get all courses
router.get("/all", isLoggedIn, async (req, res) => {
  try {
    const role = req.user.role;
    console.log(role);

    const allCourses = await Course.find({});
    const message = req.flash("message");
    const error = req.flash("error");
    res.render("courses", { allCourses, message, error, role });
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).send("Error fetching courses");
  }
});

router.get("/create", isLoggedIn, isAdmin, async (req, res) => {
  res.render("createCourse");
});
// Create a new course
router.post(
  "/create",
  isLoggedIn,
  isAdmin,
  upload.single("image"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).send("Image file is required");
    }
    const image = req.file.buffer.toString("base64");
    const { title, description, price, category } = req.body;
    if (!title || !description || !price || !category) {
      return res.status(400).send("Fill all the fields");
    }

    const createdBy = req.user;
    const id = createdBy._id.toString();
    // console.log(id);

    try {
      const newCourse = new Course({
        image,
        title,
        description,
        price,
        category,
        createdBy: id,
      });
      await newCourse.save();

      const findUser = await User.findById(id);
      // console.log(findUser);
      findUser.courses.push(newCourse);
      await findUser.save();
      req.flash("message", "New course added");
      res.redirect("/course/all");
    } catch (error) {
      console.error(error);
      res.status(500).send("Error adding course");
    }
  }
);

// Get a single course by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const findCourse = await Course.findById(id);
    if (!findCourse) {
      return res.status(404).send("Course not found");
    }
    res.render("oneCourse", { findCourse });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching course");
  }
});

router.get("/update/:id", isLoggedIn, isAdmin, async (req, res) => {
  const { id } = req.params;
  const findCourse = await Course.findById(id);
  res.render("updateForm", { findCourse });
});
// Update a course by ID
router.put(
  "/update/:id",
  isLoggedIn,
  isAdmin,
  upload.single("image"),
  async (req, res) => {
    const { id } = req.params;
    //   console.log(id)
    if (!req.file) {
      return res.status(400).send("Image file is required");
    }
    const image = req.file.buffer.toString("base64");
    const { title, description, price, category } = req.body;
    if (!title || !description || !price || !category) {
      return res.status(400).send("Fill all the fields");
    }

    try {
      const updatedCourse = await Course.findByIdAndUpdate(
        id,
        { image, title, description, price, category },
        {
          new: true,
        }
      );
      if (!updatedCourse) {
        return res.status(404).send("Course not found");
      }
      req.flash("message", "Course Updated");
      res.redirect("/course/all");
    } catch (error) {
      console.error(error);
      res.status(500).send("Error updating course");
    }
  }
);

// Delete a course by ID
router.delete("/delete/:id", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const findCourseToDlt = await Course.findById(id);
    const deletedCourse = await Course.findByIdAndDelete(id);
    if (!deletedCourse) {
      return res.status(404).send("Course not found");
    }

    const createdBy = req.user;
    const userid = createdBy._id.toString();

    const findUser = await User.findById(userid);
    // console.log(findUser);
    findUser.courses.pull(findCourseToDlt);
    await findUser.save();
    req.flash("message", "Course Deleted");
    res.redirect("/course/all");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting course");
  }
});

module.exports = router;

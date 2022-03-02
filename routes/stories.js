const express = require("express");
const Story = require("../models/Story");
const { ensureAuth } = require("./../middleware/auth");

const router = express.Router();

// @desc   Add Story Page
// @desc GET  /stories/add

router.get("/", ensureAuth, async (req, res) => {
  try {
    const stories = await Story.find({ status: "public" })
      .populate("user")
      .sort({ createdAt: "desc" })
      .lean();
    res.render("stories/index.hbs", { stories });
  } catch (error) {
    console.log(error);
    res.render("error/500.hbs");
  }
});

// @desc   Add Story Page
// @desc GET  /stories/add

router.get("/add", ensureAuth, (req, res) => {
  res.render("stories/add.hbs");
});

// @desc   Add Story
// @desc POST  /stories/add
router.post("/add", ensureAuth, async (req, res) => {
  try {
    const story = {
      title: req.body.title,
      body: req.body.body,
      user: req.user.id,
      status: req.body.status,
      user: req.user.id,
    };
    const result = await Story.create(story);
    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
    res.render("error/500.hbs");
  }
});

// @desc   Get Story
// @desc   /stories/:id
router.get("/:id", ensureAuth, async (req, res) => {
  try {
    const story = await Story.findOne({ _id: req.params.id })
      .populate("user")
      .lean();
    if (!story) {
      return res.render("error/404.hbs");
    }
    res.render("stories/show.hbs", { story });
  } catch (error) {
    console.log(error);
    res.render("error/500.hbs");
  }
});

// @desc User stories
// @desc GET /stories/user/:id
router.get("/user/:userId", ensureAuth, async (req, res) => {
  try {
    const stories = await Story.find({
      user: req.params.userId,
      status: "public",
    })
      .populate("user")
      .lean();
    if (!stories) {
      return res.render("error/500.hbs");
    }
    res.render("stories/index.hbs", { stories });
  } catch (error) {
    console.log(error);
    res.render("error/500.hbs");
  }
});

// @desc   Edit Story Page
// @desc   /stories/edit/:id
router.get("/edit/:id", ensureAuth, async (req, res) => {
  try {
    const story = await Story.findOne({ _id: req.params.id }).lean();
    if (!story) {
      return res.render("error/404/hbs");
    }
    if (!story.user === req.user.id) {
      return res.redirect("/stories");
    }
    res.render("stories/edit.hbs", { story });
  } catch (error) {
    console.log(error);
    res.render("error/500.hbs");
  }
});

// @desc Update story
// @desc PUt/astories/:id

router.put("/:id", ensureAuth, async (req, res) => {
  try {
    let story = await Story.findById(req.params.id).lean();
    if (!story) {
      return res.render("error/404/hbs");
    }
    if (!story.user === req.user.id) {
      return res.redirect("/stories");
    }
    story = await Story.findByIdAndUpdate({ _id: req.params.id }, req.body, {
      new: true,
      runValidators: true,
    });
    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
    res.render("error/500.hbs");
  }
});

// @desc   Delete Story
// @desc   /stories/:id
router.delete("/:id", ensureAuth, async (req, res) => {
  try {
    const story = await Story.findByIdAndDelete(req.params.id);
    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
    res.render("error/500.hbs");
  }
});

module.exports = router;

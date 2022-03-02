const express = require("express");
const { ensureAuth, ensureGuest } = require("./../middleware/auth");
const router = express.Router();
const Story = require("./../models/Story");

// @login routes
// GET

router.get("/", ensureGuest, (req, res) => {
  res.render("login.hbs", {
    layout: "login.hbs",
  });
});

// @dashboard routes
// GET
router.get("/dashboard", ensureAuth, async (req, res) => {
  try {
    const stories = await Story.find({ user: req.user.id }).lean();
    console.log(stories);
    res.render("dashboard.hbs", {
      name: req.user.firstName,
      stories,
    });
  } catch (error) {
    console.log(error);
    res.render("error/500.hbs");
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();

const User = require("../models/User");
const passport = require("passport");

const { homepage, login, register } = require("../controller/loginRegister");

router.get("/", homepage);

// get -FORM
// POST - login  user
router
  .route("/login")
  .get(login)
  .post(
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    (req, res) => {
      // req.flash("success", "welcome back")
      res.redirect("/portfolio");
    }
  );

// get -FORM
// POST - create a user
router
  .route("/register")
  .get(register)
  .post(async (req, res) => {
    try {
      const { email, username, password } = req.body;
      const user = new User({ email, username });
      const registeredUser = await User.register(user, password);

      req.login(registeredUser, (err) => {
        if (err) return next(err);
        // req.flash("success", "welcome to AssetTracker");
        res.redirect("/portfolio");
      });
    } catch (e) {
      res.redirect("/register");
    }
  });

// logout user
router.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    // req.flash('success', "Goodbye!");
    res.redirect("/");
  });
});

//export
module.exports = router;

const express = require("express");
const router = express.Router();

const { removeCurrentUser } = require("../config/currentUser");

const User = require("../models/User");
const passport = require("passport");

const { homepage, login, register } = require("../controller/loginRegister");

router.get("/", homepage);

router
  .route("/login")
  .get(login)
  .post(
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    (req, res) => {
      req.flash("success", "Welcome back to AssetTracker");
      res.redirect("/portfolio");
    }
  );

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
        req.flash("success", "welcome to AssetTracker");
        res.redirect("/portfolio");
      });
    } catch (e) {
      req.flash("error", "User/Email already existed.");
      res.redirect("/register");
    }
  });

router.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    removeCurrentUser();
    req.flash("success", "See you later");
    res.redirect("/");
  });
});

//export
module.exports = router;

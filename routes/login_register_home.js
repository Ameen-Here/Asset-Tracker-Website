const express = require("express");
const router = express.Router();

router.route("/").get((req, res) => {
  res.render("index", {
    pageClass: "homepage",
    showLogin: true,
    showReg: true,
    titleName: "Home Page",
  });
});

router.get("/login", (req, res) => {
  res.render("login", {
    pageClass: "loginPage",
    showLogin: false,
    showReg: true,
    titleName: "Login",
  });
});

router.get("/register", (req, res) => {
  res.render("register", {
    pageClass: "registerPage",
    showLogin: true,
    showReg: false,
    titleName: "Register",
  });
});

module.exports = router;

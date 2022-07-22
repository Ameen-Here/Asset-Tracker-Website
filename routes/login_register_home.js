const express = require("express");
const router = express.Router();

const { homepage, login, register } = require("../controller/loginRegister");

router.get("/", homepage);

router.get("/login", login);

router.get("/register", register);

module.exports = router;

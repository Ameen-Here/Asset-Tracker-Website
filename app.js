const express = require("express");
const path = require("path");
const ejsMate = require("ejs-mate");
const app = express();

// Express Routes
const generalRoute = require("./routes/login_register_home");
const stockRoute = require("./routes/stockRoute");

app.set("view engine", "ejs"); // Setting ejs engine and directory
app.set("views", path.join(__dirname, "views"));

app.engine("ejs", ejsMate);

app.use(express.urlencoded({ extended: true }));

// app.use(express.static("public")); // Setting public directory for assets
app.use(express.static(path.join(__dirname, "public")));

// Routing

// General Routing: Homepage, Login, Register
app.use("/", generalRoute);

app.use("/", stockRoute);

app.listen(3000, console.log("Listening to port 3000"));

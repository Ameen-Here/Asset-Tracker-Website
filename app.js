const express = require("express");
const path = require("path");
const ejsMate = require("ejs-mate");
const app = express();

const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/User");

// Connect to mongoose
mongoose.connect("mongodb://localhost:27017/asset-tracker", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => console.log("Database Connected"));

// Express Routes
const generalRoute = require("./routes/login_register_home");
const stockRoute = require("./routes/stockRoute");

app.set("view engine", "ejs"); // Setting ejs engine and directory
app.set("views", path.join(__dirname, "views"));

app.engine("ejs", ejsMate);

app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

// Session
const sessionConfig = {
  secret: "thisshouldbeasecret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpsOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(async (req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// Routing

// General Routing: Homepage, Login, Register
app.use("/", generalRoute);

app.use("/", stockRoute);

// Eror Handling
// For wrong url
app.use((req, res) => {
  req.flash("error", "The url is not accessible!!!");
  res.redirect("/");
});

// Custom errors
app.use((err, req, res, next) => {
  const { status = 500, message = "Something Went Wrong" } = err;
  if (err.message === "Cannot read properties of undefined (reading 'split')") {
    req.flash(
      "error",
      "Asset name does not found, Make sure the stock name is correct and try again."
    );
    return res.redirect("/portfolio");
  }
  res.status(status).send(message);
});

app.listen(3000, () => console.log("Listening to port 3000"));

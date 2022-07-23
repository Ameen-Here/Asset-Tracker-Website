const express = require("express");
const path = require("path");
const ejsMate = require("ejs-mate");
const app = express();

const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/User");

// Connect to mongoose
mongoose.connect("mongodb://localhost:27017/asset-tracker", {
  useNewUrlParser: true,
  //   useCreateIndex: true,
  useUnifiedTopology: true,
  //   useFindAndModify: false,
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

// app.use(express.static("public")); // Setting public directory for assets
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

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  // res.locals.success = req.flash("success");
  // res.locals.error = req.flash("error");
  next();
});

// Routing

// General Routing: Homepage, Login, Register
app.use("/", generalRoute);

app.use("/", stockRoute);

app.listen(3000, () => console.log("Listening to port 3000"));

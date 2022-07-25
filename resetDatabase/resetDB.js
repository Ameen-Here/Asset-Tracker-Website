const mongoose = require("mongoose");
const User = require("../models/User");

const { testData } = require("../Utility Functions/testData");

mongoose.connect("mongodb://localhost:27017/asset-tracker", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));

db.once("open", () => {
  console.log("Database connected");
});

const defaultUserData = [
  { username: "Ameen Noushad", email: "ameenair6@gmail.com" },
];

const seedUserAsset = async () => {
  await User.deleteMany({});
  for (const userData of defaultUserData) {
    const user = new User(userData);
    user.assets.push(testData[0]);
    await user.save();

    // resizeBy.send(user);
  }
};

seedUserAsset();

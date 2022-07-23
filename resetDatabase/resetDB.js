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

// const seedAsset = async () => {
//   //   await Asset.deleteMany({});
//   //   for (let assetData of testData) {
//   //     const asset = new Asset(assetData);
//   //     await asset.save();
//   //   }
//   //   return Asset;
//   const asset = new Asset(testData[0]);
//   asset.save();
//   return asset;
// };

const seedUserAsset = async () => {
  await User.deleteMany({});
  for (const userData of defaultUserData) {
    const user = new User(userData);
    user.assets.push(testData[0]);
    await user.save();

    // resizeBy.send(user);
  }
  const users = await User.find({}).populate("assets");
};

seedUserAsset();

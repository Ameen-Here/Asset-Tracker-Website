const mongoose = require("mongoose");
const { Schema } = mongoose;
// const passportLocalMongoose = require("passport-local-mongoose");

const AssetSchema = new Schema({
  stockName: { type: String, required: true },
  symbol: { type: String, required: true },
  testStockPrice: Number,
  noOfStock: Number,
  currentPrice: Number,
  totalValue: Number,
  pAndLossPerc: Number,
  investedAmount: Number,
  isCustomAsset: Boolean,
  updateTime: Number,
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

// Add passport authentication
// UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("Asset", AssetSchema);

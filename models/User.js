const mongoose = require("mongoose");
const { Schema } = mongoose;
// const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  assets: [{ type: Schema.Types.ObjectId, ref: "Asset" }],
});

// Add passport authentication
// UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
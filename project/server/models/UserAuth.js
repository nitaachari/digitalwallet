const mongoose = require("mongoose");
const { Schema } = mongoose;
const userSchema = new Schema({
  name: String,
  number:Number,
  email: {
    type:String,
    required:true
  },
  password: String,
  balance: { type: Number, default: 0 },
});
const User = mongoose.model("User", userSchema); //name of modal
module.exports = User;
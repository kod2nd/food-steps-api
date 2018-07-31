const mongoose = require("mongoose");
const crypto = require("crypto");
const uniqueValidator = require("mongoose-unique-validator");
const ObjectId = mongoose.Schema.Types.ObjectId;

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "username is required!"],
      match: [/^[a-zA-Z0-9]{6,20}\b/, "username format is invalid"],
      lowercase: true,
      unique: true,
      index: true
    },
    hash: String,
    salt: String,
    email: {
      type: String,
      required: [true, "email is required!"]
    }
  },
  { timestamps: true }
);

userSchema.plugin(uniqueValidator, { message: "username should be unique" });

// use ES5 function to prevent `this` from becoming undefined
userSchema.methods.setHashedPassword = function(password) {
  this.salt = generateSalt();
  this.hash = hashPassword(password, this.salt);
};

userSchema.methods.validatePassword = function(password) {
  return !(password.length < 8 || password.length > 20);
};
// use ES5 function to prevent `this` from becoming undefined
userSchema.methods.verifyPassword = function(password) {
  if (!password) return false;
  return this.hash === hashPassword(password, this.salt);
};

// userSchema.methods.toDisplay = function() {
// 	let smallObject = {
// 		_id: this._id,
// 		username: this.username,
// 		bio: this.bio,
// 		likes: this.likes,
// 		bookmarked: this.bookmarked,
// 		createdAt: this.createdAt,
// 		updatedAt: this.updatedAt
// 	};
// 	return smallObject;
// };

const generateSalt = () => {
  return crypto.randomBytes(16).toString("hex");
};

const hashPassword = (password, salt) => {
  const hash = crypto
    .pbkdf2Sync(password, salt, 10000, 512, "sha512")
    .toString("hex");
  return hash;
};

const User = mongoose.model("User", userSchema);

module.exports = User;

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    phone: {
      type: String,
    },
    role: {
      type: String,
      enum: ["user", "admin", "broker"],
      default: "user",
    },
    kycVerified: {
      type: String,
      enum: ["true", "false"],
      default: "false",
    },
    accountBalance: {
      type: Number,
      default: 0,
    },
    // 2FA fields
    twoFactorCode: {
      type: String,
    },
    twoFactorCodeExpires: {
      type: Number,
    },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// JWT creation method
UserSchema.methods.createJWT = function () {
  return jwt.sign(
    {
      userId: this._id,
      fullName: this.fullName,
      role: this.role,
      email: this.email,
      phone: this.phone,
      kycVerified: this.kycVerified,
      accountBalance: this.accountBalance,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_LIFETIME || "1d" }
  );
};

module.exports = mongoose.model("User", UserSchema);

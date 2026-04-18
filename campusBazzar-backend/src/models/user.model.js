import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
      index: true,
    },

    college: {
      type: String,
      required: [true, "College name is required"],
      trim: true,
    },

    phone: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || (v.length >= 10 && v.length <= 15);
        },
        message: "Phone number must be between 10 digits"
      }
    },

    profilePic: {
      type: String,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    rating: {
      type: Number,
      default: 0,
    },

    totalRatings: {
      type: Number,
      default: 0,
    },

    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);


// Hash password before saving
userSchema.pre("save", async function () {

  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 12);
})


// Compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
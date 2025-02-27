const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const hrSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    dob: { type: Date, required: true },
    mobile: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    residenceAddress: { type: String, required: true },
    role: { type: String, default: "HR" },
    permissions: { type: [String], default: ["dashboard","employee","tasks","Notice","leaves"] },
    access: { type: String, default: "view,edit,update,add,delete" },
    status: { type: String, default: "Active"},
  },
  { timestamps: true }
);

// Hash password before saving
hrSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model("HR", hrSchema, "HR"); // 🔹 Collection name: HR

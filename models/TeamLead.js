const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const teamLeadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    dob: { type: Date, required: true },
    mobile: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    residenceAddress: { type: String, required: true },
    role: { type: String, default: "TeamLead" },
    permissions: { type: [String], default: [] },
    access: { type: String, default: "view" },
  },
  { timestamps: true }
);

teamLeadSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model("TeamLead", teamLeadSchema, "TeamLead"); 

const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
  {
    createdBy: {
      type: String,
      enum: ["HR", "HM", "BDM"], // ✅ Only these roles can create interviews
      required: true,
    },

    email: { 
     type: String,
     required: true, 
     unique: true },

    rolePosition: {
      type: String,
      required: true, // ✅ Role for which hiring is happening
    },
    candidateName: {
      type: String,
      required: true, // ✅ Name of the candidate
    },
    experience: {
      type: String,
      required: true, // ✅ Candidate's experience
    },
    interviewStatus: {
      type: String,
      enum: ["New", "Processing", "Completed"], // ✅ Status of the interview
      default: "New",
    },
    hiringStatus: {
      type: String,
      enum: ["Active", "Deactive"], // ✅ Hiring status
      default: "Active",
    },
    result: {
      type: String,
      enum: ["Hired", "NotHired", "Processing"], // ✅ Result of the interview (Initially empty)
      default: "",
    },
    date: {
      type: Date,
      default: Date.now, // ✅ Interview creation time
    },
    lastUpdate: {
      type: Date, // ✅ Updated only when interviewStatus, hiringStatus, or result changes
      default: null,
    },
  },
  { timestamps: true }
);

// ✅ Middleware to update `lastUpdate` only when specific fields change
interviewSchema.pre("save", function (next) {
  if (this.isModified("interviewStatus") || this.isModified("hiringStatus") || this.isModified("result")) {
    this.lastUpdate = new Date();
  }
  next();
});

module.exports = mongoose.model("Interview", interviewSchema);

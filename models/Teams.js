const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
  team_name: {
    type: String,
    required: true,
    unique: true, // Ensures team names are not duplicated
    trim: true
  },
  created_time: {
    type: String,
    default: () => {
      const now = new Date();
      return now.toLocaleDateString("en-GB"); // Format: DD/MM/YYYY
    }
  },
  level: {
    type: Number,
    enum: [1, 2, 3, 4, 5], // Only allows these values
    required: true
  },
  type: {
    type: String,
    enum: ["New", "Old"], // Only allows "New" or "Old"
    required: true
  },
  employees: {
    type: [mongoose.Schema.Types.ObjectId], // Stores multiple Employee IDs
    ref: "Employee",
    default: [] // Starts as an empty array
  }
});

module.exports = mongoose.model("Team", teamSchema);

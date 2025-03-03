const mongoose = require("mongoose");

// Define the Project Schema
const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee", // Reference to Employee or Team Lead collection
      required: true,
      validate: {
        validator: async function (employeeId) {
          const Employee = mongoose.model("Employee");
          const TeamLead = mongoose.model("TeamLead");

          const employeeExists = await Employee.findById(employeeId);
          const teamLeadExists = await TeamLead.findById(employeeId);

          return !!(employeeExists || teamLeadExists);
        },
        message: "Employee was not found",
      },
    },
    employeeName: {
      type: String,
      required: true,
    },
    employeeRole: {
      type: String,
      required: true,
    },
    createdDate: {
      type: Date,
      default: Date.now,
    },
    status: [
      {
        date: {
          type: String, // Store as formatted string "DD-MM-YYYY Time: HH:MM"
           default: "",
        },
        description: {
          type: String,
          default: "",
        },
      },
    ],
    projectActivity: {
      type: String,
      enum: ["Active", "Deactive"],
      default: "Active",
    },
    hoursAllowed: {
      type: Number,
      required: true,
    },
    workingOnlineHours: [
      {
        date: {
          type: String, // Store as formatted string "DD-MM-YYYY Time: HH:MM"
          required: true,
        },
        hours: {
          type: Number,
          required: true,
        },
      },
    ],
    workingOfflineHours: [
      {
        date: {
          type: String, // Store as formatted string "DD-MM-YYYY Time: HH:MM"
          required: true,
        },
        hours: {
          type: Number,
          required: true,
        },
      },
    ],
    totalWorkedHours: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Middleware to update totalWorkedHours and deduct from hoursAllowed
projectSchema.pre("save", function (next) {
  let totalOnlineHours = this.workingOnlineHours.reduce(
    (sum, entry) => sum + entry.hours,
    0
  );
  let totalOfflineHours = this.workingOfflineHours.reduce(
    (sum, entry) => sum + entry.hours,
    0
  );

  let totalHoursWorked = totalOnlineHours + totalOfflineHours;

  this.totalWorkedHours = totalHoursWorked;
  this.hoursAllowed = Math.max(this.hoursAllowed - totalHoursWorked, 0);

  next();
});

module.exports = mongoose.model("Project", projectSchema);

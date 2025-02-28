// const Employee = require("../models/Employee");

// // ✅ Deactivate or Activate an Employee
// exports.deactivate_activeEmployee = async (req, res) => {
//   try {
//     const { role, access, status: userStatus } = req.user; // Extract role, access, and status from JWT
//     const { candidateId, status } = req.body; // Get candidate ID and new status

//     console.log(
//       `🔹 Employee Deactivation Requested - Role: ${role}, Access: ${access}, Status: ${userStatus}`
//     );

//     // ❌ Check if the user's account is active
//     if (userStatus !== "Active") {
//       return res.status(403).json({ message: "Your account is not active. Please contact admin." });
//     }

//     // ✅ Convert access string to an array & check for required access
//     const accessArray = access.split(",");

//     if (
//       !["HR", "BDM", "SuperAdmin"].includes(role) ||
//       (!accessArray.includes("delete") && !accessArray.includes("full-access"))
//     ) {
//       return res.status(403).json({ message: "You do not have the required access level." });
//     }

//     // ✅ Fetch only Employee candidates (not sub-admins)
//     const employee = await Employee.findById(candidateId);

//     if (!employee) {
//       return res.status(404).json({ message: "Employee not found" });
//     }

//     // ✅ Update the status field
//     employee.status = status;
//     await employee.save();

//     console.log("✅ Employee Status Updated Successfully:", employee);
//     res.status(200).json({ message: `Employee status updated to ${status}`, data: employee });

//   } catch (error) {
//     console.error("❌ Error Updating Employee Status:", error.message);
//     res.status(500).json({ message: "Error updating employee status", error: error.message });
//   }
// };



const Employee = require("../models/Employee");

// ✅ Deactivate or Activate an Employee
exports.deactivate_activeEmployee = async (req, res) => {
  try {
    const { role, access, status: userStatus } = req.user; // Extract role, access, and status from JWT
    const { candidateId, status } = req.body; // Get candidate ID and new status

    console.log(
      `🔹 Employee Deactivation Requested - Role: ${role}, Access: ${access}, Status: ${userStatus}`
    );

    // ❌ Check if the user's account is active
    if (userStatus !== "Active") {
      return res.status(403).json({ message: "Your account is not active. Please contact admin." });
    }

    // ✅ Convert access string to an array & check for required access
    const accessArray = access.split(",");

    if (
      !["HR", "BDM", "SuperAdmin", "PM", "HM", "TeamLead"].includes(role) ||
      (!accessArray.includes("view") && !accessArray.includes("full-access"))
    ) {
      return res.status(403).json({ message: "You do not have the required access level." });
    }

    // ✅ Validate Status Value
    const validStatusValues = ["Active", "Deactive"];
    if (!validStatusValues.includes(status)) {
      return res.status(400).json({ message: "Invalid status value. Allowed values: 'Active', 'Deactive'" });
    }

    // ✅ Fetch only Employee candidates (not sub-admins)
    const employee = await Employee.findById(candidateId);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // ✅ Update the status field
    employee.status = status;
    await employee.save();

    console.log("✅ Employee Status Updated Successfully:", employee);
    res.status(200).json({ message: `Employee status updated to ${status}`, data: employee });

  } catch (error) {
    console.error("❌ Error Updating Employee Status:", error.message);
    res.status(500).json({ message: "Error updating employee status", error: error.message });
  }
};

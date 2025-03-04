

const Employee = require("../models/Employee");

// // ✅ Get All Deactivated Employees
// exports.getDeactivatedEmployees = async (req, res) => {
//   try {
//     const { role, access, status } = req.user; // Extract role, access, and status from JWT

//     console.log(`🔹 Deactivated Employee List Requested by: ${role} | Access: ${access} | Status: ${status}`);

//     // ❌ Check if the user's account is active
//     if (status !== "Active") {
//       return res.status(403).json({ message: "Your account is not active. Please contact admin." });
//     }

//     // ✅ Convert access string to an array & check for required access
//     const accessArray = access.split(","); // Convert "view,edit,update,add,delete" → ["view", "edit", "update", "add", "delete"]

//     if (
//       !["HR", "BDM", "SuperAdmin", "PM", "HM", "TeamLead"].includes(role) || 
//       !accessArray.includes("view") && !accessArray.includes("full-access")
//     ) {
//       return res.status(403).json({ message: "You do not have the required access level." });
//     }

//     // ✅ Fetch employees whose status is NOT "Active"
//     const deactivatedEmployees = await Employee.find({ status: { $ne: "Active" } });

//     res.status(200).json({
//       message: "Deactivated employees retrieved successfully",
//       employees: deactivatedEmployees,
//     });

//   } catch (error) {
//     console.error("❌ Error Fetching Deactivated Employees:", error.message);
//     res.status(500).json({ message: "Error retrieving employees", error: error.message });
//   }
// };


// ✅ Get All Deactivated Employees
exports.getDeactivatedEmployees = async (req, res) => {
  try {
    const { role, access, status } = req.user; // Extract role, access, and status from JWT

    console.log(`🔹 Deactivated Employee List Requested by: ${role} | Access: ${access} | Status: ${status}`);

    // ❌ Check if the user's account is active
    if (status !== "Active") {
      return res.status(403).json({ status: 403, message: "Your account is not active. Please contact admin." });
    }

    // ✅ Convert access string to an array & check for required access
    const accessArray = access.split(","); // Convert "view,edit,update,add,delete" → ["view", "edit", "update", "add", "delete"]

    if (
      !["HR", "BDM", "SuperAdmin", "PM", "HM", "TeamLead"].includes(role) || 
      (!accessArray.includes("view") && !accessArray.includes("full-access"))
    ) {
      return res.status(403).json({ status: 403, message: "You do not have the required access level." });
    }

    // ✅ Fetch employees whose status is NOT "Active"
    const deactivatedEmployees = await Employee.find({ status: { $ne: "Active" } });

    res.status(200).json({
      status: 200,
      message: "Deactivated employees retrieved successfully",
      employees: deactivatedEmployees,
    });

  } catch (error) {
    console.error("❌ Error Fetching Deactivated Employees:", error.message);
    res.status(500).json({ status: 500, message: "Error retrieving employees", error: error.message });
  }
};

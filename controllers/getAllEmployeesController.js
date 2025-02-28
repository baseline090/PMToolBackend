// const Employee = require("../models/Employee");

// // ✅ Get All Employees Controller
// exports.getAllEmployees = async (req, res) => {
//   try {
//     const { role, access, status } = req.user; // Extract role, access, and status from JWT

//     console.log(`🔹 Employee List Requested by: ${role} | Access: ${access} | Status: ${status}`);

//     // ❌ Check if the user's account is active
//     if (status !== "Active") {
//       return res.status(403).json({ message: "Your account is not active. Please contact admin." });
//     }

//     // ❌ Check authorization (Only allowed roles with "view" or "full-access")
//     const allowedRoles = ["HR", "BDM", "SuperAdmin", "PM", "HM", "TeamLead", "Employee"];
//     const allowedAccess = ["view", "full-access"];

//     if (!allowedRoles.includes(role) || !allowedAccess.includes(access)) {
//       return res.status(403).json({ message: "You are not authorized to view employee details." });
//     }

//     // ✅ Fetch all employees from the database
//     const employees = await Employee.find({}, "-password"); // Exclude passwords for security

//     console.log(`✅ Fetched ${employees.length} Employees from Database`);
//     res.status(200).json({
//       message: "Employee list retrieved successfully.",
//       totalEmployees: employees.length,
//       employees,
//     });

//   } catch (error) {
//     console.error("❌ Error Fetching Employees:", error.message);
//     res.status(500).json({ message: "Error retrieving employee list", error: error.message });
//   }
// };



const Employee = require("../models/Employee");

// ✅ Get All Employees Controller
exports.getAllEmployees = async (req, res) => {
  try {
    const { role, access, status } = req.user; // Extract user details from JWT

    console.log(`🔹 Employee List Requested by: ${role} | Access: ${access} | Status: ${status}`);

    // ❌ Check if the user's account is active
    if (status !== "Active") {
      return res.status(403).json({ message: "Your account is not active. Please contact admin." });
    }

    // ❌ Check if the user has 'view' or 'full-access' permissions
    if (!["view", "full-access"].includes(access)) {
      return res.status(403).json({ message: "You do not have the required access level." });
    }

    // ✅ Fetch all employees from DB
    const employees = await Employee.find({}, { password: 0 }); // Exclude password for security

    console.log(`✅ Employee List Fetched Successfully`);
    res.status(200).json({ message: "Employee list retrieved successfully", employees });

  } catch (error) {
    console.error("❌ Error Fetching Employees:", error.message);
    res.status(500).json({ message: "Error fetching employees", error: error.message });
  }
};

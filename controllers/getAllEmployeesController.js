

const Employee = require("../models/Employee");

// // ✅ Get All Employees Controller
// exports.getAllEmployees = async (req, res) => {
//   try {
//     const { role, access, status } = req.user; // Extract user details from JWT

//     console.log(`🔹 Employee List Requested by: ${role} | Access: ${access} | Status: ${status}`);

//     // ❌ Check if the user's account is active
//     if (status !== "Active") {
//       return res.status(403).json({ message: "Your account is not active. Please contact admin." });
//     }

//     // ✅ Convert access string to an array for proper checking
//     const accessArray = access.split(",").map(a => a.trim()); // Example: "view,edit,update" → ["view", "edit", "update"]

//     // ❌ Check if the user has a valid role and required access
//     if (
//       !["HR", "BDM", "SuperAdmin", "PM", "HM", "TeamLead"].includes(role) ||
//       (!accessArray.includes("view") && !accessArray.includes("full-access"))
//     ) {
//       return res.status(403).json({ message: "You do not have the required access level." });
//     }

//     // ✅ Fetch all employees from DB (excluding password)
//     const employees = await Employee.find({}, { password: 0 });

//     console.log(`✅ Employee List Fetched Successfully`);
//     res.status(200).json({ message: "Employee list retrieved successfully", employees });

//   } catch (error) {
//     console.error("❌ Error Fetching Employees:", error.message);
//     res.status(500).json({ message: "Error fetching employees", error: error.message });
//   }
// };



// ✅ Get All Employees Controller
exports.getAllEmployees = async (req, res) => {
  try {
    const { role, access, status } = req.user; // Extract user details from JWT

    console.log(`🔹 Employee List Requested by: ${role} | Access: ${access} | Status: ${status}`);

    // ❌ Check if the user's account is active
    if (status !== "Active") {
      return res.status(403).json({ status: 403, message: "Your account is not active. Please contact admin." });
    }

    // ✅ Convert access string to an array for proper checking
    const accessArray = access.split(",").map(a => a.trim()); // Example: "view,edit,update" → ["view", "edit", "update"]

    // ❌ Check if the user has a valid role and required access
    if (
      !["HR", "BDM", "SuperAdmin", "PM", "HM", "TeamLead"].includes(role) ||
      (!accessArray.includes("view") && !accessArray.includes("full-access"))
    ) {
      return res.status(403).json({ status: 403, message: "You do not have the required access level." });
    }

    // ✅ Fetch all employees from DB (excluding password)
    const employees = await Employee.find({}, { password: 0 });

    console.log(`✅ Employee List Fetched Successfully`);
    res.status(200).json({ status: 200, message: "Employee list retrieved successfully", employees });

  } catch (error) {
    console.error("❌ Error Fetching Employees:", error.message);
    res.status(500).json({ status: 500, message: "Error fetching employees", error: error.message });
  }
};

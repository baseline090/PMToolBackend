// const Employee = require('../models/Employee');
// const SuperAdmin = require('../models/SuperAdmin');

// exports.viewSingleEmployee = async (req, res) => {
//     try {
//         const { candidateId } = req.query; // ✅ Get candidateId from query instead of body
//         const { id: employeeId, role, access, status } = req.user; // Extract Employee ID, Role, Access & Status from JWT

//         console.log(`🔹 Viewing Candidate Profile - Employee ID: ${employeeId}, Role: ${role}, Access: ${access}, Status: ${status}`);

//         // ❌ Check if the user's status is "Active"
//         if (status !== "Active") {
//             return res.status(403).json({ message: "Your account is not active" });
//         }

//         // ✅ Convert access string to an array & check for required access
//         const accessArray = access.split(",");

//         if (
//             !["HR", "BDM", "SuperAdmin", "PM", "HM", "TeamLead"].includes(role) ||
//             (!accessArray.includes("view") && !accessArray.includes("full-access"))
//         ) {
//             return res.status(403).json({ message: "Access denied: You do not have permission to view profiles" });
//         }

//         // Fetch the Employee user to check their access
//         const employee = await Employee.findById(employeeId);
//         if (!employee) {
//             return res.status(404).json({ message: "Employee not found" });
//         }

//         // Check if the candidate is a Super Admin - Employee cannot view Super Admin profiles
//         const superAdmin = await SuperAdmin.findById(candidateId);
//         if (superAdmin) {
//             return res.status(403).json({ message: "Access denied: You cannot view the Super Admin profile" });
//         }

//         // ✅ Fetch candidate only from allowed collections (Employee)
//         const allowedCollections = { Employee };

//         let candidate = null;
//         for (const role in allowedCollections) {
//             candidate = await allowedCollections[role].findById(candidateId);
//             if (candidate) break; // Stop searching once a valid candidate is found
//         }

//         if (!candidate) {
//             return res.status(404).json({ message: "Candidate not found or unauthorized to view this profile" });
//         }

//         console.log("✅ Candidate Profile Fetched Successfully:", candidate);
//         res.status(200).json({ message: "Candidate profile fetched successfully", data: candidate });

//     } catch (error) {
//         console.error("❌ Error Viewing Candidate Profile:", error.message);
//         res.status(500).json({ message: "Error viewing candidate profile", error: error.message });
//     }
// };





const Employee = require("../models/Employee");
const SuperAdmin = require("../models/SuperAdmin");

// ✅ View Candidate Profile API (with Access Control)
exports.viewCandidate = async (req, res) => {
  try {
    const { candidateId } = req.body; // Get the candidate ID from the request body
    const { role, access, status } = req.user; // Extract role, access, and status from JWT

    console.log(
      `🔹 Viewing Candidate Profile - Role: ${role}, Access: ${access}, Status: ${status}`
    );

    // ❌ Check if the user's status is "Active"
    if (status !== "Active") {
      return res.status(403).json({ message: "Your account is not active" });
    }

    // ✅ Convert access string to an array & check for required access
    const accessArray = access.split(",");

    if (
      !["HR", "HM", "PM", "TeamLead", "SuperAdmin", "BDM"].includes(role) ||
      (!accessArray.includes("view") && !accessArray.includes("full-access"))
    ) {
      return res
        .status(403)
        .json({ message: "Access denied: You do not have permission to view profiles" });
    }

    // ❌ Check if the candidate is a Super Admin (Not Allowed)
    const superAdmin = await SuperAdmin.findById(candidateId);
    if (superAdmin) {
      return res.status(403).json({ message: "Access denied: You cannot view the Super Admin profile" });
    }

    // ✅ Fetch only Employee candidates (not sub-admins)
    const candidate = await Employee.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    console.log("✅ Candidate Profile Fetched Successfully:", candidate);
    res.status(200).json({ message: "Candidate profile fetched successfully", data: candidate });

  } catch (error) {
    console.error("❌ Error Viewing Candidate Profile:", error.message);
    res.status(500).json({ message: "Error viewing candidate profile", error: error.message });
  }
};

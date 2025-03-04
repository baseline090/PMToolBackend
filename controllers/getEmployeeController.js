



const Employee = require("../models/Employee");
const SuperAdmin = require("../models/SuperAdmin");

// // ✅ View Candidate Profile API (with Access Control)
// exports.viewCandidate = async (req, res) => {
//   try {
//     const { candidateId } = req.body; // Get the candidate ID from the request body
//     const { role, access, status } = req.user; // Extract role, access, and status from JWT

//     console.log(
//       `🔹 Viewing Candidate Profile - Role: ${role}, Access: ${access}, Status: ${status}`
//     );

//     // ❌ Check if the user's status is "Active"
//     if (status !== "Active") {
//       return res.status(403).json({ message: "Your account is not active" });
//     }

//     // ✅ Convert access string to an array & check for required access
//     const accessArray = access.split(",");

//     if (
//       !["HR", "HM", "PM", "TeamLead", "SuperAdmin", "BDM"].includes(role) ||
//       (!accessArray.includes("view") && !accessArray.includes("full-access"))
//     ) {
//       return res
//         .status(403)
//         .json({ message: "Access denied: You do not have permission to view profiles" });
//     }

//     // ❌ Check if the candidate is a Super Admin (Not Allowed)
//     const superAdmin = await SuperAdmin.findById(candidateId);
//     if (superAdmin) {
//       return res.status(403).json({ message: "Access denied: You cannot view the Super Admin profile" });
//     }

//     // ✅ Fetch only Employee candidates (not sub-admins)
//     const candidate = await Employee.findById(candidateId);
//     if (!candidate) {
//       return res.status(404).json({ message: "Candidate not found" });
//     }

//     console.log("✅ Candidate Profile Fetched Successfully:", candidate);
//     res.status(200).json({ message: "Candidate profile fetched successfully", data: candidate });

//   } catch (error) {
//     console.error("❌ Error Viewing Candidate Profile:", error.message);
//     res.status(500).json({ message: "Error viewing candidate profile", error: error.message });
//   }
// };





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
      return res.status(403).json({ status: 403, message: "Your account is not active" });
    }

    // ✅ Convert access string to an array & check for required access
    const accessArray = access.split(",");

    if (
      !["HR", "HM", "PM", "TeamLead", "SuperAdmin", "BDM"].includes(role) ||
      (!accessArray.includes("view") && !accessArray.includes("full-access"))
    ) {
      return res.status(403).json({
        status: 403,
        message: "Access denied: You do not have permission to view profiles"
      });
    }

    // ❌ Check if the candidate is a Super Admin (Not Allowed)
    const superAdmin = await SuperAdmin.findById(candidateId);
    if (superAdmin) {
      return res.status(403).json({
        status: 403,
        message: "Access denied: You cannot view the Super Admin profile"
      });
    }

    // ✅ Fetch only Employee candidates (not sub-admins)
    const candidate = await Employee.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ status: 404, message: "Candidate not found" });
    }

    console.log("✅ Candidate Profile Fetched Successfully:", candidate);
    res.status(200).json({
      status: 200,
      message: "Candidate profile fetched successfully",
      data: candidate
    });

  } catch (error) {
    console.error("❌ Error Viewing Candidate Profile:", error.message);
    res.status(500).json({
      status: 500,
      message: "Error viewing candidate profile",
      error: error.message
    });
  }
};

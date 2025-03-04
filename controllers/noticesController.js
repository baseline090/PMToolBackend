const Employee = require("../models/Employee");
const TeamLead = require("../models/TeamLead");

// // ✅ Add Notices to Candidate (Employee or TeamLead)
// exports.addNoticeToCandidate = async (req, res) => {
//   try {
//     const { candidateID, notice } = req.body; // Extract candidate ID & notices array
//     const { role, access, status } = req.user; // Extract user details from JWT

//     console.log(`🔹 Notice Addition Requested by: ${role} | Access: ${access} | Status: ${status}`);

//     // ❌ Check if the user's account is active
//     if (status !== "Active") {
//       return res.status(403).json({ message: "Your account is not active. Please contact admin." });
//     }

//     // ✅ Convert access string to an array & check for required access
//     const accessArray = access.split(",");
//     if (!["HR", "SuperAdmin", "BDM"].includes(role) || (!accessArray.includes("view") && !accessArray.includes("full-access"))) {
//       return res.status(403).json({ message: "You do not have the required access level." });
//     }

//     // ✅ Determine if the candidate is an Employee or TeamLead
//     let candidateModel;
//     let candidate = await Employee.findById(candidateID);
//     if (!candidate) {
//       candidate = await TeamLead.findById(candidateID);
//       if (!candidate) {
//         return res.status(404).json({ message: "Candidate not found" });
//       }
//       candidateModel = TeamLead;
//     } else {
//       candidateModel = Employee;
//     }

//     // ✅ Ensure notice is an array
//     if (!Array.isArray(notice)) {
//       return res.status(400).json({ message: "Notice must be an array of strings" });
//     }

//     // ✅ Append new notices to the existing ones (without removing old data)
//     candidate.notices = [...candidate.notices, ...notice];
//     await candidate.save();

//     console.log(`✅ Notices added to ${candidateModel.modelName} ID: ${candidateID}`);
//     res.status(200).json({ message: "Notices added successfully", data: candidate });

//   } catch (error) {
//     console.error("❌ Error Adding Notices:", error.message);
//     res.status(500).json({ message: "Error adding notices", error: error.message });
//   }
// };



// ✅ Add Notices to Candidate (Employee or TeamLead)
exports.addNoticeToCandidate = async (req, res) => {
  try {
    const { candidateID, notice } = req.body; // Extract candidate ID & notices array
    const { role, access, status } = req.user; // Extract user details from JWT

    console.log(`🔹 Notice Addition Requested by: ${role} | Access: ${access} | Status: ${status}`);

    // ❌ Check if the user's account is active
    if (status !== "Active") {
      return res.status(403).json({ status: 403, message: "Your account is not active. Please contact admin." });
    }

    // ✅ Convert access string to an array & check for required access
    const accessArray = access.split(",");
    if (!["HR", "SuperAdmin", "BDM"].includes(role) || (!accessArray.includes("view") && !accessArray.includes("full-access"))) {
      return res.status(403).json({ status: 403, message: "You do not have the required access level." });
    }

    // ✅ Determine if the candidate is an Employee or TeamLead
    let candidateModel;
    let candidate = await Employee.findById(candidateID);
    if (!candidate) {
      candidate = await TeamLead.findById(candidateID);
      if (!candidate) {
        return res.status(404).json({ status: 404, message: "Candidate not found" });
      }
      candidateModel = TeamLead;
    } else {
      candidateModel = Employee;
    }

    // ✅ Ensure notice is an array
    if (!Array.isArray(notice)) {
      return res.status(400).json({ status: 400, message: "Notice must be an array of strings" });
    }

    // ✅ Append new notices to the existing ones (without removing old data)
    candidate.notices = [...candidate.notices, ...notice];
    await candidate.save();

    console.log(`✅ Notices added to ${candidateModel.modelName} ID: ${candidateID}`);
    res.status(200).json({ status: 200, message: "Notices added successfully", data: candidate });

  } catch (error) {
    console.error("❌ Error Adding Notices:", error.message);
    res.status(500).json({ status: 500, message: "Error adding notices", error: error.message });
  }
};

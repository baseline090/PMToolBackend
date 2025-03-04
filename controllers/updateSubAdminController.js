const HR = require("../models/HR");
const BDM = require("../models/BDM");
const TeamLead = require("../models/TeamLead");
const PM = require("../models/PM");
const HM = require("../models/HM");
const Employee = require("../models/Employee");




// exports.updateProfile = async (req, res) => {
//   try {
//     const { candidateId, updateData, role } = req.body; // Candidate ID and update data
//     const { role: userRole, access, status } = req.user; // Extracting role, access, and status from JWT

//     console.log(`🔹 Update Profile Requested by: ${userRole} | Access: ${access} | Status: ${status}`);

//     // ❌ Check if the user's status is "Active"
//     if (status !== "Active") {
//       return res.status(403).json({ message: "Your account is not active" });
//     }

//     // ✅ Check if user has permission (role = HR, BDM, SuperAdmin) and (access = view, full-access)
//     const allowedRoles = ["HR", "BDM", "SuperAdmin"];
//     const allowedAccess = ["view", "full-access"];
//     const userAccessArray = access.split(",");

//     if (!allowedRoles.includes(userRole) || !userAccessArray.some((acc) => allowedAccess.includes(acc))) {
//       return res.status(403).json({ message: "Access denied" });
//     }

//     // ✅ Validate Role of Candidate Being Updated
//     const validRoles = ["BDM", "HR", "HM", "PM", "Employee", "TeamLead"];
//     if (!validRoles.includes(role)) {
//       return res.status(400).json({ message: "Invalid role specified" });
//     }

//     // ✅ Find and Update Candidate Profile
//     let updatedCandidate = null;
//     switch (role) {
//       case "BDM":
//         updatedCandidate = await BDM.findByIdAndUpdate(candidateId, updateData, { new: true });
//         break;
//       case "HR":
//         updatedCandidate = await HR.findByIdAndUpdate(candidateId, updateData, { new: true });
//         break;
//       case "HM":
//         updatedCandidate = await HM.findByIdAndUpdate(candidateId, updateData, { new: true });
//         break;
//       case "PM":
//         updatedCandidate = await PM.findByIdAndUpdate(candidateId, updateData, { new: true });
//         break;
//       case "Employee":
//         updatedCandidate = await Employee.findByIdAndUpdate(candidateId, updateData, { new: true });
//         break;
//       case "TeamLead":
//         updatedCandidate = await TeamLead.findByIdAndUpdate(candidateId, updateData, { new: true });
//         break;
//     }

//     // ✅ Handle Not Found Case
//     if (!updatedCandidate) {
//       return res.status(404).json({ message: "Candidate not found" });
//     }

//     console.log(`✅ Profile Updated Successfully for: ${role}`);
//     res.status(200).json({
//       message: "Candidate profile updated successfully",
//       data: updatedCandidate,
//     });

//   } catch (error) {
//     console.error("❌ Error Updating Profile:", error.message);
//     res.status(500).json({ message: "Error updating profile", error: error.message });
//   }
// };




exports.updateProfile = async (req, res) => {
  try {
    const { candidateId, updateData, role } = req.body; // Candidate ID and update data
    const { role: userRole, access, status } = req.user; // Extracting role, access, and status from JWT

    console.log(`🔹 Update Profile Requested by: ${userRole} | Access: ${access} | Status: ${status}`);

    // ❌ Check if the user's status is "Active"
    if (status !== "Active") {
      return res.status(403).json({ status: 403, message: "Your account is not active" });
    }

    // ✅ Check if user has permission (role = HR, BDM, SuperAdmin) and (access = view, full-access)
    const allowedRoles = ["HR", "BDM", "SuperAdmin"];
    const allowedAccess = ["view", "full-access"];
    const userAccessArray = access.split(",");

    if (!allowedRoles.includes(userRole) || !userAccessArray.some((acc) => allowedAccess.includes(acc))) {
      return res.status(403).json({ status: 403, message: "Access denied" });
    }

    // ✅ Validate Role of Candidate Being Updated
    const validRoles = ["BDM", "HR", "HM", "PM", "Employee", "TeamLead"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ status: 400, message: "Invalid role specified" });
    }

    // ✅ Find and Update Candidate Profile
    let updatedCandidate = null;
    switch (role) {
      case "BDM":
        updatedCandidate = await BDM.findByIdAndUpdate(candidateId, updateData, { new: true });
        break;
      case "HR":
        updatedCandidate = await HR.findByIdAndUpdate(candidateId, updateData, { new: true });
        break;
      case "HM":
        updatedCandidate = await HM.findByIdAndUpdate(candidateId, updateData, { new: true });
        break;
      case "PM":
        updatedCandidate = await PM.findByIdAndUpdate(candidateId, updateData, { new: true });
        break;
      case "Employee":
        updatedCandidate = await Employee.findByIdAndUpdate(candidateId, updateData, { new: true });
        break;
      case "TeamLead":
        updatedCandidate = await TeamLead.findByIdAndUpdate(candidateId, updateData, { new: true });
        break;
    }

    // ✅ Handle Not Found Case
    if (!updatedCandidate) {
      return res.status(404).json({ status: 404, message: "Candidate not found" });
    }

    console.log(`✅ Profile Updated Successfully for: ${role}`);
    res.status(200).json({
      status: 200,
      message: "Candidate profile updated successfully",
      data: updatedCandidate,
    });

  } catch (error) {
    console.error("❌ Error Updating Profile:", error.message);
    res.status(500).json({ status: 500, message: "Error updating profile", error: error.message });
  }
};

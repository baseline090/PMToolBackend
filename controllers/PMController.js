const HR = require('../models/HR');
const HM = require('../models/HM');
const PM = require('../models/PM');
const Employee = require('../models/Employee');
const TeamLead = require('../models/TeamLead');
const SuperAdmin = require('../models/SuperAdmin');
// Mapping roles to their respective models
// const roleModelMap = {
//   HM: HM,
//   PM: PM,
//   Employee: Employee,
//   TeamLead: TeamLead,
// };




// ✅ Update HR Profile
exports.updatePMProfile = async (req, res) => {
  try {
    const { id } = req.user; // Extracted from JWT
    const { name, username, dob, mobile, email, residenceAddress } = req.body;

    // 1️⃣ **Check if the logged-in user is HR**
    const pm = await PM.findOne({ _id: id, role: "PM" });

    if (!pm) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    // 2️⃣ **Update the profile fields if provided**
    if (name) pm.name = name;
    if (username) pm.username = username;
    if (dob) pm.dob = dob;
    if (mobile) pm.mobile = mobile;
    if (email) pm.email = email;
    if (residenceAddress) pm.residenceAddress = residenceAddress;

    await pm.save();

    res.status(200).json({ message: "PM profile updated successfully", data: pm });

  } catch (error) {
    console.error("❌ Error Updating PM Profile:", error.message);
    res.status(500).json({ message: "Error updating profile", error: error.message });
  }
};



exports.viewCandidate = async (req, res) => {
    try {
      const { candidateId } = req.body; // Get the candidate ID from the request body
      const pmId = req.user.id; // PM ID from JWT
  
      // Fetch the PM user to check their access
      const pm = await PM.findById(pmId);
      if (!pm) {
        return res.status(404).json({ message: "PM not found" });
      }
  
      // Check if PM has 'view' permission
      if (!pm.access.includes("view")) {
        return res.status(403).json({ message: "Access denied: You do not have permission to view profiles" });
      }
  
      // Check if the candidate is a Super Admin - PM cannot view Super Admin profiles
      const superAdmin = await SuperAdmin.findById(candidateId);
      if (superAdmin) {
        return res.status(403).json({ message: "Access denied: You cannot view the Super Admin profile" });
      }
  
      // ✅ Fetch candidate only from allowed collections ( PM, Employee, TeamLead)
      const allowedCollections = { PM, Employee, TeamLead };
  
      let candidate = null;
      for (const role in allowedCollections) {
        candidate = await allowedCollections[role].findById(candidateId);
        if (candidate) break; // Stop searching once a valid candidate is found
      }
  
      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found or unauthorized to view this profile" });
      }
  
      // Respond with the candidate profile
      res.status(200).json({ message: "Candidate profile fetched successfully", data: candidate });
  
    } catch (error) {
      console.error("❌ Error Viewing Candidate Profile:", error.message);
      res.status(500).json({ message: "Error viewing candidate profile", error: error.message });
    }
  };
  





// ✅ PM - View All Candidates API (with role filtering in the body)
exports.viewAllCandidates = async (req, res) => {
  try {
    const { role } = req.body; // Role passed in the request body

    // Validate role
    if (!['PM', 'Employee', 'TeamLead'].includes(role)) {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    // Dynamically fetch candidates based on role (collection)
    let candidates = [];
    if (role === 'PM') {
      candidates = await PM.find();
    } else if (role === 'Employee') {
      candidates = await Employee.find();
    } else if (role === 'TeamLead') {
      candidates = await TeamLead.find();
    }

    // Remove any super-admin candidates from the result
    candidates = candidates.filter(candidate => candidate.role !== 'super-admin');

    // Return candidates
    res.status(200).json({
      message: "Candidates fetched successfully",
      data: candidates,
    });
  } catch (error) {
    console.error("❌ Error Fetching Candidates:", error.message);
    res.status(500).json({ message: "Error fetching candidates", error: error.message });
  }
};



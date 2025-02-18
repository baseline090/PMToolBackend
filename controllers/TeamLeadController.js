const HR = require('../models/HR');
const HM = require('../models/HM');
const PM = require('../models/PM');
const Employee = require('../models/Employee');
const TeamLead = require('../models/TeamLead');
const SuperAdmin = require('../models/SuperAdmin');
// Mapping roles to their respective models
// const roleModelMap = {
//   TeamLead: TeamLead,
//   TeamLead: TeamLead,
//   Employee: Employee,
//   TeamLead: TeamLead,
// };




// ✅ Update HR Profile
exports.updateTeamLeadProfile = async (req, res) => {
  try {
    const { id } = req.user; // Extracted from JWT
    const { name, username, dob, mobile, email, residenceAddress } = req.body;

    // 1️⃣ **Check if the logged-in user is HR**
    const teamlead = await TeamLead.findOne({ _id: id, role: "TeamLead" });

    if (!teamlead) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    // 2️⃣ **Update the profile fields if provided**
    if (name) teamlead.name = name;
    if (username) teamlead.username = username;
    if (dob) teamlead.dob = dob;
    if (mobile) teamlead.mobile = mobile;
    if (email) teamlead.email = email;
    if (residenceAddress) teamlead.residenceAddress = residenceAddress;

    await teamlead.save();

    res.status(200).json({ message: "TeamLead profile updated successfully", data: teamlead });

  } catch (error) {
    console.error("❌ Error Updating TeamLead Profile:", error.message);
    res.status(500).json({ message: "Error updating profile", error: error.message });
  }
};



exports.viewCandidate = async (req, res) => {
    try {
      const { candidateId } = req.body; // Get the candidate ID from the request body
      const teamleadId = req.user.id; // TeamLead ID from JWT
  
      // Fetch the TeamLead user to check their access
      const teamlead = await TeamLead.findById(teamleadId);
      if (!teamlead) {
        return res.status(404).json({ message: "TeamLead not found" });
      }
  
      // Check if TeamLead has 'view' permission
      if (!teamlead.access.includes("view")) {
        return res.status(403).json({ message: "Access denied: You do not have permission to view profiles" });
      }
  
      // Check if the candidate is a Super Admin - TeamLead cannot view Super Admin profiles
      const superAdmin = await SuperAdmin.findById(candidateId);
      if (superAdmin) {
        return res.status(403).json({ message: "Access denied: You cannot view the Super Admin profile" });
      }
  
      // ✅ Fetch candidate only from allowed collections ( Employee, TeamLead)
      const allowedCollections = {Employee, TeamLead };
  
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
  





// ✅ TeamLead - View All Candidates API (with role filtering in the body)
exports.viewAllCandidates = async (req, res) => {
  try {
    const { role } = req.body; // Role passed in the request body

    // Validate role
    if (!['TeamLead', 'Employee', 'TeamLead'].includes(role)) {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    // Dynamically fetch candidates based on role (collection)
    let candidates = [];
    if (role === 'Employee') {
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


const HR = require('../models/HR');
const HM = require('../models/HM');
const PM = require('../models/PM');
const Employee = require('../models/Employee');
const TeamLead = require('../models/TeamLead');
const SuperAdmin = require('../models/SuperAdmin');
// Mapping roles to their respective models
// const roleModelMap = {
//   HM: HM,
//   HM: HM,
//   Employee: Employee,
//   TeamLead: TeamLead,
// };




// ✅ Update HR Profile
exports.updateHMProfile = async (req, res) => {
  try {
    const { id } = req.user; // Extracted from JWT
    const { name, username, dob, mobile, email, residenceAddress } = req.body;

    // 1️⃣ **Check if the logged-in user is HR**
    const hm = await HM.findOne({ _id: id, role: "HM" });

    if (!hm) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    // 2️⃣ **Update the profile fields if provided**
    if (name) hm.name = name;
    if (username) hm.username = username;
    if (dob) hm.dob = dob;
    if (mobile) hm.mobile = mobile;
    if (email) hm.email = email;
    if (residenceAddress) hm.residenceAddress = residenceAddress;

    await hm.save();

    res.status(200).json({ message: "HM profile updated successfully", data: hm });

  } catch (error) {
    console.error("❌ Error Updating HM Profile:", error.message);
    res.status(500).json({ message: "Error updating profile", error: error.message });
  }
};



exports.viewCandidate = async (req, res) => {
    try {
      const { candidateId } = req.body; // Get the candidate ID from the request body
      const hmId = req.user.id; // HM ID from JWT
  
      // Fetch the HM user to check their access
      const hm = await HM.findById(hmId);
      if (!hm) {
        return res.status(404).json({ message: "HM not found" });
      }
  
      // Check if HM has 'view' permission
      if (!hm.access.includes("view")) {
        return res.status(403).json({ message: "Access denied: You do not have permission to view profiles" });
      }
  
      // Check if the candidate is a Super Admin - HM cannot view Super Admin profiles
      const superAdmin = await SuperAdmin.findById(candidateId);
      if (superAdmin) {
        return res.status(403).json({ message: "Access denied: You cannot view the Super Admin profile" });
      }
  
      // ✅ Fetch candidate only from allowed collections ( HM, Employee, TeamLead)
      const allowedCollections = { HM, Employee, TeamLead };
  
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
  





// ✅ HM - View All Candidates API (with role filtering in the body)
exports.viewAllCandidates = async (req, res) => {
  try {
    const { role } = req.body; // Role passed in the request body

    // Validate role
    if (!['HM', 'Employee', 'TeamLead'].includes(role)) {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    // Dynamically fetch candidates based on role (collection)
    let candidates = [];
    if (role === 'HM') {
      candidates = await HM.find();
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



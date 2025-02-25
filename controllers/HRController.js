const HR = require('../models/HR');
const BDM = require('../models/BDM');
const HM = require('../models/HM');
const PM = require('../models/PM');
const Employee = require('../models/Employee');
const TeamLead = require('../models/TeamLead');
const SuperAdmin = require('../models/SuperAdmin');
// Mapping roles to their respective models
const roleModelMap = {
  BDM: BDM,
  HM: HM,
  PM: PM,
  Employee: Employee,
  TeamLead: TeamLead,
};




// ✅ Update HR Profile
exports.updateHRProfile = async (req, res) => {
  try {
    const { id } = req.user; // Extracted from JWT
    const { name, username, dob, mobile, email, residenceAddress } = req.body;

    // 1️⃣ **Check if the logged-in user is HR**
    const hr = await HR.findOne({ _id: id, role: "HR" });

    if (!hr) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    // 2️⃣ **Update the profile fields if provided**
    if (name) hr.name = name;
    if (username) hr.username = username;
    if (dob) hr.dob = dob;
    if (mobile) hr.mobile = mobile;
    if (email) hr.email = email;
    if (residenceAddress) hr.residenceAddress = residenceAddress;

    await hr.save();

    res.status(200).json({ message: "HR profile updated successfully", data: hr });

  } catch (error) {
    console.error("❌ Error Updating HR Profile:", error.message);
    res.status(500).json({ message: "Error updating profile", error: error.message });
  }
};



// ✅ HR - Add Candidate API (with Access Control)
exports.addCandidate = async (req, res) => {
    try {
      const { name, username, password, confirmPassword, dob, mobile, email, residenceAddress, role } = req.body;
      const hrId = req.user.id; // HR ID from JWT
  
      console.log("🔹 HR Adding Candidate:", req.body);
  
      // Allowed roles for adding (Admins & Super Admins cannot be added)
      const allowedRoles = ["HR", "BDM", "PM", "Employee", "TeamLead", "HM"];
  
      // Fetch the HR user to check their access
      const hr = await HR.findById(hrId);
      if (!hr) {
        return res.status(404).json({ message: "HR not found" });
      }
  
      // Check if HR has 'add' permission
      if (!hr.access.includes("add")) {
        return res.status(403).json({ message: "Access denied: You do not have permission to add candidates" });
      }
  
      // Check Required Fields
      if (!name || !username || !password || !confirmPassword || !dob || !mobile || !email || !residenceAddress || !role) {
        return res.status(400).json({ message: "All fields are required" });
      }
  
      // Check if the role is valid & allowed
      if (!allowedRoles.includes(role)) {
        return res.status(403).json({ message: "Access denied: You cannot add this role" });
      }
  
      // Check if passwords match
      if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
      }
  
      // Check if username, email, or mobile already exists in any collection
      const isUserExists = async (field, value) => {
        for (const model of Object.values(roleModelMap)) {
          if (await model.findOne({ [field]: value })) return true;
        }
        return false;
      };
  
      if (await isUserExists("username", username)) {
        return res.status(400).json({ message: "Username already exists" });
      }
      if (await isUserExists("email", email)) {
        return res.status(400).json({ message: "Email already exists" });
      }
      if (await isUserExists("mobile", mobile)) {
        return res.status(400).json({ message: "Mobile number already exists" });
      }
  
      // Create New Candidate
      const RoleModel = roleModelMap[role];
      const newCandidate = new RoleModel({
        name,
        username,
        password,
        dob,
        mobile,
        email,
        residenceAddress,
        role,
      });
  
      await newCandidate.save();
  
      console.log(`✅ ${role} Added Successfully:`, newCandidate);
      res.status(201).json({ message: `${role} added successfully`, data: newCandidate });
  
    } catch (error) {
      console.error("❌ Error Adding Candidate:", error.message);
      res.status(500).json({ message: "Error adding candidate", error: error.message });
    }
  };
  


// ✅ HR - Delete Candidate API (with Access Control)
exports.deleteCandidate = async (req, res) => {
  try {
    const { candidateId, role } = req.body;
    const hrId = req.user.id; // HR ID from JWT

    console.log("🔹 HR Deleting Candidate:", req.body);

    // Forbidden: HR cannot delete Super Admin
    if (role === "super-admin") {
      return res.status(403).json({ message: "Access denied: You cannot delete a Super Admin" });
    }

    // Fetch the HR user to check their access
    const hr = await HR.findById(hrId);
    if (!hr) {
      return res.status(404).json({ message: "HR not found" });
    }

    // Check if HR has 'delete' permission
    if (!hr.access.includes("delete")) {
      return res.status(403).json({ message: "Access denied: You do not have permission to delete candidates" });
    }

    // Fetch the candidate to delete based on role
    const RoleModel = roleModelMap[role];
    const candidate = await RoleModel.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: `${role} not found` });
    }

    // Delete the candidate
    await RoleModel.findByIdAndDelete(candidateId);

    console.log(`✅ ${role} Deleted Successfully:`, candidate);
    res.status(200).json({ message: `${role} deleted successfully`, data: candidate });

  } catch (error) {
    console.error("❌ Error Deleting Candidate:", error.message);
    res.status(500).json({ message: "Error deleting candidate", error: error.message });
  }
};



// ✅ HR - View Candidate Profile API (with Access Control)
exports.viewCandidate = async (req, res) => {
  try {
    const { candidateId } = req.body; // Get the candidate ID from the request body
    const hrId = req.user.id; // HR ID from JWT

    // Fetch the HR user to check their access
    const hr = await HR.findById(hrId);
    if (!hr) {
      return res.status(404).json({ message: "HR not found" });
    }

    // Check if HR has 'view' permission
    if (!hr.access.includes("view")) {
      return res.status(403).json({ message: "Access denied: You do not have permission to view profiles" });
    }

    // Check if the candidate is a Super Admin - HR cannot view Super Admin profiles
    const superAdmin = await SuperAdmin.findById(candidateId);
    if (superAdmin) {
      return res.status(403).json({ message: "Access denied: You cannot view the Super Admin profile" });
    }

    // Fetch the candidate profile to view from allowed collections (if not Super Admin)
    const candidate = await HR.findById(candidateId) || 
                      await BDM.findById(candidateId) ||
                      await HM.findById(candidateId) ||
                      await PM.findById(candidateId) ||
                      await Employee.findById(candidateId) ||
                      await TeamLead.findById(candidateId);
    
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    // Respond with the candidate profile
    res.status(200).json({ message: "Candidate profile fetched successfully", data: candidate });

  } catch (error) {
    console.error("❌ Error Viewing Candidate Profile:", error.message);
    res.status(500).json({ message: "Error viewing candidate profile", error: error.message });
  }
};



// ✅ HR - View All Candidates API (with role filtering in the body)
exports.viewAllCandidates = async (req, res) => {
  try {
    const { role } = req.body; // Role passed in the request body

    // Validate role
    if (!['BDM', 'HM', 'PM', 'Employee', 'TeamLead'].includes(role)) {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    // Dynamically fetch candidates based on role (collection)
    let candidates = [];
    if (role === 'BDM') {
      candidates = await BDM.find();
    } else if (role === 'HM') {
      candidates = await HM.find();
    } else if (role === 'PM') {
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



// ✅ HR - Update Candidate Profile API (with Access Control)
exports.updateCandidate = async (req, res) => {
  try {
    const { candidateId, updatedFields } = req.body;  // Get the candidate ID and the fields to update
    const hrId = req.user.id; // HR ID from JWT

    // Fetch the HR user to check their access
    const hr = await HR.findById(hrId);
    if (!hr) {
      return res.status(404).json({ message: "HR not found" });
    }

    // Check if HR has 'update' or 'edit' permission
    if (!(hr.access.includes("update") || hr.access.includes("edit"))) {
      return res.status(403).json({ message: "Access denied: You do not have permission to update profiles" });
    }

    // Fetch the candidate profile to update
    const candidate = await HR.findById(candidateId) || 
                      await BDM.findById(candidateId) ||
                      await HM.findById(candidateId) ||
                      await PM.findById(candidateId) ||
                      await Employee.findById(candidateId) ||
                      await TeamLead.findById(candidateId);
    
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    // Check if candidate is Super Admin, HR can't update Super Admin profiles
    const superAdmin = await SuperAdmin.findById(candidateId);
    if (superAdmin) {
      return res.status(403).json({ message: "Access denied: You cannot update the Super Admin profile" });
    }

    // Update the candidate profile with the provided fields
    Object.assign(candidate, updatedFields);
    await candidate.save();

    // Respond with the updated candidate profile
    res.status(200).json({ message: "Candidate profile updated successfully", data: candidate });

  } catch (error) {
    console.error("❌ Error Updating Candidate Profile:", error.message);
    res.status(500).json({ message: "Error updating candidate profile", error: error.message });
  }
};




// ✅ HR - Assign Project to Candidate API (Fixed - No Duplicates)
exports.assignProjectToCandidate = async (req, res) => {
  try {
      const { candidateId, project, role } = req.body;
      const hrId = req.user.id; // HR ID from JWT

      console.log("🔹 HR Assigning Project:", req.body);

      // 🔍 Fetch the HR user from DB
      const hr = await HR.findById(hrId);
      if (!hr) {
          return res.status(404).json({ message: "HR not found" });
      }

      // 🔍 Check if the HR has the required role & permissions
      if (hr.role !== "HR" || !hr.permissions.includes("projects")) {
          return res.status(403).json({ message: "Access denied: You are not authorized to assign projects" });
      }

      // 🔍 Validate role (Must be Employee or TeamLead)
      if (!["Employee", "TeamLead"].includes(role)) {
          return res.status(400).json({ message: "Invalid role. Must be 'Employee' or 'TeamLead'" });
      }

      let candidateModel;
      if (role === "Employee") {
          candidateModel = Employee;
      } else if (role === "TeamLead") {
          candidateModel = TeamLead;
      }

      // 🔍 Find the candidate
      const candidate = await candidateModel.findById(candidateId);
      if (!candidate) {
          return res.status(404).json({ message: `${role} not found` });
      }

      // 🚨 Check if the project already exists in the projects array
      if (candidate.projects.includes(project)) {
          return res.status(400).json({ message: `Project '${project}' is already assigned to ${role}` });
      }

      // ✅ Add the project since it's not a duplicate
      candidate.projects.push(project);
      await candidate.save();

      console.log(`✅ Project '${project}' assigned to ${role} ID: ${candidateId}`);
      res.status(200).json({ message: `Project '${project}' assigned successfully to ${role}`, data: candidate });

  } catch (error) {
      console.error("❌ Error Assigning Project:", error.message);
      res.status(500).json({ message: "Error assigning project", error: error.message });
  }
};




// ✅ HR - Remove Assigned Project API
exports.removeAssignedProject = async (req, res) => {
  try {
      const { candidateId, project, role } = req.body;
      const hrId = req.user.id; // HR ID from JWT

      console.log("🔹 HR Removing Project:", req.body);

      // 🔍 Fetch the HR user from DB
      const hr = await HR.findById(hrId);
      if (!hr) {
          return res.status(404).json({ message: "HR not found" });
      }

      // 🔍 Check if the HR has the required role & permissions
      if (hr.role !== "HR" || !hr.permissions.includes("projects")) {
          return res.status(403).json({ message: "Access denied: You are not authorized to remove projects" });
      }

      // Select the correct model based on the role
      let CandidateModel;
      if (role === "Employee") {
          CandidateModel = Employee;
      } else if (role === "TeamLead") {
          CandidateModel = TeamLead;
      } else {
          return res.status(400).json({ message: "Invalid role provided" });
      }

      // 🔍 Find the Candidate in the database
      const candidate = await CandidateModel.findById(candidateId);
      if (!candidate) {
          return res.status(404).json({ message: "Candidate not found" });
      }

      // Check if the project exists in the candidate's projects array
      if (!candidate.projects.includes(project)) {
          return res.status(404).json({ message: "Project not assigned to this candidate" });
      }

      // ✅ Remove the project from the array
      candidate.projects = candidate.projects.filter(proj => proj !== project);
      await candidate.save();

      console.log(`✅ Project '${project}' removed from Candidate ID: ${candidateId}`);
      res.status(200).json({ message: `Project '${project}' removed successfully`, data: candidate });

  } catch (error) {
      console.error("❌ Error Removing Project:", error.message);
      res.status(500).json({ message: "Error removing project", error: error.message });
  }
};
 


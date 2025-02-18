const HR = require('../models/HR');
const HM = require('../models/HM');
const PM = require('../models/PM');
const TeamLead = require('../models/TeamLead');
const Employee = require('../models/Employee');
const SuperAdmin = require('../models/SuperAdmin');
// Mapping roles to their respective models
// const roleModelMap = {
//   Employee: Employee,
//   Employee: Employee,
//   Employee: Employee,
//   Employee: Employee,
// };




// ✅ Update HR Profile
exports.updateEmployeeProfile = async (req, res) => {
  try {
    const { id } = req.user; // Extracted from JWT
    const { name, username, dob, mobile, email, residenceAddress } = req.body;

    // 1️⃣ **Check if the logged-in user is HR**
    const employee = await Employee.findOne({ _id: id, role: "Employee" });

    if (!employee) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    // 2️⃣ **Update the profile fields if provided**
    if (name) employee.name = name;
    if (username) employee.username = username;
    if (dob) employee.dob = dob;
    if (mobile) employee.mobile = mobile;
    if (email) employee.email = email;
    if (residenceAddress) employee.residenceAddress = residenceAddress;

    await employee.save();

    res.status(200).json({ message: "Employee profile updated successfully", data: employee });

  } catch (error) {
    console.error("❌ Error Updating Employee Profile:", error.message);
    res.status(500).json({ message: "Error updating profile", error: error.message });
  }
};



exports.viewCandidate = async (req, res) => {
    try {
      const { candidateId } = req.body; // Get the candidate ID from the request body
      const employeeId = req.user.id; // Employee ID from JWT
  
      // Fetch the Employee user to check their access
      const employee = await Employee.findById(employeeId);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
  
      // Check if Employee has 'view' permission
      if (!employee.access.includes("view")) {
        return res.status(403).json({ message: "Access denied: You do not have permission to view profiles" });
      }
  
      // Check if the candidate is a Super Admin - Employee cannot view Super Admin profiles
      const superAdmin = await SuperAdmin.findById(candidateId);
      if (superAdmin) {
        return res.status(403).json({ message: "Access denied: You cannot view the Super Admin profile" });
      }
  
      // ✅ Fetch candidate only from allowed collections ( Employee, Employee)
      const allowedCollections = {Employee };
  
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
  





// ✅ Employee - View All Candidates API (with role filtering in the body)
exports.viewAllCandidates = async (req, res) => {
  try {
    const { role } = req.body; // Role passed in the request body

    // Validate role
    if (!['Employee', 'Employee', 'Employee'].includes(role)) {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    // Dynamically fetch candidates based on role (collection)
    let candidates = [];
    if (role === 'Employee') {
      candidates = await Employee.find();
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


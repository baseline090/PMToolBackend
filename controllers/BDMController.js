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
exports.updateBDMProfile = async (req, res) => {
  try {
    const { id } = req.user; // Extracted from JWT
    const { name, username, dob, mobile, email, residenceAddress } = req.body;

    // 1️⃣ **Check if the logged-in user is HR**
    const bdm = await BDM.findOne({ _id: id, role: "BDM" });

    if (!bdm) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    // 2️⃣ **Update the profile fields if provided**
    if (name) bdm.name = name;
    if (username) bdm.username = username;
    if (dob) bdm.dob = dob;
    if (mobile) bdm.mobile = mobile;
    if (email) bdm.email = email;
    if (residenceAddress) bdm.residenceAddress = residenceAddress;

    await bdm.save();

    res.status(200).json({ message: "BDM profile updated successfully", data: bdm });

  } catch (error) {
    console.error("❌ Error Updating BDM Profile:", error.message);
    res.status(500).json({ message: "Error updating profile", error: error.message });
  }
};



// ✅ BDM - Add Candidate API (with Access Control)
exports.addCandidate = async (req, res) => {
    try {
      const { name, username, password, confirmPassword, dob, mobile, email, residenceAddress, role } = req.body;
      const bdmId = req.user.id; // BDM ID from JWT
  
      console.log("🔹 BDM Adding Candidate:", req.body);
  
      // Allowed roles for adding (Admins & Super Admins cannot be added)
      const allowedRoles = ["PM", "Employee", "TeamLead", "HM"];
  
      // Fetch the BDM user to check their access
      const bdm = await BDM.findById(bdmId);
      if (!bdm) {
        return res.status(404).json({ message: "BDM not found" });
      }
  
      // Check if BDM has 'add' permission
      if (!bdm.access.includes("add")) {
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
  


// // ✅ BDM - Delete Candidate API (with Access Control)
// exports.deleteCandidate = async (req, res) => {
//   try {
//     const { candidateId, role } = req.body;
//     const bdmId = req.user.id; // BDM ID from JWT

//     console.log("🔹 BDM Deleting Candidate:", req.body);

//     // Forbidden: HR cannot delete Super Admin
//     if (role === "super-admin") {
//       return res.status(403).json({ message: "Access denied: You cannot delete a Super Admin" });
//     }

//     // Fetch the HR user to check their access
//     const bdm = await BDM.findById(bdmId);
//     if (!bdm) {
//       return res.status(404).json({ message: "BDM not found" });
//     }

//     // Check if BDM has 'delete' permission
//     if (!bdm.access.includes("delete")) {
//       return res.status(403).json({ message: "Access denied: You do not have permission to delete candidates" });
//     }

//     // Fetch the candidate to delete based on role
//     const RoleModel = roleModelMap[role];
//     const candidate = await RoleModel.findById(candidateId);
//     if (!candidate) {
//       return res.status(404).json({ message: `${role} not found` });
//     }

//     // Delete the candidate
//     await RoleModel.findByIdAndDelete(candidateId);

//     console.log(`✅ ${role} Deleted Successfully:`, candidate);
//     res.status(200).json({ message: `${role} deleted successfully`, data: candidate });

//   } catch (error) {
//     console.error("❌ Error Deleting Candidate:", error.message);
//     res.status(500).json({ message: "Error deleting candidate", error: error.message });
//   }
// };



// ✅ BDM - Delete Candidate API (with Access Control)
exports.deleteCandidate = async (req, res) => {
    try {
      const { candidateId, role } = req.body;
      const bdmId = req.user.id; // BDM ID from JWT
  
      console.log("🔹 BDM Deleting Candidate:", req.body);
  
      // Forbidden: BDM cannot delete Super Admin or HR
      if (role === "super-admin" || role === "HR") {
        return res.status(403).json({ message: "Access denied: You cannot delete this role" });
      }
  
      // Fetch the BDM user to check their access
      const bdm = await BDM.findById(bdmId);
      if (!bdm) {
        return res.status(404).json({ message: "BDM not found" });
      }
  
      // Check if BDM has 'delete' permission
      if (!bdm.access.includes("delete")) {
        return res.status(403).json({ message: "Access denied: You do not have permission to delete candidates" });
      }
  
      // ✅ Only allow BDM to delete these roles
      const allowedRoles = ["PM", "Employee", "TeamLead", "HM"];
  
      if (!allowedRoles.includes(role)) {
        return res.status(403).json({ message: "Access denied: You can only delete PM, Employee, TeamLead, or HM" });
      }
  
      // Fetch the candidate to delete
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
  
  








// // ✅ BDM - View Candidate Profile API (with Access Control)
// exports.viewCandidate = async (req, res) => {
//     try {
//       const { candidateId } = req.body; // Get the candidate ID from the request body
//       const bdmId = req.user.id; // BDM ID from JWT
  
//       // Fetch the BDM user to check their access
//       const bdm = await BDM.findById(bdmId);
//       if (!bdm) {
//         return res.status(404).json({ message: "BDM not found" });
//       }
  
//       // Check if BDM has 'view' permission
//       if (!bdm.access.includes("view")) {
//         return res.status(403).json({ message: "Access denied: You do not have permission to view profiles" });
//       }
  
//       // Check if the candidate is a Super Admin - BDM cannot view Super Admin profiles
//       const superAdmin = await SuperAdmin.findById(candidateId);
//       if (superAdmin) {
//         return res.status(403).json({ message: "Access denied: You cannot view the Super Admin profile" });
//       }
  
//       // ✅ Fetch candidate only from allowed collections (PM, Employee, TeamLead, HM)
//       const allowedCollections = [PM, Employee, TeamLead, HM];
  
//       let candidate = null;
//       for (const Model of allowedCollections) {
//         candidate = await Model.findById(candidateId);
//         if (candidate) break; // Stop searching once a valid candidate is found
//       }
  
//       if (!candidate) {
//         return res.status(404).json({ message: "BDM not found or unauthorized to view this profile" });
//       }
  
//       // Respond with the candidate profile
//       res.status(200).json({ message: "Candidate profile fetched successfully", data: candidate });
  
//     } catch (error) {
//       console.error("❌ Error Viewing Candidate Profile:", error.message);
//       res.status(500).json({ message: "Error viewing candidate profile", error: error.message });
//     }
//   };
  



// ✅ BDM - View Candidate Profile API (with Access Control)
exports.viewCandidate = async (req, res) => {
    try {
      const { candidateId } = req.body; // Get the candidate ID from the request body
      const bdmId = req.user.id; // BDM ID from JWT
  
      // Fetch the BDM user to check their access
      const bdm = await BDM.findById(bdmId);
      if (!bdm) {
        return res.status(404).json({ message: "BDM not found" });
      }
  
      // Check if BDM has 'view' permission
      if (!bdm.access.includes("view")) {
        return res.status(403).json({ message: "Access denied: You do not have permission to view profiles" });
      }
  
      // Check if the candidate is a Super Admin - BDM cannot view Super Admin profiles
      const superAdmin = await SuperAdmin.findById(candidateId);
      if (superAdmin) {
        return res.status(403).json({ message: "Access denied: You cannot view the Super Admin profile" });
      }
  
      // ✅ Fetch candidate only from allowed collections (HM, PM, Employee, TeamLead)
      const allowedCollections = { HM, PM, Employee, TeamLead };
  
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
  





// ✅ BDM - View All Candidates API (with role filtering in the body)
exports.viewAllCandidates = async (req, res) => {
  try {
    const { role } = req.body; // Role passed in the request body

    // Validate role
    if (!['HM', 'PM', 'Employee', 'TeamLead'].includes(role)) {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    // Dynamically fetch candidates based on role (collection)
    let candidates = [];
    if (role === 'HM') {
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



// // ✅ BDM - Update Candidate Profile API (with Access Control)
// exports.updateCandidate = async (req, res) => {
//   try {
//     const { candidateId, updatedFields } = req.body;  // Get the candidate ID and the fields to update
//     const bdmId = req.user.id; // HR ID from JWT

//     // Fetch the BDM user to check their access
//     const bdm = await BDM.findById(bdmId);
//     if (!bdm) {
//       return res.status(404).json({ message: "BDM not found" });
//     }

//     // Check if BDM has 'update' or 'edit' permission
//     if (!(bdm.access.includes("update") || bdm.access.includes("edit"))) {
//       return res.status(403).json({ message: "Access denied: You do not have permission to update profiles" });
//     }

//     // Fetch the candidate profile to update
//     const candidate = await BDM.findById(candidateId) ||
//                       await HM.findById(candidateId) ||
//                       await PM.findById(candidateId) ||
//                       await Employee.findById(candidateId) ||
//                       await TeamLead.findById(candidateId);
    
//     if (!candidate) {
//       return res.status(404).json({ message: "Candidate not found" });
//     }

//     // Check if candidate is Super Admin, BDM can't update Super Admin profiles
//     const superAdmin = await SuperAdmin.findById(candidateId);
//     if (superAdmin) {
//       return res.status(403).json({ message: "Access denied: You cannot update the Super Admin profile" });
//     }

//     // Update the candidate profile with the provided fields
//     Object.assign(candidate, updatedFields);
//     await candidate.save();

//     // Respond with the updated candidate profile
//     res.status(200).json({ message: "Candidate profile updated successfully", data: candidate });

//   } catch (error) {
//     console.error("❌ Error Updating Candidate Profile:", error.message);
//     res.status(500).json({ message: "Error updating candidate profile", error: error.message });
//   }
// };



// ✅ BDM - Update Candidate Profile API (with Access Control)
exports.updateCandidate = async (req, res) => {
    try {
      const { candidateId, updatedFields } = req.body;  // Get the candidate ID and the fields to update
      const bdmId = req.user.id; // BDM ID from JWT
  
      // Fetch the BDM user to check their access
      const bdm = await BDM.findById(bdmId);
      if (!bdm) {
        return res.status(404).json({ message: "BDM not found" });
      }
  
      // Check if BDM has 'update' or 'edit' permission
      if (!(bdm.access.includes("update") || bdm.access.includes("edit"))) {
        return res.status(403).json({ message: "Access denied: You do not have permission to update profiles" });
      }
  
      // Check if the candidate is a Super Admin - BDM cannot update Super Admin profiles
      const superAdmin = await SuperAdmin.findById(candidateId);
      if (superAdmin) {
        return res.status(403).json({ message: "Access denied: You cannot update the Super Admin profile" });
      }
  
      // ✅ Fetch candidate only from allowed collections (HM, PM, Employee, TeamLead)
      const allowedCollections = [HM, PM, Employee, TeamLead];
  
      let candidate = null;
      for (const Model of allowedCollections) {
        candidate = await Model.findById(candidateId);
        if (candidate) break; // Stop searching once a valid candidate is found
      }
  
      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found or  you are unauthorized to update this profile" });
      }
  
      // Update the candidate profile with the provided fields
      Object.assign(candidate, updatedFields);
      await candidate.save();
  
      // Respond with the updated candidate profile
      res.status(200).json({ message: "Candidate profile updated successfully", data: candidate });
  
    } catch (error) {
      console.error("❌ Error Updating Candidate Profile:", error.message);
      res.status(500).json({ message: "Error updating candidate profile you must have put unique value that was already not present in the db", error: error.message });
    }
  };
  







// ✅ BDM - Assign Project to Candidate API (Fixed)
exports.assignProjectToCandidate = async (req, res) => {
  try {
      const { candidateId, project, role } = req.body;
      const bdmId = req.user.id; // BDM ID from JWT

      console.log("🔹 BDM Assigning Project:", req.body);

      // 🔍 Fetch the BDM user from DB
      const bdm = await BDM.findById(bdmId);
      if (!bdm) {
          return res.status(404).json({ message: "BDM not found" });
      }

      // 🔍 Check if the BDM has the required role & permissions
      if (bdm.role !== "BDM" || !bdm.permissions.includes("projects")) {
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

      // 🔍 Find the candidate and update projects array using `$push`
      const updatedCandidate = await candidateModel.findByIdAndUpdate(
          candidateId,
          { $push: { projects: project } }, // ✅ Use `$push` to add to the array
          { new: true } // Return the updated document
      );

      if (!updatedCandidate) {
          return res.status(404).json({ message: `${role} not found` });
      }

      console.log(`✅ Project '${project}' assigned to ${role} ID: ${candidateId}`);
      res.status(200).json({ message: `Project '${project}' assigned successfully to ${role}`, data: updatedCandidate });

  } catch (error) {
      console.error("❌ Error Assigning Project:", error.message);
      res.status(500).json({ message: "Error assigning project", error: error.message });
  }
};



// ✅ BDM - Remove Assigned Project API
exports.removeAssignedProject = async (req, res) => {
  try {
      const { candidateId, project, role } = req.body;
      const bdmId = req.user.id; // BDM ID from JWT

      console.log("🔹 BDM Removing Project:", req.body);

      // 🔍 Fetch the BDM user from DB
      const bdm = await BDM.findById(bdmId);
      if (!bdm) {
          return res.status(404).json({ message: "BDM not found" });
      }

      // 🔍 Check if the BDM has the required role & permissions
      if (bdm.role !== "BDM" || !bdm.permissions.includes("projects")) {
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
 
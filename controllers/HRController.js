const HR = require('../models/HR');
const BDM = require('../models/BDM');
const HM = require('../models/HM');
const PM = require('../models/PM');
const Employee = require('../models/Employee');
const TeamLead = require('../models/TeamLead');

// Mapping roles to their respective models
const roleModelMap = {
  BDM: BDM,
  HM: HM,
  PM: PM,
  Employee: Employee,
  TeamLead: TeamLead,
};

// // ✅ HR - Add Candidate API (with Access Control)
// exports.addCandidate = async (req, res) => {
//   try {
//     const { name, username, password, confirmPassword, dob, mobile, email, residenceAddress, role } = req.body;
//     const hrId = req.user.id; // Assuming HR is logged in and ID is available from JWT

//     console.log("🔹 HR Adding Candidate:", req.body);

//     // Check if HR exists and has the required access
//     const hr = await HR.findById(hrId);
//     if (!hr) {
//       return res.status(404).json({ message: "HR not found" });
//     }

//     // Check if HR has 'add' permission in the access field
//     if (!hr.access.includes("add")) {
//       return res.status(403).json({ message: "Access denied: You do not have permission to add candidates" });
//     }

//     // Check Required Fields
//     if (!name || !username || !password || !confirmPassword || !dob || !mobile || !email || !residenceAddress || !role) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     // Check if role is valid
//     if (!roleModelMap[role]) {
//       return res.status(400).json({ message: "Invalid role" });
//     }

//     // Check if passwords match
//     if (password !== confirmPassword) {
//       return res.status(400).json({ message: "Passwords do not match" });
//     }

//     // Check if username, email, or mobile already exists in any collection
//     const isUserExists = async (field, value) => {
//       for (const model of Object.values(roleModelMap)) {
//         if (await model.findOne({ [field]: value })) return true;
//       }
//       return false;
//     };

//     if (await isUserExists("username", username)) {
//       return res.status(400).json({ message: "Username already exists" });
//     }
//     if (await isUserExists("email", email)) {
//       return res.status(400).json({ message: "Email already exists" });
//     }
//     if (await isUserExists("mobile", mobile)) {
//       return res.status(400).json({ message: "Mobile number already exists" });
//     }

//     // Create New Candidate
//     const RoleModel = roleModelMap[role];
//     const newCandidate = new RoleModel({
//       name,
//       username,
//       password,
//       dob,
//       mobile,
//       email,
//       residenceAddress,
//       role,
//     });

//     await newCandidate.save();

//     console.log(`✅ ${role} Added Successfully:`, newCandidate);
//     res.status(201).json({ message: `${role} added successfully`, data: newCandidate });

//   } catch (error) {
//     console.error("❌ Error Adding Candidate:", error.message);
//     res.status(500).json({ message: "Error adding candidate", error: error.message });
//   }
// };





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
  


// exports.deleteCandidate = async (req, res) => {
//     try {
//       const { role, id } = req.params; // Candidate role and ID
//       const hrId = req.user.id; // Logged-in HR's ID
  
//       console.log("🔹 HR Deleting Candidate:", { role, id });
  
//       // Allowed roles for deletion (Admins & Super Admins cannot be deleted)
//       const allowedRoles = ["HR", "BDM", "PM", "Employee", "TeamLead", "HM"];
  
//       // Check if the role is allowed
//       if (!allowedRoles.includes(role)) {
//         return res.status(403).json({ message: "Access denied: You cannot delete this role" });
//       }
  
//       // Fetch the HR user to check their access
//       const hr = await HR.findById(hrId);
//       if (!hr) {
//         return res.status(404).json({ message: "HR not found" });
//       }
  
//       // Check if HR has 'delete' permission
//       if (!hr.access.includes("delete")) {
//         return res.status(403).json({ message: "Access denied: You do not have permission to delete candidates" });
//       }
  
//       // Check if the role exists in the mapped models
//       if (!roleModelMap[role]) {
//         return res.status(400).json({ message: "Invalid role" });
//       }
  
//       // Get the corresponding model
//       const RoleModel = roleModelMap[role];
  
//       // Find the candidate
//       const candidate = await RoleModel.findById(id);
//       if (!candidate) {
//         return res.status(404).json({ message: `${role} not found` });
//       }
  
//       // Delete the candidate
//       await RoleModel.findByIdAndDelete(id);
  
//       console.log(`✅ ${role} Deleted Successfully:`, candidate);
//       res.status(200).json({ message: `${role} deleted successfully` });
  
//     } catch (error) {
//       console.error("❌ Error Deleting Candidate:", error.message);
//       res.status(500).json({ message: "Error deleting candidate", error: error.message });
//     }
//   };
  




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

const SuperAdmin = require("../models/SuperAdmin");
const HR = require("../models/HR");
const BDM = require("../models/BDM");
const HM = require("../models/HM");
const PM = require("../models/PM");
const Employee = require("../models/Employee");
const TeamLead = require("../models/TeamLead");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const roleModelMap = {
  SuperAdmin: SuperAdmin,
  HR: HR,
  HM: HM,
  BDM: BDM,
  PM: PM,
  Employee: Employee,
  TeamLead: TeamLead,
};

// 📌 Helper function to check if username, email, or mobile exists in any collection
const isUserExists = async (field, value) => {
  for (const Model of Object.values(roleModelMap)) {
    const existingUser = await Model.findOne({ [field]: value });
    if (existingUser) return true;
  }
  return false;
};

// ✅ Register Super Admin
exports.registerSuperAdmin = async (req, res) => {
  try {
    const { name, username, password, confirmPassword, dob, mobile, email, residenceAddress } = req.body;

    console.log("🔹 Received Super Admin Registration Request:", req.body);

    // 1️⃣ **Check for Required Fields**
    if (!name || !username || !password || !confirmPassword || !dob || !mobile || !email || !residenceAddress) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 2️⃣ **Check if passwords match**
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // 3️⃣ **Check if username, email, or mobile already exists in any collection**
    if (await isUserExists("username", username)) {
      return res.status(400).json({ message: "Username already exists" });
    }
    if (await isUserExists("email", email)) {
      return res.status(400).json({ message: "Email already exists" });
    }
    if (await isUserExists("mobile", mobile)) {
      return res.status(400).json({ message: "Mobile number already exists" });
    }

    // 4️⃣ **Create and Save Super Admin**
    const newSuperAdmin = new SuperAdmin({
      name,
      username,
      password,
      dob,
      mobile,
      email,
      residenceAddress,
      access: "full-access", // ✅ Assigning full access to Super Admin
    });
    await newSuperAdmin.save();

    console.log("✅ Super Admin Registered Successfully:", newSuperAdmin);
    res.status(201).json({ message: "Super Admin registered successfully", data: newSuperAdmin });

  } catch (error) {
    console.error("❌ Error Registering Super Admin:", error.message);
    res.status(500).json({ message: "Error registering Super Admin", error: error.message });
  }
};

// // ✅ Admin/Sub-Admin Login
// exports.adminLogin = async (req, res) => {
//   try {
//     const { username, password } = req.body;

//     if (!username || !password) {
//       return res.status(400).json({ message: "Username and password are required" });
//     }

//     let user = null;
//     let userType = null;

//     // 🔍 First, check in SuperAdmin collection
//     const superAdminUser = await SuperAdmin.findOne({ username });
//     if (superAdminUser) {
//       user = superAdminUser;
//       userType = "SuperAdmin";
//     }

//     // 🔍 If not found in SuperAdmin, check in role-based collections (HR, BDM, PM, Employee, TeamLead)
//     if (!user) {
//       for (const [role, Model] of Object.entries(roleModelMap)) {
//         const roleUser = await Model.findOne({ username });
//         if (roleUser) {
//           user = roleUser;
//           userType = role;
//           break;
//         }
//       }
//     }

//     // ❌ If user not found, return error
//     if (!user) {
//       return res.status(400).json({ message: "Invalid username or password" });
//     }

//     // 🔑 Compare password
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: "Invalid username or password" });
//     }

//     // 🛡️ Generate JWT token
//     const tokenPayload = {
//       id: user._id,
//       role: userType,
//       access: user.access,
//       status: user.status
//     };

//     // 🎯 Add permissions if not Super Admin
//     if (userType !== "SuperAdmin") {
//       tokenPayload.permissions = user.permissions || [];
//     }

//     const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: "1d" });

//     // ✅ Response with Token & User Info
//     res.json({
//       message: "Login successful",
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         username: user.username,
//         email: user.email,
//         role: userType,
//         access: user.access,
//         status: user.status,
//         permissions: user.permissions || [],
//       },
//     });

//   } catch (error) {
//     console.error("❌ Login Error:", error.message);
//     res.status(500).json({ message: "Error logging in", error: error.message });
//   }
// };


// ✅ Admin/Sub-Admin Login
exports.adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    let user = null;
    let userType = null;

    // 🔍 First, check in SuperAdmin collection
    const superAdminUser = await SuperAdmin.findOne({ username });
    if (superAdminUser) {
      user = superAdminUser;
      userType = "SuperAdmin";
    }

    // 🔍 If not found in SuperAdmin, check in role-based collections (HR, BDM, PM, Employee, TeamLead)
    if (!user) {
      for (const [role, Model] of Object.entries(roleModelMap)) {
        const roleUser = await Model.findOne({ username });
        if (roleUser) {
          user = roleUser;
          userType = role;
          break;
        }
      }
    }

    // ❌ If user not found, return error
    if (!user) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    // 🔑 Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    // ❌ Check if account is active before issuing a token
    if (user.status !== "Active") {
      return res.status(403).json({ message: "Your account is not active. Please contact admin." });
    }

    // 🛡️ Generate JWT token
    const tokenPayload = {
      id: user._id,
      role: userType,
      access: user.access,
      status: user.status
    };

    // 🎯 Add permissions if not Super Admin
    if (userType !== "SuperAdmin") {
      tokenPayload.permissions = user.permissions || [];
    }

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: "1d" });

//     // ✅ Response with Token & User Info
//     res.json({
//       message: "Login successful",
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         username: user.username,
//         email: user.email,
//         role: userType,
//         access: user.access,
//         status: user.status,
//         permissions: user.permissions || [],
//       },
//     });

//   } catch (error) {
//     console.error("❌ Login Error:", error.message);
//     res.status(500).json({ message: "Error logging in", error: error.message });
//   }
// };



// ✅ Response with Token & User Info
res.status(200).json({
  status: 200,
  message: "Login successful",
  token,
  user: {
    id: user._id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: userType,
    access: user.access,
    status: user.status,
    permissions: user.permissions || [],
  },
});

} catch (error) {
console.error("❌ Login Error:", error.message);
res.status(500).json({ status: 500, message: "Error logging in", error: error.message });
}
};










// ✅ Update Super Admin Profile
exports.updateSuperAdminProfile = async (req, res) => {
  try {
    const { id } = req.user; // Extracted from JWT
    const { name, username, dob, mobile, email, residenceAddress } = req.body;

    // 1️⃣ **Check if the logged-in user is a Super Admin with full access**
    const superAdmin = await SuperAdmin.findOne({ _id: id, access: "full-access", role: "super-admin" });

    if (!superAdmin) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    // 2️⃣ **Update the profile fields if provided**
    if (name) superAdmin.name = name;
    if (username) superAdmin.username = username;
    if (dob) superAdmin.dob = dob;
    if (mobile) superAdmin.mobile = mobile;
    if (email) superAdmin.email = email;
    if (residenceAddress) superAdmin.residenceAddress = residenceAddress;

    await superAdmin.save();

    res.status(200).json({ message: "Super Admin profile updated successfully", data: superAdmin });

  } catch (error) {
    console.error("❌ Error Updating Super Admin Profile:", error.message);
    res.status(500).json({ message: "Error updating profile", error: error.message });
  }
};







// ✅ Register Admin/Sub-Admin
exports.registerAdminSubAdmin = async (req, res) => {
  try {
    const { name, username, password, confirmPassword, dob, mobile, email, residenceAddress, role, permissions, access } = req.body;

    console.log("🔹 Received Admin/Sub-Admin Registration Request:", req.body);

    // 1️⃣ **Check for Required Fields**
    if (!name || !username || !password || !confirmPassword || !dob || !mobile || !email || !residenceAddress || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 2️⃣ **Validate Role**
    if (!roleModelMap[role]) {
      return res.status(400).json({ message: "Invalid role" });
    }

        // 🔹 **Check if password meets length requirement**
        if (password.length < 6) {
          return res.status(400).json({ message: "Please set password with at least 6 characters." });
        }
  

    // 3️⃣ **Check if passwords match**
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // 4️⃣ **Check if username, email, or mobile already exists**
    if (await isUserExists("username", username)) {
      return res.status(400).json({ message: "Username already exists" });
    }
    if (await isUserExists("email", email)) {
      return res.status(400).json({ message: "Email already exists" });
    }
    if (await isUserExists("mobile", mobile)) {
      return res.status(400).json({ message: "Mobile number already exists" });
    }

    // 5️⃣ **Check if Super Admin has full access**
    const superAdmin = await SuperAdmin.findOne({ role: "super-admin", access: "full-access" });
    if (!superAdmin) {
      return res.status(403).json({ message: "Super Admin does not have full access" });
    }

    // 6️⃣ **Default Role-Permission Mapping**
    const rolePermissionsMap = {
      HR: ["dashboard", "employee", "tasks", "Notice", "leaves"],
      BDM: ["dashboard", "projects", "interviews", "Notice", "Accounts"],
      PM: ["dashboard", "projects", "teamManagement"],
      HM: ["dashboard", "projects", "teamManagement"],
      Employee: ["dashboard", "tasks", "team", "performance"],
      TeamLead: ["dashboard", "tasks", "team", "performance"],
    };

    // 7️⃣ **Default Access Control Mapping**
    const roleAccessMap = {
      HR: "view,edit,update,add,delete",
      BDM: "view,edit,update,add,delete",
      PM: "view",
      HM: "view",
      Employee: "view",
      TeamLead: "view",
    };

    // Use provided permissions from frontend if available, otherwise fallback to defaults
    const assignedPermissions = permissions?.length ? permissions : rolePermissionsMap[role] || [];
    const assignedAccess = access || roleAccessMap[role] || "restricted";

    // 8️⃣ **Create and Save Admin/Sub-Admin**
    const RoleModel = roleModelMap[role];
    const newAdmin = new RoleModel({
      name,
      username,
      password,
      dob,
      mobile,
      email,
      residenceAddress,
      role,
      permissions: assignedPermissions,
      access: assignedAccess, // ✅ Store access level
    });

    await newAdmin.save();

    console.log(`✅ ${role} Registered Successfully:`, newAdmin);
    res.status(201).json({ message: `${role} registered successfully`, data: newAdmin });

  } catch (error) {
    console.error("❌ Error Registering Admin/Sub-Admin:", error.message);
    res.status(500).json({ message: "Error registering", error: error.message });
  }
};





// ✅ View All Candidates for Super Admin
exports.viewAllCandidates = async (req, res) => {
  try {
    const { role } = req.body; // Role passed in the request body
    const superAdmin = await SuperAdmin.findOne({ access: 'full-access', role: 'super-admin' });

    if (!superAdmin) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    // Validate role
    if (!['BDM', 'HR', 'HM', 'PM', 'Employee', 'TeamLead'].includes(role)) {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    // Fetch candidates based on role
    let candidates = [];
    switch(role) {
      case 'BDM':
        candidates = await BDM.find();
        break;
      case 'HR':
        candidates = await HR.find();
        break;
      case 'HM':
        candidates = await HM.find();
        break;
      case 'PM':
        candidates = await PM.find();
        break;
      case 'Employee':
        candidates = await Employee.find();
        break;
      case 'TeamLead':
        candidates = await TeamLead.find();
        break;
    }

    res.status(200).json({
      message: "Candidates fetched successfully",
      data: candidates,
    });
  } catch (error) {
    console.error("❌ Error Fetching Candidates:", error.message);
    res.status(500).json({ message: "Error fetching candidates", error: error.message });
  }
};

// ✅ Delete Candidate for Super Admin
exports.deleteCandidate = async (req, res) => {
  try {
    const { candidateId } = req.body; // Candidate ID passed in the request body
    const superAdmin = await SuperAdmin.findOne({ access: 'full-access', role: 'super-admin' });

    if (!superAdmin) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    // Check if the candidate exists in any collection and delete
    let candidateFound = false;
    const collections = [BDM, HR, HM, PM, Employee, TeamLead];
    for (const Model of collections) {
      const candidate = await Model.findById(candidateId);
      if (candidate) {
        await Model.findByIdAndDelete(candidateId);
        candidateFound = true;
        break;
      }
    }

    if (!candidateFound) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    res.status(200).json({ message: "Candidate deleted successfully" });
  } catch (error) {
    console.error("❌ Error Deleting Candidate:", error.message);
    res.status(500).json({ message: "Error deleting candidate", error: error.message });
  }
};

// ✅ Update Candidate for Super Admin
exports.updateCandidate = async (req, res) => {
  try {
    const { candidateId, updateData, role } = req.body; // Candidate ID and update data passed in the request body
    const superAdmin = await SuperAdmin.findOne({ access: 'full-access', role: 'super-admin' });

    if (!superAdmin) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    // Validate role
    if (!['BDM', 'HR', 'HM', 'PM', 'Employee', 'TeamLead'].includes(role)) {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    // Find and update candidate in the respective collection
    let updatedCandidate = null;
    switch(role) {
      case 'BDM':
        updatedCandidate = await BDM.findByIdAndUpdate(candidateId, updateData, { new: true });
        break;
      case 'HR':
        updatedCandidate = await HR.findByIdAndUpdate(candidateId, updateData, { new: true });
        break;
      case 'HM':
        updatedCandidate = await HM.findByIdAndUpdate(candidateId, updateData, { new: true });
        break;
      case 'PM':
        updatedCandidate = await PM.findByIdAndUpdate(candidateId, updateData, { new: true });
        break;
      case 'Employee':
        updatedCandidate = await Employee.findByIdAndUpdate(candidateId, updateData, { new: true });
        break;
      case 'TeamLead':
        updatedCandidate = await TeamLead.findByIdAndUpdate(candidateId, updateData, { new: true });
        break;
    }

    if (!updatedCandidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    res.status(200).json({
      message: "Candidate updated successfully",
      data: updatedCandidate,
    });
  } catch (error) {
    console.error("❌ Error Updating Candidate:", error.message);
    res.status(500).json({ message: "Error updating candidate", error: error.message });
  }
};












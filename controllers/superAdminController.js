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
      userType = "super-admin";
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

    // 🛡️ Generate JWT token
    const tokenPayload = {
      id: user._id,
      role: userType,
    };

    // 🎯 Add permissions if not Super Admin
    if (userType !== "super-admin") {
      tokenPayload.permissions = user.permissions || [];
    }

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: "1d" });

    // ✅ Response with Token & User Info
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        role: userType,
        permissions: user.permissions || [],
      },
    });

  } catch (error) {
    console.error("❌ Login Error:", error.message);
    res.status(500).json({ message: "Error logging in", error: error.message });
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















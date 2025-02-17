
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const tokenBlacklist = require('../utils/tokenBlacklist');

// Register Admin
exports.registerAdmin = async (req, res) => {
  const { email, password, confirmPassword, role } = req.body;

  console.log("Received request body:", req.body);  // Log the request body

  // Validate the role
  const validRoles = ['super-admin', 'sub-admin', 'admin'];
  if (!validRoles.includes(role)) {
    console.log("Invalid role:", role);  // Log invalid role
    return res.status(400).json({ message: 'Invalid role. Please choose a valid role: super-admin, sub-admin, or admin.' });
  }

  if (password !== confirmPassword) {
    console.log("Passwords do not match");  // Log mismatch error
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  try {
    console.log("Checking if admin already exists...");  // Log checking process
    // Check if admin already exists by email
    const existingAdmin = await Admin.findOne({ email });
    console.log("Existing admin found:", existingAdmin);  // Log result of check

    if (existingAdmin) {
      console.log("Email is already registered:", email);  // Log the duplicate email issue
      return res.status(400).json({ message: 'This email is already registered' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Password hashed:", hashedPassword);  // Log hashed password

    // Create a new admin
    const newAdmin = new Admin({
      email,
      password: hashedPassword,
      role,  // Save the chosen role
    });

    console.log("Saving new admin to DB:", newAdmin);  // Log before saving to DB
    await newAdmin.save();
    res.status(201).json({ message: 'Admin registered successfully' });
  } catch (error) {
    console.error("Error occurred:", error);  // Log the error details
    res.status(500).json({ message: 'Server error' });
  }
};

// Login Admin
exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log("Login attempt for:", email);

    // Find user by email (Removed role restriction)
    const admin = await Admin.findOne({ email });
    console.log("Admin found:", admin);

    if (!admin) {
      console.log("Admin not found for email:", email);
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    console.log("Password match status:", isMatch);

    if (!isMatch) {
      console.log("Invalid password for:", email);
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate JWT with role info
    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
    );

    console.log("Login successful, token generated for:", email);
    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin Logout
exports.adminLogout = (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  console.log("Logout request received. Token:", token);

  if (!token) {
    console.log("Token not provided in logout request");
    return res.status(400).json({ message: 'Token not provided' });
  }

  tokenBlacklist.addToken(token);
  console.log("Token added to blacklist. Logout successful.");
  res.status(200).json({ message: 'Admin successfully logged out' });
};




////-------------SUPER-ADMIN-CONTROLLER------------------------------///


const rolesPermissionsMap = {
  HR: ["dashboard", "employee", "tasks", "Notice", "leaves"],
  BDM: ["dashboard", "projects", "interviews", "Notice", "Accounts"],
  PM: ["dashboard"],
};

exports.registerAdminSubAdmin = async (req, res) => {
  try {
    const { name, dob, mobileNo, email, residenceAddress, password, confirmPassword, role, subRole, permissions } = req.body;

    // Only Super Admin can perform this action
    if (req.user.role !== 'super-admin') {
      return res.status(403).json({ message: "Access denied. Only Super Admin can create admins/sub-admins." });
    }

    // Validate required fields
    if (!name || !dob || !mobileNo || !email || !residenceAddress || !password || !confirmPassword || !role) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    // Validate role
    if (!['admin', 'sub-admin'].includes(role)) {
      return res.status(400).json({ message: "Invalid role. Must be 'admin' or 'sub-admin'." });
    }

    // Validate subRole if sub-admin
    if (role === 'sub-admin' && !['HR', 'BDM', 'PM'].includes(subRole)) {
      return res.status(400).json({ message: "Invalid subRole. Must be 'HR', 'BDM', or 'PM'." });
    }

    // Check if email already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Email already exists." });
    }

    // Assign default permissions if none are provided
    const assignedPermissions = permissions && permissions.length > 0 ? permissions : rolesPermissionsMap[subRole] || [];

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the Admin/Sub-Admin
    const newAdmin = new Admin({
      name,
      dob,
      mobileNo,
      email,
      residenceAddress,
      password: hashedPassword,
      role,
      subRole: role === 'sub-admin' ? subRole : null,
      permissions: assignedPermissions
    });

    await newAdmin.save();
    res.status(201).json({ message: "Admin/Sub-Admin registered successfully", admin: newAdmin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};













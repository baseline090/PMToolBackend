
const Employee = require("../models/Employee");


// // ✅ Create Employee Controller
// exports.createEmployee = async (req, res) => {
//   try {
//     const { role, access, status } = req.user; // Extract role, access, and status from JWT

//     console.log(`🔹 Employee Creation Requested by: ${role} | Access: ${access} | Status: ${status}`);

//     // ❌ Check if the user's account is active
//     if (status !== "Active") {
//       return res.status(403).json({ status: 403, message: "Your account is not active. Please contact admin." });
//     }

//     // ❌ Check authorization (Only HR, BDM, SuperAdmin with 'add' access can proceed)
//     if (!["HR", "BDM", "SuperAdmin"].includes(role) || !access.includes("add")) {
//       return res.status(403).json({ status: 403, message: "You are not authorized to add employees." });
//     }

//     // ✅ Extract employee details from request body
//     const {
//       name,
//       username,
//       password,
//       confirmPassword,
//       email,
//       dob,
//       mobile,
//       residenceAddress,
//       city,
//       gender,
//       designation,
//       team,
//       joiningdate, // ✅ Added this line to fix the issue
//     } = req.body;

//     // ❌ Check if all required fields are provided
//     if (!name || !username || !password || !confirmPassword || !email || !dob || !mobile || !residenceAddress || !city || !gender) {
//       return res.status(400).json({ status: 400, message: "All fields are required." });
//     }

//     // ❌ Check if password & confirmPassword match
//     if (password !== confirmPassword) {
//       return res.status(400).json({ status: 400, message: "Passwords do not match." });
//     }

//     // ✅ Create new Employee (Do NOT hash password here, schema handles it)
//     const newEmployee = new Employee({
//       name,
//       username,
//       password, // Will be hashed automatically in the schema
//       email,
//       dob,
//       mobile,
//       residenceAddress,
//       city,
//       gender,
//       designation: designation || "", // Defaults to empty if not provided
//       team: team || [], // Defaults to an empty array
//       role: "Employee",
//       permissions: ["dashboard", "employee"], // Default permissions
//       access: "view", // Default access
//       status: "Active",
//       joiningdate: joiningdate ? joiningdate : new Date().toLocaleDateString("en-GB"), // ✅ Allows custom date or defaults to today
//     });

//     // 💾 Save Employee to DB
//     await newEmployee.save();

//     console.log(`✅ Employee Created Successfully: ${name}`);
//     res.status(201).json({
//       status: 201,
//       message: "Employee account created successfully.",
//       employee: {
//         id: newEmployee._id,
//         name: newEmployee.name,
//         username: newEmployee.username,
//         email: newEmployee.email,
//         role: newEmployee.role,
//         status: newEmployee.status,
//         gender: newEmployee.gender,
//         city: newEmployee.city,
//         designation: newEmployee.designation || "Not Specified", // Prevents null values
//         team: Array.isArray(newEmployee.team) ? newEmployee.team : [], // Ensures array format
//         joiningdate: newEmployee.joiningdate, // ✅ Returns the correct joining date
//       },
//     });

//   } catch (error) {
//     console.error("❌ Error Creating Employee:", error.message);

//     // ❌ Handle MongoDB Duplicate Key Errors
//     if (error.code === 11000) {
//       const duplicateKey = Object.keys(error.keyPattern)[0]; // Get the field that caused the duplicate error

//       let errorMessage = "Duplicate entry detected.";
//       if (duplicateKey === "username") errorMessage = "Username is already taken.";
//       else if (duplicateKey === "email") errorMessage = "Email is already registered.";
//       else if (duplicateKey === "mobile") errorMessage = "Mobile number is already in use.";

//       return res.status(400).json({ status: 400, message: errorMessage });
//     }

//     // ❌ Handle General Errors
//     res.status(500).json({ status: 500, message: "Error creating employee", error: error.message });
//   }
// };





// ✅ Create Employee Controller
exports.createEmployee = async (req, res) => {
  try {
    const { role, access, status } = req.user; // Extract role, access, and status from JWT

    console.log(`🔹 Employee Creation Requested by: ${role} | Access: ${access} | Status: ${status}`);

    // ❌ Check if the user's account is active
    if (status !== "Active") {
      return res.status(403).json({ status: 403, message: "Your account is not active. Please contact admin." });
    }

    // ❌ Check authorization (Only HR, BDM, SuperAdmin with 'add' access can proceed)
    if (!["HR", "BDM", "SuperAdmin"].includes(role) || !access.includes("add")) {
      return res.status(403).json({ status: 403, message: "You are not authorized to add employees." });
    }

    // ✅ Extract employee details from request body
    const {
      name,
      user_name, // ✅ Changed to match frontend request body
      password,
      email,
      dob,
      phone, // ✅ Changed to match frontend request body
      address, // ✅ Changed to match frontend request body
      city,
      gender,
      designation,
      team,
      joining_date, // ✅ Changed to match frontend request body
    } = req.body;

    // ❌ Check if all required fields are provided
    if (!name || !user_name || !password || !email || !dob || !phone || !address || !city || !gender) {
      return res.status(400).json({ status: 400, message: "All fields are required." });
    }

    // ✅ Create new Employee (Do NOT hash password here, schema handles it)
    const newEmployee = new Employee({
      name,
      username: user_name, // ✅ Match frontend key
      password, // Will be hashed automatically in the schema
      email,
      dob,
      mobile: phone, // ✅ Match frontend key
      residenceAddress: address, // ✅ Match frontend key
      city,
      gender,
      designation: designation || "", // Defaults to empty if not provided
      team: team || "", // Defaults to empty string
      role: "Employee",
      permissions: ["dashboard", "employee"], // Default permissions
      access: "view", // Default access
      status: "Active",
      joiningdate: joining_date ? joining_date : new Date().toLocaleDateString("en-GB"), // ✅ Match frontend key
    });

    // 💾 Save Employee to DB
    await newEmployee.save();

    console.log(`✅ Employee Created Successfully: ${name}`);
    res.status(201).json({
      status: 201,
      message: "Employee account created successfully.",
      employee: {
        id: newEmployee._id,
        name: newEmployee.name,
        username: newEmployee.username,
        email: newEmployee.email,
        role: newEmployee.role,
        status: newEmployee.status,
        gender: newEmployee.gender,
        city: newEmployee.city,
        designation: newEmployee.designation || "Not Specified", // Prevents null values
        team: newEmployee.team || "Not Assigned", // Ensures string format
        joiningdate: newEmployee.joiningdate, // ✅ Returns the correct joining date
      },
    });

  } catch (error) {
    console.error("❌ Error Creating Employee:", error.message);

    // ❌ Handle MongoDB Duplicate Key Errors
    if (error.code === 11000) {
      const duplicateKey = Object.keys(error.keyPattern)[0]; // Get the field that caused the duplicate error

      let errorMessage = "Duplicate entry detected.";
      if (duplicateKey === "username") errorMessage = "Username is already taken.";
      else if (duplicateKey === "email") errorMessage = "Email is already registered.";
      else if (duplicateKey === "mobile") errorMessage = "Mobile number is already in use.";

      return res.status(400).json({ status: 400, message: errorMessage });
    }

    // ❌ Handle General Errors
    res.status(500).json({ status: 500, message: "Error creating employee", error: error.message });
  }
};

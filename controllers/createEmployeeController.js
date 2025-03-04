



const Employee = require("../models/Employee");

// // ✅ Create Employee Controller
// exports.createEmployee = async (req, res) => {
//   try {
//     const { role, access, status } = req.user; // Extract role, access, and status from JWT

//     console.log(`🔹 Employee Creation Requested by: ${role} | Access: ${access} | Status: ${status}`);

//     // ❌ Check if the user's account is active
//     if (status !== "Active") {
//       return res.status(403).json({ message: "Your account is not active. Please contact admin." });
//     }

//     // ❌ Check authorization (Only HR, BDM, SuperAdmin with 'add' access can proceed)
//     if (!["HR", "BDM", "SuperAdmin"].includes(role) || !access.includes("add")) {
//       return res.status(403).json({ message: "You are not authorized to add employees." });
//     }

//     // ✅ Extract employee details from request body
//     const { name, username, password, confirmPassword, email, dob, mobile, residenceAddress } = req.body;

//     if (!name || !username || !password || !confirmPassword || !email || !dob || !mobile || !residenceAddress) {
//       return res.status(400).json({ message: "All fields are required." });
//     }

//     // ❌ Check if password & confirmPassword match
//     if (password !== confirmPassword) {
//       return res.status(400).json({ message: "Passwords do not match." });
//     }

//     // ✅ Create new Employee (Do NOT hash password here)
//     const newEmployee = new Employee({
//       name,
//       username,
//       password, // Save plain text, hashing will happen in the schema
//       email,
//       dob,
//       mobile,
//       residenceAddress,
//       role: "Employee",
//       status: "Active",
//     });

//     // 💾 Save Employee to DB
//     await newEmployee.save();

//     console.log(`✅ Employee Created Successfully: ${name}`);
//     res.status(201).json({
//       message: "Employee account created successfully.",
//       employee: {
//         id: newEmployee._id,
//         name: newEmployee.name,
//         username: newEmployee.username,
//         email: newEmployee.email,
//         role: newEmployee.role,
//         status: newEmployee.status,
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

//       return res.status(400).json({ message: errorMessage });
//     }

//     // ❌ Handle General Errors
//     res.status(500).json({ message: "Error creating employee", error: error.message });
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
    const { name, username, password, confirmPassword, email, dob, mobile, residenceAddress } = req.body;

    if (!name || !username || !password || !confirmPassword || !email || !dob || !mobile || !residenceAddress) {
      return res.status(400).json({ status: 400, message: "All fields are required." });
    }

    // ❌ Check if password & confirmPassword match
    if (password !== confirmPassword) {
      return res.status(400).json({ status: 400, message: "Passwords do not match." });
    }

    // ✅ Create new Employee (Do NOT hash password here)
    const newEmployee = new Employee({
      name,
      username,
      password, // Save plain text, hashing will happen in the schema
      email,
      dob,
      mobile,
      residenceAddress,
      role: "Employee",
      status: "Active",
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

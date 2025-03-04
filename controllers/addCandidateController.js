
const bcrypt = require("bcrypt");
const HR = require("../models/HR");
const BDM = require("../models/BDM");
const HM = require("../models/HM");
const PM = require("../models/PM");
const Employee = require("../models/Employee");
const TeamLead = require("../models/TeamLead");
const SuperAdmin = require("../models/SuperAdmin");

// Mapping role to its respective model
const roleModelMap = {
    HR,
    BDM,
    Employee,
    TeamLead,
    PM,
    HM,
};

// ✅ Define Role-Based Add Permissions (Hierarchy)
const roleAddPermissions = {
    SuperAdmin: ["HR", "BDM", "Employee", "TeamLead", "HM", "PM"],
    HR: ["BDM", "Employee", "TeamLead", "HM", "PM"],
    BDM: ["Employee", "TeamLead", "HM", "PM"],
};

// // ✅ Add Candidate API (Role & Access-Based)
// exports.addCandidate = async (req, res) => {
//     try {
//         const { name, username, password, confirmPassword, dob, mobile, email, residenceAddress, role } = req.body;
//         const { id: userId, role: userRole, access, status } = req.user; // ✅ Extract `status` from JWT

//         console.log("🔹 Adding Candidate:", req.body, "By:", userRole, "Access:", access, "Status:", status);

//         // ❌ Check if the user's status is "Active"
//         if (status !== "Active") {
//             return res.status(403).json({ message: "Access denied: Your account is not active" });
//         }

//         // ❌ SuperAdmin cannot be added by anyone
//         if (role === "SuperAdmin") {
//             return res.status(403).json({ message: "You cannot add a SuperAdmin" });
//         }

//         // ✅ Check if the user has the correct access permission
//         const hasAddPermission =
//             (userRole === "SuperAdmin" && access === "full-access" && roleAddPermissions.SuperAdmin.includes(role)) ||
//             (userRole in roleAddPermissions && roleAddPermissions[userRole].includes(role) && access.includes("add"));

//         if (!hasAddPermission) {
//             return res.status(403).json({ message: "Access denied: You do not have permission to add this role" });
//         }

//         // 🔍 Validate required fields
//         if (!name || !username || !password || !confirmPassword || !dob || !mobile || !email || !residenceAddress || !role) {
//             return res.status(400).json({ message: "All fields are required" });
//         }

//         // ❌ Check if passwords match
//         if (password !== confirmPassword) {
//             return res.status(400).json({ message: "Passwords do not match" });
//         }

//         // 🔍 Check if username, email, or mobile already exists in any collection
//         const isUserExists = async (field, value) => {
//             for (const model of Object.values(roleModelMap)) {
//                 if (await model.findOne({ [field]: value })) return true;
//             }
//             return false;
//         };

//         if (await isUserExists("username", username)) {
//             return res.status(400).json({ message: "Username already exists" });
//         }
//         if (await isUserExists("email", email)) {
//             return res.status(400).json({ message: "Email already exists" });
//         }
//         if (await isUserExists("mobile", mobile)) {
//             return res.status(400).json({ message: "Mobile number already exists" });
//         }

//         // 🔍 Create New Candidate
//         const RoleModel = roleModelMap[role];
//         const hashedPassword = await bcrypt.hash(password, 10);

//         const newCandidate = new RoleModel({
//             name,
//             username,
//             password: hashedPassword,
//             dob,
//             mobile,
//             email,
//             residenceAddress,
//             role,
//         });

//         await newCandidate.save();

//         console.log(`✅ ${role} Added Successfully by ${userRole}:`, newCandidate);
//         res.status(201).json({ message: `${role} added successfully`, data: newCandidate });

//     } catch (error) {
//         console.error("❌ Error Adding Candidate:", error.message);
//         res.status(500).json({ message: "Error adding candidate", error: error.message });
//     }
// };


// ✅ Add Candidate API (Role & Access-Based)
exports.addCandidate = async (req, res) => {
    try {
        const { name, username, password, confirmPassword, dob, mobile, email, residenceAddress, role } = req.body;
        const { id: userId, role: userRole, access, status } = req.user; // ✅ Extract `status` from JWT

        console.log("🔹 Adding Candidate:", req.body, "By:", userRole, "Access:", access, "Status:", status);

        // ❌ Check if the user's status is "Active"
        if (status !== "Active") {
            return res.status(403).json({ status: 403, message: "Access denied: Your account is not active" });
        }

        // ❌ SuperAdmin cannot be added by anyone
        if (role === "SuperAdmin") {
            return res.status(403).json({ status: 403, message: "You cannot add a SuperAdmin" });
        }

        // ✅ Check if the user has the correct access permission
        const hasAddPermission =
            (userRole === "SuperAdmin" && access === "full-access" && roleAddPermissions.SuperAdmin.includes(role)) ||
            (userRole in roleAddPermissions && roleAddPermissions[userRole].includes(role) && access.includes("add"));

        if (!hasAddPermission) {
            return res.status(403).json({ status: 403, message: "Access denied: You do not have permission to add this role" });
        }

        // 🔍 Validate required fields
        if (!name || !username || !password || !confirmPassword || !dob || !mobile || !email || !residenceAddress || !role) {
            return res.status(400).json({ status: 400, message: "All fields are required" });
        }

        // ❌ Check if passwords match
        if (password !== confirmPassword) {
            return res.status(400).json({ status: 400, message: "Passwords do not match" });
        }

        // 🔍 Check if username, email, or mobile already exists in any collection
        const isUserExists = async (field, value) => {
            for (const model of Object.values(roleModelMap)) {
                if (await model.findOne({ [field]: value })) return true;
            }
            return false;
        };

        if (await isUserExists("username", username)) {
            return res.status(400).json({ status: 400, message: "Username already exists" });
        }
        if (await isUserExists("email", email)) {
            return res.status(400).json({ status: 400, message: "Email already exists" });
        }
        if (await isUserExists("mobile", mobile)) {
            return res.status(400).json({ status: 400, message: "Mobile number already exists" });
        }

        // 🔍 Create New Candidate
        const RoleModel = roleModelMap[role];
        const hashedPassword = await bcrypt.hash(password, 10);

        const newCandidate = new RoleModel({
            name,
            username,
            password: hashedPassword,
            dob,
            mobile,
            email,
            residenceAddress,
            role,
        });

        await newCandidate.save();

        console.log(`✅ ${role} Added Successfully by ${userRole}:`, newCandidate);
        res.status(201).json({ status: 201, message: `${role} added successfully`, data: newCandidate });

    } catch (error) {
        console.error("❌ Error Adding Candidate:", error.message);
        res.status(500).json({ status: 500, message: "Error adding candidate", error: error.message });
    }
};

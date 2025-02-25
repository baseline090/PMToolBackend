const HR = require("../models/HR");
const BDM = require("../models/BDM");
const HM = require("../models/HM");
const PM = require("../models/PM");
const Employee = require("../models/Employee");
const TeamLead = require("../models/TeamLead");
const SuperAdmin = require("../models/SuperAdmin");

// ✅ Mapping role to its respective model
const roleModelMap = {
    HR,
    BDM,
    Employee,
    TeamLead,
    PM,
    HM,
    SuperAdmin
};

// ✅ Get Account Details API
exports.getAccountDetails = async (req, res) => {
    try {
        const { id, role } = req.user; // ✅ Extract user ID & Role from JWT

        console.log(`🔹 Fetching Account Details for User ID: ${id}, Role: ${role}`);

        // ✅ Get the respective model based on role
        const RoleModel = roleModelMap[role];
        if (!RoleModel) {
            return res.status(400).json({ message: "Invalid role" });
        }

        // 🔍 Fetch user details from the correct collection
        const userData = await RoleModel.findById(id).select("-password"); // ✅ Exclude password for security

        if (!userData) {
            return res.status(404).json({ message: "User not found" });
        }

        console.log("✅ Account Details Fetched Successfully:", userData);
        res.status(200).json({ message: "Account details retrieved", data: userData });

    } catch (error) {
        console.error("❌ Error Fetching Account Details:", error.message);
        res.status(500).json({ message: "Error retrieving account details", error: error.message });
    }
};

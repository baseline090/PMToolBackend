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

// ✅ Define Role-Based Delete Permissions (Hierarchy)
const roleDeletePermissions = {
    SuperAdmin: ["HR", "BDM", "Employee", "TeamLead", "HM", "PM"],
    HR: ["BDM", "Employee", "TeamLead", "HM", "PM"],
    BDM: ["Employee", "TeamLead", "HM", "PM"],
};

// ✅ Delete Candidate API (Role & Access-Based)
exports.deleteCandidate = async (req, res) => {
    try {
        const { candidateId, role } = req.body;
        const { id: userId, role: userRole, access } = req.user; // ✅ Extract `access` from JWT

        console.log("🔹 Deleting Candidate:", role, "By:", userRole, "Access:", access);

        // ❌ SuperAdmin cannot be deleted by anyone
        if (role === "SuperAdmin") {
            return res.status(403).json({ message: "You cannot delete a SuperAdmin" });
        }

        // ✅ Check if the user has the correct delete permission
        const hasDeletePermission =
            (userRole === "SuperAdmin" && access === "full-access" && roleDeletePermissions.SuperAdmin.includes(role)) ||
            (userRole in roleDeletePermissions && roleDeletePermissions[userRole].includes(role) && access.includes("delete"));

        if (!hasDeletePermission) {
            return res.status(403).json({ message: "Access denied: You do not have permission to delete this role" });
        }

        // 🔍 Get the correct model based on role
        const RoleModel = roleModelMap[role];
        if (!RoleModel) {
            return res.status(400).json({ message: "Invalid role provided" });
        }

        // 🔍 Find and delete the candidate
        const deletedCandidate = await RoleModel.findOneAndDelete({ _id: candidateId });

        if (!deletedCandidate) {
            return res.status(404).json({ message: "Candidate not found" });
        }

        console.log(`✅ ${role} Deleted Successfully by ${userRole}:`, deletedCandidate);
        res.status(200).json({ message: `${role} deleted successfully`, data: deletedCandidate });

    } catch (error) {
        console.error("❌ Error Deleting Candidate:", error.message);
        res.status(500).json({ message: "Error deleting candidate", error: error.message });
    }
};

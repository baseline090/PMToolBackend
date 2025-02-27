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

// // ✅ Update Account Details API
// exports.updateAccountDetails = async (req, res) => {
//     try {
//         const { id, role } = req.user; // ✅ Extract user ID & Role from JWT
//         const updateData = req.body; // ✅ Data to update

//         console.log(`🔹 Updating Account for User ID: ${id}, Role: ${role}, Data:`, updateData);

//         // ✅ Get the respective model based on role
//         const RoleModel = roleModelMap[role];
//         if (!RoleModel) {
//             return res.status(400).json({ message: "Invalid role" });
//         }

//         // 🔍 Update user details in the correct collection
//         const updatedUser = await RoleModel.findByIdAndUpdate(id, updateData, { new: true }).select("-password");

//         if (!updatedUser) {
//             return res.status(404).json({ message: "User not found" });
//         }

//         console.log("✅ Account Updated Successfully:", updatedUser);
//         res.status(200).json({ message: "Account updated successfully", data: updatedUser });

//     } catch (error) {
//         console.error("❌ Error Updating Account Details:", error.message);
//         res.status(500).json({ message: "Error updating account", error: error.message });
//     }
// };




// ✅ Update Account Details API
exports.updateAccountDetails = async (req, res) => {
    try {
        const { id, role, status } = req.user; // ✅ Extract status from JWT
        const updateData = req.body; // ✅ Data to update

        console.log(`🔹 Updating Account for User ID: ${id}, Role: ${role}, Status: ${status}, Data:`, updateData);

        // ❌ Check if the user's status is "Active"
        if (status !== "Active") {
            return res.status(403).json({ message: "Your account is not active" });
        }

        // ✅ Get the respective model based on role
        const RoleModel = roleModelMap[role];
        if (!RoleModel) {
            return res.status(400).json({ message: "Invalid role" });
        }

        // 🔍 Update user details in the correct collection
        const updatedUser = await RoleModel.findByIdAndUpdate(id, updateData, { new: true }).select("-password");

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        console.log("✅ Account Updated Successfully:", updatedUser);
        res.status(200).json({ message: "Account updated successfully", data: updatedUser });

    } catch (error) {
        console.error("❌ Error Updating Account Details:", error.message);
        res.status(500).json({ message: "Error updating account", error: error.message });
    }
};

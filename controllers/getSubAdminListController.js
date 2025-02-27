
const HR = require("../models/HR");
const BDM = require("../models/BDM");
const TeamLead = require("../models/TeamLead");
const PM = require("../models/PM");
const HM = require("../models/HM");
const Employee = require("../models/Employee");
const Admin = require("../models/SuperAdmin");


// ✅ Allowed roles for viewing sub-admins
const authorizedRoles = ["HR", "BDM", "TeamLead", "PM", "HM", "SuperAdmin"];

// ✅ Allowed roles that can fetch all candidates (except SuperAdmin)
const authorizedRoles2 = ["PM", "HM", "HR", "SuperAdmin", "TeamLead", "Employee"];


exports.getSubAdminList = async (req, res) => {
    try {
        const { role, access } = req.user; // Extract role & access from JWT
        const { role: requestedRole } = req.body; // Get role from request body

        console.log(`🔹 Fetching Sub-Admin List - Requested by: ${role} | Access: ${access}`);

        // ✅ Validate requested role
        if (!["HR", "BDM", "TeamLead", "PM", "HM", "Employee"].includes(requestedRole)) {
            return res.status(400).json({ message: "Invalid role specified" });
        }

        let candidates = [];

        // ✅ Fetch only the candidates of the requested role
        switch (requestedRole) {
            case "HR":
                candidates = await HR.find();
                break;
            case "BDM":
                candidates = await BDM.find();
                break;
            case "TeamLead":
                candidates = await TeamLead.find();
                break;
            case "Employee":
                candidates = await Employee.find();
                break;
            case "PM":
                candidates = await PM.find();
                break;
            case "HM":
                candidates = await HM.find();
                break;
        }

        console.log(`✅ ${requestedRole} Candidates Fetched Successfully: ${candidates.length} records`);

        res.status(200).json({
            message: `${requestedRole} candidates fetched successfully`,
            data: candidates,
        });

    } catch (error) {
        console.error("❌ Error Fetching Sub-Admin List:", error.message);
        res.status(500).json({ message: "Error fetching sub-admin list", error: error.message });
    }
};


Admin



exports.getAllCandidates = async (req, res) => {
    try {
        const { role, access } = req.user;

        console.log(`🔹 Fetching All Candidates - Requested by: ${role} | Access: ${access}`);

        // ✅ Check if role is allowed
        const allowedRoles = ["PM", "HM", "HR", "TeamLead", "SuperAdmin", "Employee"];
        if (!allowedRoles.includes(role)) {
            return res.status(403).json({ message: "Access denied" });
        }

        // ✅ Check if access is "view" or "full-access"
        const allowedAccess = ["view", "full-access"];
        const userAccessArray = access.split(","); // Convert access string to array
        if (!userAccessArray.some((acc) => allowedAccess.includes(acc))) {
            return res.status(403).json({ message: "Insufficient access rights" });
        }

        let candidates = [];

        // ✅ SuperAdmin can see all roles, including other SuperAdmins
        if (role === "SuperAdmin") {
            const superAdmins = await Admin.find();
            const hr = await HR.find();
            const bdm = await BDM.find();
            const teamLeads = await TeamLead.find();
            const pms = await PM.find();
            const hms = await HM.find();
            const employees = await Employee.find();

            candidates = [...superAdmins, ...hr, ...bdm, ...teamLeads, ...pms, ...hms, ...employees];
        } else {
            // ✅ Other roles can see all users **except SuperAdmin**
            const hr = await HR.find();
            const bdm = await BDM.find();
            const teamLeads = await TeamLead.find();
            const pms = await PM.find();
            const hms = await HM.find();
            const employees = await Employee.find();

            candidates = [...hr, ...bdm, ...teamLeads, ...pms, ...hms, ...employees];
        }

        console.log(`✅ Candidates Fetched Successfully: ${candidates.length} records`);

        res.status(200).json({
            message: "All candidates fetched successfully",
            data: candidates,
        });

    } catch (error) {
        console.error("❌ Error Fetching Candidates:", error.message);
        res.status(500).json({ message: "Error fetching candidates", error: error.message });
    }
};



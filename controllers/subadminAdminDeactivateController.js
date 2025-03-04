const BDM = require("../models/BDM");
const HR = require("../models/HR");
const HM = require("../models/HM");
const PM = require("../models/PM");
const Employee = require("../models/Employee");
const TeamLead = require("../models/TeamLead");






// exports.activate_deactivateUser = async (req, res) => {
//     try {
//         const { candidateId, status, role: candidateRole } = req.body; // Extracting Candidate ID, new status, and role
//         const { role: userRole, access, status: userStatus } = req.user; // Extracting User Role, Access, and Status from JWT
    
//         console.log(`🔹 Deactivate User Requested by: ${userRole} | Access: ${access} | Status: ${userStatus}`);

//         // ❌ Check if the user's status is "Active"
//         if (userStatus !== "Active") {
//             return res.status(403).json({ message: "Your account is not active" });
//         }

//         // ✅ Allowed Roles & Access Check
//         const allowedRoles = ["HR", "SuperAdmin", "BDM"];
//         const requiredAccess = "delete";
    
//         const userAccessArray = typeof access === "string" ? access.split(",") : access;
//         if (!allowedRoles.includes(userRole) || !userAccessArray.includes(requiredAccess)) {
//           return res.status(403).json({ message: "Access denied" });
//         }
    
//         // ✅ Validate Role of Candidate Being Deactivated
//         const validRoles = ["BDM", "HR", "HM", "PM", "Employee", "TeamLead"];
//         if (!validRoles.includes(candidateRole)) {
//           return res.status(400).json({ message: "Invalid role specified" });
//         }
    
//         // ✅ Validate Status Value
//         const validStatusValues = ["Active", "Deactive"];
//         if (!validStatusValues.includes(status)) {
//           return res.status(400).json({ message: "Invalid status value. Allowed values: 'Active', 'Deactivated'" });
//         }
    
//         // ✅ Find Candidate Before Updating Status
//         let candidate = null;
//         switch (candidateRole) {
//           case "BDM":
//             candidate = await BDM.findById(candidateId);
//             break;
//           case "HR":
//             candidate = await HR.findById(candidateId);
//             break;
//           case "HM":
//             candidate = await HM.findById(candidateId);
//             break;
//           case "PM":
//             candidate = await PM.findById(candidateId);
//             break;
//           case "Employee":
//             candidate = await Employee.findById(candidateId);
//             break;
//           case "TeamLead":
//             candidate = await TeamLead.findById(candidateId);
//             break;
//         }
    
//         if (!candidate) {
//           return res.status(404).json({ message: "Candidate not found" });
//         }
    
//         // ✅ Check if the status is already set
//         if (candidate.status === status) {
//           return res.status(200).json({
//             message: `Candidate status is already '${status}'. No changes made.`,
//             data: {
//                 _id: candidate._id,
//                 name: candidate.name,
//                 status: candidate.status,
//               },
//           });
//         }
    
//         // ✅ Update Candidate Status
//         candidate.status = status;
//         await candidate.save();
    
//         console.log(`✅ Status Updated Successfully for: ${candidateRole} - ${status}`);
//         res.status(200).json({
//           message: `Candidate status updated to '${status}' successfully`,
//           data: {
//             _id: candidate._id,
//             name: candidate.name,
//             status: candidate.status,
//           },
//         });
    
//       } catch (error) {
//         console.error("❌ Error Updating Status:", error.message);
//         res.status(500).json({ message: "Error updating status", error: error.message });
//       }
//     };




exports.activate_deactivateUser = async (req, res) => {
  try {
      const { candidateId, status, role: candidateRole } = req.body; // Extracting Candidate ID, new status, and role
      const { role: userRole, access, status: userStatus } = req.user; // Extracting User Role, Access, and Status from JWT
  
      console.log(`🔹 Deactivate User Requested by: ${userRole} | Access: ${access} | Status: ${userStatus}`);

      // ❌ Check if the user's status is "Active"
      if (userStatus !== "Active") {
          return res.status(403).json({ status: 403, message: "Your account is not active" });
      }

      // ✅ Allowed Roles & Access Check
      const allowedRoles = ["HR", "SuperAdmin", "BDM"];
      const requiredAccess = "delete";
  
      const userAccessArray = typeof access === "string" ? access.split(",") : access;
      if (!allowedRoles.includes(userRole) || !userAccessArray.includes(requiredAccess)) {
        return res.status(403).json({ status: 403, message: "Access denied" });
      }
  
      // ✅ Validate Role of Candidate Being Deactivated
      const validRoles = ["BDM", "HR", "HM", "PM", "Employee", "TeamLead"];
      if (!validRoles.includes(candidateRole)) {
        return res.status(400).json({ status: 400, message: "Invalid role specified" });
      }
  
      // ✅ Validate Status Value
      const validStatusValues = ["Active", "Deactive"];
      if (!validStatusValues.includes(status)) {
        return res.status(400).json({ status: 400, message: "Invalid status value. Allowed values: 'Active', 'Deactivated'" });
      }
  
      // ✅ Find Candidate Before Updating Status
      let candidate = null;
      switch (candidateRole) {
        case "BDM":
          candidate = await BDM.findById(candidateId);
          break;
        case "HR":
          candidate = await HR.findById(candidateId);
          break;
        case "HM":
          candidate = await HM.findById(candidateId);
          break;
        case "PM":
          candidate = await PM.findById(candidateId);
          break;
        case "Employee":
          candidate = await Employee.findById(candidateId);
          break;
        case "TeamLead":
          candidate = await TeamLead.findById(candidateId);
          break;
      }
  
      if (!candidate) {
        return res.status(404).json({ status: 404, message: "Candidate not found" });
      }
  
      // ✅ Check if the status is already set
      if (candidate.status === status) {
        return res.status(200).json({
          status: 200,
          message: `Candidate status is already '${status}'. No changes made.`,
          data: {
              _id: candidate._id,
              name: candidate.name,
              status: candidate.status,
            },
        });
      }
  
      // ✅ Update Candidate Status
      candidate.status = status;
      await candidate.save();
  
      console.log(`✅ Status Updated Successfully for: ${candidateRole} - ${status}`);
      res.status(200).json({
        status: 200,
        message: `Candidate status updated to '${status}' successfully`,
        data: {
          _id: candidate._id,
          name: candidate.name,
          status: candidate.status,
        },
      });
  
    } catch (error) {
      console.error("❌ Error Updating Status:", error.message);
      res.status(500).json({ status: 500, message: "Error updating status", error: error.message });
    }
};

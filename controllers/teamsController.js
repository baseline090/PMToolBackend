const Team = require("../models/Teams");
const Employee = require("../models/Employee");

// ✅ Create Team Controller
// exports.createTeam = async (req, res) => {
//   try {
//     const { role, access, status } = req.user; // Extract role, access, and status from JWT

//     console.log(`🔹 Team Creation Requested by: ${role} | Access: ${access} | Status: ${status}`);

//     // ❌ Check if the user's account is active
//     if (status !== "Active") {
//       return res.status(403).json({ status: 403, message: "Your account is not active. Please contact admin." });
//     }

//     // ❌ Check authorization (Only HR, BDM, SuperAdmin with 'add' or 'full-access' can proceed)
//     if (!["HR", "BDM", "SuperAdmin"].includes(role) || !access.includes("add")) {
//       return res.status(403).json({ status: 403, message: "You are not authorized to create a team." });
//     }

//     // ✅ Extract team details from request body
//     const { team_name, level, type, employees } = req.body;

//     // ❌ Validate required fields
//     if (!team_name || !level || !type) {
//       return res.status(400).json({ status: 400, message: "Team name, level, and type are required." });
//     }

//     // ❌ Validate level (must be 1, 2, 3, 4, or 5)
//     if (![1, 2, 3, 4, 5].includes(level)) {
//       return res.status(400).json({ status: 400, message: "Invalid level. Allowed values: 1, 2, 3, 4, 5." });
//     }

//     // ❌ Validate type (must be "New" or "Old")
//     if (!["New", "Old"].includes(type)) {
//       return res.status(400).json({ status: 400, message: 'Invalid type. Allowed values: "New" or "Old".' });
//     }

//     // ✅ Prepare employee IDs (if provided)
//     let validEmployeeIds = [];
//     if (employees && employees.length > 0) {
//       validEmployeeIds = await Employee.find({ _id: { $in: employees } }).select("_id");
//       if (validEmployeeIds.length !== employees.length) {
//         return res.status(400).json({ status: 400, message: " employee IDs are invalid or not rigistered." });
//       }
//     }

//     // ✅ Create new Team
//     const newTeam = new Team({
//       team_name,
//       level,
//       type,
//       employees: validEmployeeIds.map(emp => emp._id), // Store valid employee IDs
//     });

//     // 💾 Save Team to DB
//     await newTeam.save();

//     console.log(`✅ Team Created Successfully: ${team_name}`);
//     res.status(201).json({
//       status: 201,
//       message: "Team created successfully.",
//       team: {
//         id: newTeam._id,
//         team_name: newTeam.team_name,
//         created_time: newTeam.created_time,
//         level: newTeam.level,
//         type: newTeam.type,
//         employees: newTeam.employees, // Returns employee IDs
//       },
//     });

//   } catch (error) {
//     console.error("❌ Error Creating Team:", error.message);

//     // ❌ Handle MongoDB Duplicate Key Errors
//     if (error.code === 11000) {
//       return res.status(400).json({ status: 400, message: "Team name already exists." });
//     }

//     // ❌ Handle General Errors
//     res.status(500).json({ status: 500, message: "Error creating team", error: error.message });
//   }
// };



exports.createTeam = async (req, res) => {
  try {
    const { role, access, status } = req.user; // Extract role, access, and status from JWT

    console.log(`🔹 Team Creation Requested by: ${role} | Access: ${access} | Status: ${status}`);

    // ❌ Check if the user's account is active
    if (status !== "Active") {
      return res.status(403).json({ status: 403, message: "Your account is not active. Please contact admin." });
    }

    // ❌ Check authorization (Only HR, BDM, SuperAdmin with 'add' or 'full-access' can proceed)
    if (!["HR", "BDM", "SuperAdmin"].includes(role) || !access.includes("add")) {
      return res.status(403).json({ status: 403, message: "You are not authorized to create a team." });
    }

    // ✅ Extract team details from request body
    const { team_name, level, type, employees } = req.body;

    // ❌ Validate required fields
    if (!team_name || !level || !type) {
      return res.status(400).json({ status: 400, message: "Team name, level, and type are required." });
    }

    // ❌ Validate level (must be 1, 2, 3, 4, or 5)
    if (![1, 2, 3, 4, 5].includes(level)) {
      return res.status(400).json({ status: 400, message: "Invalid level. Allowed values: 1, 2, 3, 4, 5." });
    }

    // ❌ Validate type (must be "New" or "Old")
    if (!["New", "Old"].includes(type)) {
      return res.status(400).json({ status: 400, message: 'Invalid type. Allowed values: "New" or "Old".' });
    }

    // ✅ Prepare employee IDs (if provided)
    let validEmployeeIds = [];
    if (employees) {
      let employeeIds = Array.isArray(employees) ? employees : [employees]; // Convert to array if it's a string

      validEmployeeIds = await Employee.find({ _id: { $in: employeeIds } }).select("_id");

      if (validEmployeeIds.length !== employeeIds.length) {
        return res.status(400).json({ status: 400, message: "Employee IDs are invalid or not registered." });
      }
    }

    // ✅ Create new Team
    const newTeam = new Team({
      team_name,
      level,
      type,
      employees: validEmployeeIds.map(emp => emp._id), // Store valid employee IDs
    });

    // 💾 Save Team to DB
    await newTeam.save();

    console.log(`✅ Team Created Successfully: ${team_name}`);
    res.status(201).json({
      status: 201,
      message: "Team created successfully.",
      team: {
        id: newTeam._id,
        team_name: newTeam.team_name,
        created_time: newTeam.created_time,
        level: newTeam.level,
        type: newTeam.type,
        employees: newTeam.employees, // Returns employee IDs
      },
    });

  } catch (error) {
    console.error("❌ Error Creating Team:", error.message);

    // ❌ Handle MongoDB Duplicate Key Errors
    if (error.code === 11000) {
      return res.status(400).json({ status: 400, message: "Team name already exists." });
    }

    // ❌ Handle General Errors
    res.status(500).json({ status: 500, message: "Error creating team", error: error.message });
  }
};



// exports.addEmployeeToTeam = async (req, res) => {
//   try {
//     const { role, access, status } = req.user; // Extract role, access, and status from JWT

//     console.log(`🔹 Employee Addition Requested by: ${role} | Access: ${access} | Status: ${status}`);

//     // ❌ Check if the user's account is active
//     if (status !== "Active") {
//       return res.status(403).json({ status: 403, message: "Your account is not active. Please contact admin." });
//     }

//     // ❌ Check authorization (Only HR, BDM, SuperAdmin with 'add', 'full-access', or 'update' can proceed)
//     if (!["HR", "BDM", "SuperAdmin"].includes(role) || !["add", "full-access", "update"].some(a => access.includes(a))) {
//       return res.status(403).json({ status: 403, message: "You are not authorized to add employees to a team." });
//     }

//     // ✅ Extract team ID and employee IDs from request body
//     const { team_id, employees } = req.body;

//     // ❌ Validate required fields
//     if (!team_id || !employees) {
//       return res.status(400).json({ status: 400, message: "Team ID and employees are required." });
//     }

//     // ✅ Check if the team exists
//     const team = await Team.findById(team_id);
//     if (!team) {
//       return res.status(404).json({ status: 404, message: "Team not found." });
//     }

//     // ✅ Convert employees to an array if it's a single ID
//     let employeeIds = Array.isArray(employees) ? employees : [employees];

//     // ✅ Validate if employees exist in the Employee collection
//     const validEmployees = await Employee.find({ _id: { $in: employeeIds } }).select("_id");
//     if (validEmployees.length !== employeeIds.length) {
//       return res.status(400).json({ status: 400, message: "Some employee IDs are invalid or not registered." });
//     }

//     // ✅ Add employees to the team (Avoid duplicates)
//     team.employees = [...new Set([...team.employees, ...validEmployees.map(emp => emp._id)])];

//     // 💾 Save Team to DB
//     await team.save();

//     console.log(`✅ Employees Added to Team: ${team.team_name}`);
//     res.status(200).json({
//       status: 200,
//       message: "Employees added to team successfully.",
//       team,
//     });

//   } catch (error) {
//     console.error("❌ Error Adding Employees to Team:", error.message);
//     res.status(500).json({ status: 500, message: "Error adding employees to team", error: error.message });
//   }
// };





exports.addEmployeeToTeam = async (req, res) => {
  try {
    const { role, access, status } = req.user; // Extract role, access, and status from JWT

    console.log(`🔹 Employee Addition Requested by: ${role} | Access: ${access} | Status: ${status}`);

    // ❌ Check if the user's account is active
    if (status !== "Active") {
      return res.status(403).json({ status: 403, message: "Your account is not active. Please contact admin." });
    }

    // ❌ Check authorization (Only HR, BDM, SuperAdmin with 'add', 'full-access', or 'update' can proceed)
    if (!["HR", "BDM", "SuperAdmin"].includes(role) || !["add", "full-access", "update"].some(a => access.includes(a))) {
      return res.status(403).json({ status: 403, message: "You are not authorized to add employees to a team." });
    }

    // ✅ Extract team ID and employee IDs from request body
    const { team_id, employees } = req.body;

    // ❌ Validate required fields
    if (!team_id || !employees) {
      return res.status(400).json({ status: 400, message: "Team ID and employees are required." });
    }

    // ✅ Check if the team exists
    const team = await Team.findById(team_id);
    if (!team) {
      return res.status(404).json({ status: 404, message: "Team not found." });
    }

    // ✅ Convert employees to an array if it's a single ID
    let employeeIds = Array.isArray(employees) ? employees : [employees];

    // ✅ Validate if employees exist in the Employee collection
    const validEmployees = await Employee.find({ _id: { $in: employeeIds } }).select("_id");
    if (validEmployees.length !== employeeIds.length) {
      return res.status(400).json({ status: 400, message: "Some employee IDs are invalid or not registered." });
    }

    // ✅ Filter out duplicate employee IDs that are already in the team
    const newEmployees = validEmployees
      .map(emp => emp._id.toString())
      .filter(empId => !team.employees.includes(empId));

    if (newEmployees.length === 0) {
      return res.status(400).json({ status: 400, message: "All employees are already in the team." });
    }

    // ✅ Add only new employees to the team
    team.employees = [...team.employees, ...newEmployees];

    // 💾 Save Team to DB
    await team.save();

    console.log(`✅ Employees Added to Team: ${team.team_name}`);
    res.status(200).json({
      status: 200,
      message: "Employees added to team successfully.",
      team,
    });

  } catch (error) {
    console.error("❌ Error Adding Employees to Team:", error.message);
    res.status(500).json({ status: 500, message: "Error adding employees to team", error: error.message });
  }
};









exports.updateTeam = async (req, res) => {
  try {
    const { role, access, status } = req.user; // Extract role, access, and status from JWT

    console.log(`🔹 Team Update Requested by: ${role} | Access: ${access} | Status: ${status}`);

    // ❌ Check if the user's account is active
    if (status !== "Active") {
      return res.status(403).json({ status: 403, message: "Your account is not active. Please contact admin." });
    }

    // ❌ Check authorization (Only HR, BDM, SuperAdmin with 'add', 'full-access', or 'update' can proceed)
    if (!["HR", "BDM", "SuperAdmin"].includes(role) || !["add", "full-access", "update"].some(a => access.includes(a))) {
      return res.status(403).json({ status: 403, message: "You are not authorized to update a team." });
    }

    // ✅ Extract team ID and update data
    const { team_id, team_name, level, type } = req.body;

    // ❌ Validate required fields
    if (!team_id) {
      return res.status(400).json({ status: 400, message: "Team ID is required." });
    }

    // ✅ Find and update the team
    const updatedTeam = await Team.findByIdAndUpdate(
      team_id,
      { $set: { team_name, level, type } },
      { new: true }
    );

    // ❌ Check if team exists
    if (!updatedTeam) {
      return res.status(404).json({ status: 404, message: "Team not found." });
    }

    console.log(`✅ Team Updated Successfully: ${updatedTeam.team_name}`);
    res.status(200).json({
      status: 200,
      message: "Team updated successfully.",
      team: updatedTeam,
    });

  } catch (error) {
    console.error("❌ Error Updating Team:", error.message);
    res.status(500).json({ status: 500, message: "Error updating team", error: error.message });
  }
};

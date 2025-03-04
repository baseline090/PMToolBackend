
const Project = require("../models/Project");
const Employee = require("../models/Employee");
const TeamLead = require("../models/TeamLead");

// ✅ Middleware to create a project
exports.createProject = async (req, res) => {
  try {
    const { title, employeeId, hoursAllowed } = req.body;

    // ✅ Extract role & access from JWT
    const { role, access, status } = req.user;

    // ✅ Split access into an array (Fixes issue)
    const accessList = access.split(",");

    // ✅ Check if the user has access
    if (!["HR", "HM", "BDM"].includes(role) || (!accessList.includes("full-access") && !accessList.includes("add")) || status !== "Active") {
      return res.status(403).json({ message: "You do not have permission to assign projects" });
    }

    // ✅ Check if a project with the same title already exists
    const existingProject = await Project.findOne({ title });
    if (existingProject) {
      return res.status(400).json({ message: "A project with this title already exists" });
    }

    // ✅ Check if the employee exists in Employee or TeamLead collection
    let employee = await Employee.findById(employeeId);
    let teamLead = await TeamLead.findById(employeeId);

    if (!employee && !teamLead) {
      return res.status(404).json({ message: "Employee was not found" });
    }

    // ✅ Assign employee details dynamically
    const assignedEmployee = employee || teamLead;
    const employeeName = assignedEmployee.name;
    const employeeRole = assignedEmployee.role;

    // ✅ Create a new project
    const newProject = new Project({
      title,
      employee: employeeId,
      employeeName,
      employeeRole,
      hoursAllowed,
    });

    await newProject.save();
    return res.status(201).json({ message: "Project assigned successfully", project: newProject });

  } catch (error) {
    console.error("Error creating project:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};



// ✅ Middleware to get all projects
exports.getAllProjects = async (req, res) => {
    try {
      // ✅ Extract role & access from JWT
      const { role, access, status } = req.user;
  
      // ✅ Convert access string into an array (Fixes issue)
      const accessList = access.split(",");
  
      // ✅ Check if the user has the required role, access, and status
      if (!["HR", "HM", "BDM"].includes(role) || (!accessList.includes("full-access") && !accessList.includes("add")) || status !== "Active") {
        return res.status(403).json({ message: "You do not have permission to view projects" });
      }
  
      // ✅ Fetch all projects
      const projects = await Project.find();
  
      return res.status(200).json({ message: "Projects retrieved successfully", projects });
  
    } catch (error) {
      console.error("Error fetching projects:", error);
      return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  };
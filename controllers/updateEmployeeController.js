const Employee = require("../models/Employee");

// ✅ Update Employee Profile API (with Access Control)
exports.updateEmployee = async (req, res) => {
  try {
    const { candidateId, name, username, dob, mobile, email, residenceAddress } = req.body; // Get update data & candidate ID
    const { role, access, status } = req.user; // Extract role, access, and status from JWT

    console.log(
      `🔹 Updating Employee Profile - Role: ${role}, Access: ${access}, Status: ${status}`
    );

    // ❌ Check if the user's status is "Active"
    if (status !== "Active") {
      return res.status(403).json({ message: "Your account is not active" });
    }

    // ✅ Convert access string to an array & check for required access
    const accessArray = access.split(",");

    if (
      !["HR", "SuperAdmin", "BDM"].includes(role) ||
      (!accessArray.includes("update") && !accessArray.includes("full-access"))
    ) {
      return res.status(403).json({
        message: "Access denied: You do not have permission to update profiles",
      });
    }

    // ✅ Fetch only Employee candidates (not sub-admins)
    const employee = await Employee.findById(candidateId);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // 2️⃣ **Update the profile fields if provided**
    if (name) employee.name = name;
    if (username) employee.username = username;
    if (dob) employee.dob = dob;
    if (mobile) employee.mobile = mobile;
    if (email) employee.email = email;
    if (residenceAddress) employee.residenceAddress = residenceAddress;

    await employee.save();

    console.log("✅ Employee Profile Updated Successfully:", employee);
    res.status(200).json({ message: "Employee profile updated successfully", data: employee });

  } catch (error) {
    console.error("❌ Error Updating Employee Profile:", error.message);
    res.status(500).json({ message: "Error updating profile", error: error.message });
  }
};

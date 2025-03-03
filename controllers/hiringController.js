const Interview = require("../models/Interview");
const mongoose = require("mongoose");

// ✅ Create Interview (Only HR, HM, BDM Can Access)
exports.createInterview = async (req, res) => {
    try {
        const { role, access, status, id } = req.user; // ✅ Extract from JWT
        const { rolePosition, candidateName, experience, email } = req.body;

        console.log("🔹 Creating Interview:", req.body, "By:", role, "Access:", access, "Status:", status);

        const accessArray = access.split(","); // ✅ Convert to an array

        if (status !== "Active" || !accessArray.some((acc) => ["view", "full-access", "add"].includes(acc))) {
            return res.status(403).json({ message: "Access denied: You do not have permission to create an interview" });
        }

        // ❌ Check if user has the correct role
        if (!["HR", "HM", "BDM"].includes(role)) {
            return res.status(403).json({ message: "Access denied: Only HR, HM, or BDM can create interviews" });
        }

        // ❌ Validate required fields
        if (!rolePosition || !candidateName || !experience || !email) {
            return res.status(400).json({ message: "All fields are required: rolePosition, candidateName, experience, email" });
        }

        // ❌ Check if email already exists in Interviews collection
        const existingInterview = await Interview.findOne({ email });
        if (existingInterview) {
            return res.status(400).json({ message: "Email is already registered" });
        }

        // ✅ Create and save interview
        const newInterview = new Interview({
            createdBy: role, // ✅ Set from JWT dynamically
            rolePosition,
            candidateName,
            experience,
            email, // ✅ Save email
        });

        await newInterview.save();

        console.log(`✅ Interview Created Successfully by ${role}:`, newInterview);
        res.status(201).json({ message: "Interview created successfully", data: newInterview });

    } catch (error) {
        console.error("❌ Error Creating Interview:", error.message);
        res.status(500).json({ message: "Error creating interview", error: error.message });
    }
};




// ✅ Get All Interviews (Only HR, HM, BDM Can Access)
exports.getAllInterviews = async (req, res) => {
    try {
        const { role, access, status } = req.user; // ✅ Extract from JWT

        console.log("🔹 Fetching Interviews By:", role, "Access:", access, "Status:", status);

        // ✅ Convert access into an array
        const accessArray = access.split(",");

        // ❌ Check if user has valid status & access
        if (status !== "Active" || !accessArray.some((acc) => ["view", "full-access", "add"].includes(acc))) {
            return res.status(403).json({ message: "Access denied: You do not have permission to view interviews" });
        }

        // ❌ Check if user has the correct role
        if (!["HR", "HM", "BDM"].includes(role)) {
            return res.status(403).json({ message: "Access denied: Only HR, HM, or BDM can view interviews" });
        }

        // ✅ Fetch all interviews
        const interviews = await Interview.find();

        console.log(`✅ ${role} Retrieved All Interviews`);
        res.status(200).json({ message: "Interviews fetched successfully", data: interviews });

    } catch (error) {
        console.error("❌ Error Fetching Interviews:", error.message);
        res.status(500).json({ message: "Error fetching interviews", error: error.message });
    }
};



// ✅ Get Single Interview By ID (Only HR, HM, BDM Can Access)
exports.getSingleInterview = async (req, res) => {
    try {
        const { role, access, status } = req.user; // ✅ Extract from JWT
        const { interviewId } = req.params; // ✅ Get interview ID from URL params

        console.log("🔹 Fetching Interview By:", role, "Access:", access, "Status:", status, "Interview ID:", interviewId);

        // ✅ Convert access into an array
        const accessArray = access.split(",");

        // ❌ Check if user has valid status & access
        if (status !== "Active" || !accessArray.some((acc) => ["view", "full-access", "add"].includes(acc))) {
            return res.status(403).json({ message: "Access denied: You do not have permission to view interviews" });
        }

        // ❌ Check if user has the correct role
        if (!["HR", "HM", "BDM"].includes(role)) {
            return res.status(403).json({ message: "Access denied: Only HR, HM, or BDM can view interviews" });
        }

        // ✅ Fetch the interview by ID
        const interview = await Interview.findById(interviewId);

        // ❌ Check if interview exists
        if (!interview) {
            return res.status(404).json({ message: "Interview not found" });
        }

        console.log(`✅ ${role} Retrieved Interview ID: ${interviewId}`);
        res.status(200).json({ message: "Interview fetched successfully", data: interview });

    } catch (error) {
        console.error("❌ Error Fetching Interview:", error.message);
        res.status(500).json({ message: "Error fetching interview", error: error.message });
    }
};













// // ✅ Update Interview (Only HR, HM, BDM Can Access)
// exports.updateInterview = async (req, res) => {
//     try {
//         const { role, access, status } = req.user;
//         let { candidateId, ...updateFields } = req.body;

//         console.log("🔹 Updating Interview - Role:", role, "Access:", access, "Candidate ID:", candidateId);

//         // ✅ Convert access into an array
//         const accessArray = access.split(",");

//         // ❌ Validate access permissions
//         if (status !== "Active" || !accessArray.some((acc) => ["update", "full-access", "add"].includes(acc))) {
//             return res.status(403).json({ message: "Access denied: You do not have permission to update interviews" });
//         }

//         // ❌ Validate user role
//         if (!["HR", "HM", "BDM"].includes(role)) {
//             return res.status(403).json({ message: "Access denied: Only HR, HM, or BDM can update interviews" });
//         }

//         // ❌ Validate required fields
//         if (!candidateId || Object.keys(updateFields).length === 0) {
//             return res.status(400).json({ message: "Interview ID and at least one update field are required" });
//         }

//         // ✅ Ensure `candidateId` is an ObjectId
//         if (!mongoose.Types.ObjectId.isValid(candidateId)) {
//             return res.status(400).json({ message: "Invalid Interview ID format" });
//         }

//         // ✅ Find and update the interview using `_id`
//         const updatedInterview = await Interview.findByIdAndUpdate(
//             candidateId, // ✅ Use `_id` instead of `candidateId`
//             { $set: updateFields },
//             { new: true } // ✅ Return updated document
//         );

//         if (!updatedInterview) {
//             return res.status(404).json({ message: "Interview not found for this ID" });
//         }

//         console.log(`✅ Interview Updated Successfully for ID: ${candidateId}`);
//         res.status(200).json({ message: "Interview updated successfully", data: updatedInterview });

//     } catch (error) {
//         console.error("❌ Error Updating Interview:", error.message);
//         res.status(500).json({ message: "Error updating interview", error: error.message });
//     }
// };




exports.updateInterview = async (req, res) => {
    try {
        const { role, access, status } = req.user; // ✅ Extract from JWT
        let { candidateId, ...updateFields } = req.body; // ✅ Extract candidateId & update fields

        console.log("🔹 Updating Interview By:", role, "Access:", access, "Status:", status, "Candidate ID:", candidateId);

        // ✅ Convert access into an array
        const accessArray = access.split(",");

        // ❌ Check if user has valid status & access
        if (status !== "Active" || !accessArray.some((acc) => ["update", "full-access", "add"].includes(acc))) {
            return res.status(403).json({ message: "Access denied: You do not have permission to update interviews" });
        }

        // ❌ Check if user has the correct role
        if (!["HR", "HM", "BDM"].includes(role)) {
            return res.status(403).json({ message: "Access denied: Only HR, HM, or BDM can update interviews" });
        }

        // ❌ Validate required fields
        if (!candidateId || Object.keys(updateFields).length === 0) {
            return res.status(400).json({ message: "Candidate ID and at least one update field are required" });
        }

        // ✅ Ensure candidateId is an ObjectId
        if (!mongoose.Types.ObjectId.isValid(candidateId)) {
            return res.status(400).json({ message: "Invalid candidate ID format" });
        }

        candidateId = new mongoose.Types.ObjectId(candidateId);

        // ✅ Find the interview by candidateId (Ensure correct type)
        const interview = await Interview.findOne({ _id: candidateId });

        if (!interview) {
            return res.status(404).json({ message: "Interview not found for this candidate" });
        }

        // ✅ Check if specific fields are being updated
        const updateKeys = Object.keys(updateFields);
        const triggerFields = ["interviewStatus", "hiringStatus", "result"];

        if (updateKeys.some((key) => triggerFields.includes(key))) {
            updateFields.lastUpdate = new Date(); // ✅ Update lastUpdate field
        }

        // ✅ Update only provided fields
        Object.assign(interview, updateFields);

        // ✅ Save the updated interview
        await interview.save();

        console.log(`✅ ${role} Updated Interview for Candidate ID: ${candidateId}`);
        res.status(200).json({ message: "Interview updated successfully", data: interview });

    } catch (error) {
        console.error("❌ Error Updating Interview:", error.message);
        res.status(500).json({ message: "Error updating interview", error: error.message });
    }
};






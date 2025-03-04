const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// Import models correctly
const SuperAdmin = require("../models/SuperAdmin");
const HR = require("../models/HR");
const BDM = require("../models/BDM");
const HM = require("../models/HM");
const PM = require("../models/PM");
const Employee = require("../models/Employee");
const TeamLead = require("../models/TeamLead");

const otpStore = new Map(); // In-memory OTP storage

// Map roles to models for dynamic lookups
const roleModelMap = { HR, BDM, HM, PM, Employee, TeamLead };

// 📨 Configure Email Transporter (Replace with your SMTP credentials)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 🔹 Send OTP
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    let user = null;

    // 🔍 Check in SuperAdmin collection
    const superAdminUser = await SuperAdmin.findOne({ email });
    if (superAdminUser) {
      user = superAdminUser;
    }

    // 🔍 If not found in SuperAdmin, check in role-based collections
    if (!user) {
      for (const Model of Object.values(roleModelMap)) {
        const roleUser = await Model.findOne({ email });
        if (roleUser) {
          user = roleUser;
          break;
        }
      }
    }

    if (!user) {
      return res.status(404).json({ message: "User not found. Please register first." });
    }

    // Generate a 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // Store OTP in memory with expiration (5 minutes)
    otpStore.set(email, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

    // Send OTP via email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is: ${otp}. It is valid for 5 minutes.`,
    };

  //   await transporter.sendMail(mailOptions);

  //   res.json({ status: "success", message: "OTP sent to your email." });
  // } catch (error) {
  //   console.error(error);
  //   res.status(500).json({ message: "Server error" });
  // }

  res.status(200).json({ status: 200, message: "OTP sent to your email." });
} catch (error) {
  console.error(error);
  res.status(500).json({ status: 500, message: "Server error" });
}
};

// ✅ Verify OTP
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    let user = null;

    // 🔍 Check in SuperAdmin collection
    const superAdminUser = await SuperAdmin.findOne({ email });
    if (superAdminUser) {
      user = superAdminUser;
    }

    // 🔍 If not found in SuperAdmin, check in role-based collections
    if (!user) {
      for (const Model of Object.values(roleModelMap)) {
        const roleUser = await Model.findOne({ email });
        if (roleUser) {
          user = roleUser;
          break;
        }
      }
    }

    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found." });
    }

    const storedOtpData = otpStore.get(email);

    if (!storedOtpData || storedOtpData.otp !== otp) {
      return res.status(400).json({ status: "error", message: "Invalid OTP." });
    }

    // Check if OTP is expired
    if (Date.now() > storedOtpData.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ status: "error", message: "OTP has expired." });
    }

    // OTP is valid; generate JWT reset token
    const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "10m" });

    // Remove OTP after successful verification
    otpStore.delete(email);

  //   res.json({ status: "verified", message: "OTP verified successfully.", resetToken });
  // } catch (error) {
  //   console.error(error);
  //   res.status(500).json({ message: "Server error" });
  // }
  res.status(200).json({ status: 200, message: "OTP verified successfully.", resetToken });
} catch (error) {
  console.error(error);
  res.status(500).json({ status: 500, message: "Server error" });
}
};


// 🔄 Reset Password
exports.resetPassword = async (req, res) => {
  const { newPassword, confirmPassword } = req.body;
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: Reset token missing." });
  }

  const resetToken = authHeader.split(" ")[1];

  try {
    // Verify JWT token
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    const email = decoded.email;

    let user = null;

    // 🔍 Check in SuperAdmin collection
    const superAdminUser = await SuperAdmin.findOne({ email });
    if (superAdminUser) {
      user = superAdminUser;
    }

    // 🔍 If not found in SuperAdmin, check in role-based collections
    if (!user) {
      for (const Model of Object.values(roleModelMap)) {
        const roleUser = await Model.findOne({ email });
        if (roleUser) {
          user = roleUser;
          break;
        }
      }
    }

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // 🔹 **Check if password meets length requirement**
    if (newPassword.length < 6) {
        return res.status(400).json({ message: "Please set password with at least 6 characters." });
      }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }
    // 🔹 **Set the new password directly (pre-save hook will handle hashing)**
    user.password = newPassword; // ❌ Do NOT hash manually here

    await user.save(); // 🔹 This will trigger the `pre("save")` hook and hash it automatically

    // Invalidate reset token by changing JWT secret (optional)
    process.env.JWT_SECRET = crypto.randomBytes(64).toString("hex");

//     res.json({ message: "Password updated successfully. Reset token is now invalid." });
//     } catch (error) {
//     console.error(error);
//     if (error.name === "TokenExpiredError") {
//     return res.status(400).json({ message: "Reset token has expired." });
//     }
//     res.status(400).json({ message: "Invalid reset token." });
//     }
// };


res.status(200).json({ status: 200, message: "Password updated successfully. Reset token is now invalid." });
    } catch (error) {
    console.error(error);
    if (error.name === "TokenExpiredError") {
    return res.status(400).json({ status: 400, message: "Reset token has expired." });
    }
    res.status(400).json({ status: 400, message: "Invalid reset token." });
    }
};





const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const hrController = require('../controllers/HRController');
const bdmController = require('../controllers/BDMController');
const superAdminController = require('../controllers/superAdminController');
const hmController = require('../controllers/HMController')
const pmController = require('../controllers/PMController')
const teamleadController = require('../controllers/TeamLeadController')
const employeeController = require('../controllers/EmployeeController')
const otpController = require("../controllers/otpController");
const addCandidateController = require("../controllers/addCandidateController");
const deleteCandidateController = require("../controllers/deleteCandidateController");
const accountDetailController = require("../controllers/accountDetailController");
const accountUpdateController = require("../controllers/accountUpdateController");
const subAdminController = require("../controllers/getSubAdminListController");
const updateProfileController = require("../controllers/updateSubAdminController");
const subadminAdminDeactivateController = require("../controllers/subadminAdminDeactivateController");




// ✅ Allowed roles for adding candidates based on hierarchy
const allowedRolesadd = ["HR", "BDM", "Employee", "TeamLead", "HM", "PM"];
const allowedRolesdelete = ["HR", "BDM", "Employee", "TeamLead", "HM", "PM"];



//////------------- Common Routes --------------------------------------////////

// ✅ Unified Admin Login (Super Admin, Sub Admin, Admin)
router.post('/admins/login', [
  body('email').isEmail(),
  body('password').notEmpty(),
], superAdminController.adminLogin);  // 🔥 Make sure this function is correctly imported


// Route for sending OTP
router.post("/forgotpassword", otpController.forgotPassword);

// Route for verifying OTP (returns JWT resetToken)
router.post("/verifyotp", otpController.verifyOtp);

// Route for resetting password (requires JWT in Authorization header)
router.post("/resetpassword", otpController.resetPassword);


// ✅ Get Account Details (Protected Route)
router.get("/account-details", auth.authenticateJWT, accountDetailController.getAccountDetails);

module.exports = router;


// ✅ Add Candidate (Protected Route)
router.post(
  "/add/candidate",
  auth.authenticateJWT,
  [
      body("name").notEmpty(),
      body("username").notEmpty(),
      body("email").isEmail(),
      body("role").isIn(allowedRolesadd), // ✅ Only allow roles based on the defined hierarchy
  ],
  addCandidateController.addCandidate
);



// ✅ Delete Candidate (Protected Route)
router.delete("/delete/candidate", auth.authenticateJWT, [
    body("candidateId").notEmpty(),
    body("role").isIn(allowedRolesdelete), // ✅ Exact Role Names
], deleteCandidateController.deleteCandidate);




// // ✅ View Sub-Admin Candidates (Protected Route)
// router.get(
//   "/subadmin/all-list",
//   auth.authenticateJWT, 
//   auth.authorizeRole(["HR", "BDM", "TeamLead", "PM", "HM", "SuperAdmin"]),
//   subAdminController.getSubAdminList
// );



// // ✅ View Sub-Admin Candidates (Protected Route)
// router.get('/subadmin/all-list', auth.authenticateJWT, auth.authorizeRole(["HR", "BDM", "TeamLead", "PM", "HM", "SuperAdmin"]), [
//   body('candidateId').notEmpty(),
//   body('role').isIn(['HR', 'BDM', 'HM', 'PM', 'Employee', 'TeamLead']), // ✅ Allowed Roles
// ], subAdminController.getSubAdminList);

// ✅ View Sub-Admin Candidates (Protected Route)
router.get(
  "/subadmin/all-list",
  auth.authenticateJWT,
  auth.authorizeRole(["HR", "BDM", "TeamLead", "PM", "HM", "SuperAdmin"]), // ✅ Allowed Roles
  [
    body("role").isIn(["HR", "BDM", "HM", "PM", "TeamLead", "Employee"]).withMessage("Invalid role specified") // ✅ Validate Role
  ],
  subAdminController.getSubAdminList
);




// ✅ Fetch All Candidates (Protected Route)
router.get(
  "/subadmin/candidate/all-list",
  auth.authenticateJWT,
  auth.authorizeRole(["PM", "HM", "HR", "TeamLead", "SuperAdmin", "Employee"]), // ✅ Allowed roles
  subAdminController.getAllCandidates
);


// ✅ Update  Candidates (Protected Route)
router.put(
  "/subadmin/update",
  auth.authenticateJWT,
  auth.authorizeRole(["HR", "BDM", "SuperAdmin"]), 
  updateProfileController.updateProfile
);


// ✅ deactivate/activate  Candidates (Protected Route)
router.put(
  "/subadmin/active-deactivate",
  auth.authenticateJWT,
  auth.authorizeRole(["HR", "SuperAdmin", "BDM"]),
  subadminAdminDeactivateController.activate_deactivateUser
);

////----------------------------------------------------------------//////////////////




/////---------super admin routes -----------------------------------//////
// ✅ Super Admin Routes
// ✅ Register Super Admin
router.post('/register-super-admin', [
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('confirmPassword').exists(),
], superAdminController.registerSuperAdmin);


// ✅ Register Admin/Sub-Admin (Protected Route)
router.post('/register-admin-subadmin', auth.authenticateJWT, auth.authorizeRole('super-admin'), [
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('confirmPassword').exists(),
  body('role').isIn(['sub-admin', 'admin']),
], superAdminController.registerAdminSubAdmin);

router.put('/super-admin/update/profile', auth.authenticateJWT, auth.authorizeRole('super-admin'), superAdminController.updateSuperAdminProfile);

router.get('/super-admin/view/allcandidate', auth.authenticateJWT, auth.authorizeRole('super-admin'), superAdminController.viewAllCandidates);

router.delete('/super-admin/delete/candidate', auth.authenticateJWT, auth.authorizeRole('super-admin'), superAdminController.deleteCandidate);

router.put('/super-admin/update/allcandidate', auth.authenticateJWT, auth.authorizeRole('super-admin'), superAdminController.updateCandidate);

/////////////////////////////////-----------------------------------------------------------///////////////////////////////////////////////////////////



////////---------------------------------HR Routes ---------------------------------------------------////


// ✅ HR -  own update profile (Protected Route)
router.put('/hr/update/profile', auth.authenticateJWT, auth.authorizeRole('HR'), hrController.updateHRProfile);


// ✅ HR - Add Candidate (Protected Route)
router.post('/hr/add/candidate', auth.authenticateJWT, auth.authorizeRole('HR'), [
  body('name').notEmpty(),
  body('username').notEmpty(),
  body('email').isEmail(),
  body('role').isIn(['BDM', 'HM', 'PM', 'Employee', 'TeamLead']), // ✅ Allowed Roles
], hrController.addCandidate);


// ✅ HR - Delete Candidate (Protected Route)
router.delete('/hr/delete/candidate', auth.authenticateJWT, auth.authorizeRole('HR'), [
  body('candidateId').notEmpty(),
  body('role').isIn(['BDM', 'HM', 'PM', 'Employee', 'TeamLead']), // ✅ Allowed Roles
], hrController.deleteCandidate);


// ✅ HR - View Candidate (Protected Route)
router.get('/hr/view/candidate', auth.authenticateJWT, auth.authorizeRole('HR'), [
  body('candidateId').notEmpty(),
  body('role').isIn(['BDM', 'HM', 'PM', 'Employee', 'TeamLead']) // ✅ Ensure the candidate's role is one of the allowed roles
], hrController.viewCandidate);


// ✅ HR - View All Candidates API (Protected Route)
router.get('/hr/view/allcandidates', auth.authenticateJWT, auth.authorizeRole('HR'), [
  body('role').isIn(['BDM', 'HM', 'PM', 'Employee', 'TeamLead']), // ✅ Allowed Roles
], hrController.viewAllCandidates);


// ✅ HR - Update Candidate (Protected Route)
router.put('/hr/update/candidate', auth.authenticateJWT, auth.authorizeRole('HR'), [
  body('candidateId').notEmpty(),
  body('role').isIn(['BDM', 'HM', 'PM', 'Employee', 'TeamLead']), // ✅ Allowed Roles
], hrController.updateCandidate);



// ✅ HR - Assign Project to Candidate (Protected Route)
router.post('/hr/add/assign-project/candidate', 
  auth.authenticateJWT, 
  auth.authorizeRole('HR'), 
  [
    body('candidateId').notEmpty(),  // Candidate ID (Employee or TeamLead)
    body('project').notEmpty(),       // Project name
    body('role').isIn(['Employee', 'TeamLead']) // ✅ Allowed Roles
  ], 
  hrController.assignProjectToCandidate
);

// ✅ HR - Remove Assigned Project (Protected Route)
router.delete('/hr/remove/assign-project/candidate', 
  auth.authenticateJWT, 
  auth.authorizeRole('HR'), 
  [
    body('candidateId').notEmpty(),  // Candidate ID must be provided
    body('project').notEmpty(),      // Project name must be provided
    body('role').isIn(['Employee', 'TeamLead']) // ✅ Allowed Roles
  ], 
  hrController.removeAssignedProject
);


// ✅ Update Account Details (Protected Route)
router.put("/account-update", auth.authenticateJWT, accountUpdateController.updateAccountDetails);


/////////////------------------------------------------------------------------------------------///////////////////////////////////////////////





////////------------------BDM Routes -------------------------------------------------////


// ✅ BDM -  own update profile (Protected Route)
router.put('/bdm/update/profile', auth.authenticateJWT, auth.authorizeRole('BDM'), bdmController.updateBDMProfile);


// ✅ BDM - Add Candidate (Protected Route)
router.post('/bdm/add/candidate', auth.authenticateJWT, auth.authorizeRole('BDM'), [
  body('name').notEmpty(),
  body('username').notEmpty(),
  body('email').isEmail(),
  body('role').isIn(['HM', 'PM', 'Employee', 'TeamLead']), // ✅ Allowed Roles
], bdmController.addCandidate);


// ✅ BDM - Delete Candidate (Protected Route)
router.delete('/bdm/delete/candidate', auth.authenticateJWT, auth.authorizeRole('BDM'), [
  body('candidateId').notEmpty(),
  body('role').isIn(['HM', 'PM', 'Employee', 'TeamLead']), // ✅ Allowed Roles
], bdmController.deleteCandidate);


// ✅ BDM - View Candidate (Protected Route)
router.get('/bdm/view/candidate', auth.authenticateJWT, auth.authorizeRole('BDM'), [
  body('candidateId').notEmpty(),
  body('role').isIn(['HM', 'PM', 'Employee', 'TeamLead']) // ✅ Ensure the candidate's role is one of the allowed roles
], bdmController.viewCandidate);


// ✅ BDM - View All Candidates API (Protected Route)
router.get('/bdm/view/allcandidates', auth.authenticateJWT, auth.authorizeRole('BDM'), [
  body('role').isIn(['HM', 'PM', 'Employee', 'TeamLead']), // ✅ Allowed Roles
], bdmController.viewAllCandidates);


// ✅ BDM - Update Candidate (Protected Route)
router.put('/bdm/update/candidate', auth.authenticateJWT, auth.authorizeRole('BDM'), [
  body('candidateId').notEmpty(),
  body('role').isIn(['HM', 'PM', 'Employee', 'TeamLead']), // ✅ Allowed Roles
], bdmController.updateCandidate);



// ✅ BDM - Assign Project to Candidate (Protected Route)
router.post('/bdm/add/assign-project/candidate', 
  auth.authenticateJWT, 
  auth.authorizeRole('BDM'), 
  [
    body('candidateId').notEmpty(),  // Candidate ID (Employee or TeamLead)
    body('project').notEmpty(),       // Project name
    body('role').isIn(['Employee', 'TeamLead']) // ✅ Allowed Roles
  ], 
  bdmController.assignProjectToCandidate
);

// ✅ BDM - Remove Assigned Project (Protected Route)
router.delete('/bdm/remove/assign-project/candidate', 
  auth.authenticateJWT, 
  auth.authorizeRole('BDM'), 
  [
    body('candidateId').notEmpty(),  // Candidate ID must be provided
    body('project').notEmpty(),      // Project name must be provided
    body('role').isIn(['Employee', 'TeamLead']) // ✅ Allowed Roles
  ], 
  bdmController.removeAssignedProject
);




/////////////---------------------------------------------------------------------------------///////////////////////////////////////////////



////////------------------HM Routes -------------------------------------------------////


// ✅ HM -  own update profile (Protected Route)
router.put('/hm/update/profile', auth.authenticateJWT, auth.authorizeRole('HM'), hmController.updateHMProfile);


// ✅ HM - View Candidate (Protected Route)
router.get('/hm/view/candidate', auth.authenticateJWT, auth.authorizeRole('HM'), [
  body('candidateId').notEmpty(),
  body('role').isIn(['Employee', 'TeamLead']), // ✅ Ensure the candidate's role is one of the allowed roles
], hmController.viewCandidate);


// ✅ HM - View All Candidates API (Protected Route)
router.get('/hm/view/allcandidates', auth.authenticateJWT, auth.authorizeRole('HM'), [
  body('role').isIn([ 'Employee', 'TeamLead']), // ✅ Allowed Roles
], hmController.viewAllCandidates);



/////////////---------------------------------------------------------------------------------///////////////////////////////////////////////


////////------------------PM Routes -------------------------------------------------////


// ✅ PM -  own update profile (Protected Route)
router.put('/pm/update/profile', auth.authenticateJWT, auth.authorizeRole('PM'), pmController.updatePMProfile);


// ✅ PM - View Candidate (Protected Route)
router.get('/pm/view/candidate', auth.authenticateJWT, auth.authorizeRole('PM'), [
  body('candidateId').notEmpty(),
  body('role').isIn(['PM', 'Employee', 'TeamLead']) // ✅ Ensure the candidate's role is one of the allowed roles
], pmController.viewCandidate);


// ✅ PM - View All Candidates API (Protected Route)
router.get('/pm/view/allcandidates', auth.authenticateJWT, auth.authorizeRole('PM'), [
  body('role').isIn(['PM', 'Employee', 'TeamLead']), // ✅ Allowed Roles
], pmController.viewAllCandidates);


/////////////---------------------------------------------------------------------------------///////////////////////////////////////////////


////////------------------TeamLead Routes -------------------------------------------------////

// ✅ TeamLead -  own update profile (Protected Route)
router.put('/teamlead/update/profile', auth.authenticateJWT, auth.authorizeRole('TeamLead'), teamleadController.updateTeamLeadProfile);

// ✅ TeamLead - View Candidate (Protected Route)
router.get('/teamlead/view/candidate', auth.authenticateJWT, auth.authorizeRole('TeamLead'), [
  body('candidateId').notEmpty(),
  body('role').isIn(['TeamLead', 'Employee']) // ✅ Ensure the candidate's role is one of the allowed roles
], teamleadController.viewCandidate);


// ✅ TeamLead - View All Candidates API (Protected Route)
router.get('/teamlead/view/allcandidates', auth.authenticateJWT, auth.authorizeRole('TeamLead'), [
  body('role').isIn(['TeamLead', 'Employee']), // ✅ Allowed Roles
], teamleadController.viewAllCandidates);


/////////////---------------------------------------------------------------------------------///////////////////////////////////////////////



////////------------------Employee Routes -------------------------------------------------////

// ✅ Employee -  own update profile (Protected Route)
router.put('/employee/update/profile', auth.authenticateJWT, auth.authorizeRole('Employee'), employeeController.updateEmployeeProfile);

// ✅ Employee - View Candidate (Protected Route)
router.get('/employee/view/candidate', auth.authenticateJWT, auth.authorizeRole('Employee'), [
  body('candidateId').notEmpty(),
  body('role').isIn(['Employee']) // ✅ Ensure the candidate's role is one of the allowed roles
], employeeController.viewCandidate);


// ✅ Employee - View All Candidates API (Protected Route)
router.get('/employee/view/allcandidates', auth.authenticateJWT, auth.authorizeRole('Employee'), [
  body('role').isIn(['Employee']), // ✅ Allowed Roles
], employeeController.viewAllCandidates);



/////////////---------------------------------------------------------------------------------///////////////////////////////////////////////







module.exports = router;



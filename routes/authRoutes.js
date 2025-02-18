const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const hrController = require('../controllers/HRController');
const bdmController = require('../controllers/BDMController');
const superAdminController = require('../controllers/superAdminController');


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

// ✅ Unified Admin Login (Super Admin, Sub Admin, Admin)
router.post('/admins/login', [
  body('email').isEmail(),
  body('password').notEmpty(),
], superAdminController.adminLogin);  // 🔥 Make sure this function is correctly imported

router.put('/super-admin/update/profile', auth.authenticateJWT, auth.authorizeRole('super-admin'), superAdminController.updateSuperAdminProfile);

router.get('/super-admin/view/allcandidate', auth.authenticateJWT, auth.authorizeRole('super-admin'), superAdminController.viewAllCandidates);

router.delete('/super-admin/delete/candidate', auth.authenticateJWT, auth.authorizeRole('super-admin'), superAdminController.deleteCandidate);

router.put('/super-admin/update/allcandidate', auth.authenticateJWT, auth.authorizeRole('super-admin'), superAdminController.updateCandidate);

/////////////////////////////////-----------------------------------------------------------///////////////////////////////////////////////////////////



////////------------------HR Routes -------------------------------------------------////


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

/////////////---------------------------------------------------------------------------------///////////////////////////////////////////////





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

/////////////---------------------------------------------------------------------------------///////////////////////////////////////////////










module.exports = router;



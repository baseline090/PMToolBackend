const express = require('express');
const { body } = require('express-validator');
// const adminController = require('../controllers/adminController');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const hrController = require('../controllers/HRController');
const superAdminController = require('../controllers/superAdminController');




// ✅ Register Super Admin
router.post('/register-super-admin', [
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('confirmPassword').exists(),
], superAdminController.registerSuperAdmin);

// // ✅ Login Super Admin
// router.post('/login/super-admin', [
//   body('email').isEmail(),
//   body('password').notEmpty(),
// ], superAdminController.loginSuperAdmin);

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






////////------------------HR Routes -------------------------------------------------////


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







module.exports = router;



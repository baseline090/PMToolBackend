// const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');

// const adminSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   username: { type: String, required: true, unique: true },
//   password: { type: String, required: true, minlength: 6 },
//   dob: { type: Date, required: true },
//   mobile: { type: String, required: true, unique: true },
//   email: { type: String, required: true, unique: true },
//   residenceAddress: { type: String, required: true },
//   role: { type: String, enum: ['sub-admin', 'admin'], required: true },
//   permissions: { type: [String], default: [] }
// }, { timestamps: true });

// // Hash password before saving
// adminSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) return next();
//   this.password = await bcrypt.hash(this.password, 10);
//   next();
// });

// module.exports = mongoose.model('Admin', adminSchema, 'admins');



const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  dob: { type: Date, required: true },
  mobile: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  residenceAddress: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['HR', 'BDM', 'PM', 'Employee', 'TeamLead'],  // 🔹 Updated Role Enum
    required: true 
  },
  permissions: { type: [String], default: [] }
}, { timestamps: true });

// Hash password before saving
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('Admin', adminSchema, 'admins');

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const superAdminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  dob: { type: Date, required: true },
  mobile: { type: String, required: true, unique: true }, // ✅ Added `unique: true`
  email: { type: String, required: true, unique: true },
  residenceAddress: { type: String, required: true },
  access: { type: String, default: "full-access" }, // ✅ Added new column
  role: { type: String, default: 'super-admin' } 
  
}, { timestamps: true });

// Hash password before saving
superAdminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('SuperAdmin', superAdminSchema, 'admins');

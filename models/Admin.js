const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

// Hash the password before saving the admin
adminSchema.pre('save', function(next) {
  const admin = this;
  if (!admin.isModified('password')) return next();
  bcrypt.hash(admin.password, 10, (err, hash) => {
    if (err) return next(err);
    admin.password = hash;
    next();
  });
});

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;

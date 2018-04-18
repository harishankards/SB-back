const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const companySchema = new Schema({
  _id: Number,
  email: { type: String, unique: true },
  password: String,
  passwordResetToken: String,
  passwordResetExpires: Date,

  username: {type: String, unique: true},
  facebook: String,
  twitter: String,
  google: String,
  linkedin: String,
  steam: String,
  tokens: Array,

  profile: {
    name: String,
    location: String,
    website: String,
    logo: String
  }  

}, { timestamps: true });

/**
 * Password hash middleware.
 */
companySchema.pre('save', function save(next) {
  const company = this;
  if (!company.isModified('password')) { return next(); }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) { return next(err); }
    bcrypt.hash(company.password, salt, null, (err, hash) => {
      if (err) { return next(err); }
      company.password = hash;
      next();
    });
  });
});

/**
 * Helper method for validating company's password.
 */
companySchema.methods.comparePassword = function comparePassword(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    cb(err, isMatch);
  });
};

/**
 * Helper method for getting company's gravatar.
 */
companySchema.methods.gravatar = function gravatar(size) {
  if (!size) {
    size = 200;
  }
  if (!this.email) {
    return `https://gravatar.com/avatar/?s=${size}&d=retro`;
  }
  const md5 = crypto.createHash('md5').update(this.email).digest('hex');
  return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
};

const Company = mongoose.model('Company', companySchema);

module.exports = Company;
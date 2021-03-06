const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const studentSchema = new Schema({
  email: { type: String, unique: true },
  password: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  username: String,
  tags: Array,
  verified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String,
    default: null
  },
  facebook: String,
  twitter: String,
  google: String,
  github: String,
  linkedin: String,
  steam: String,
  tokens: Array,

  favorites: {
    projects: [{ type: Schema.Types.ObjectId, ref: 'projects' }],
    contests: [{ type: Schema.Types.ObjectId, ref: 'contests' }],
    companyProjects: [{ type: Schema.Types.ObjectId, ref: 'companyProjects' }]
  },

  profile: {
    name: String,
    fname: String,
    lname: String,
    dob: Date,
    uname: String,
    gender: String,
    city: String,
    country: String,
    website: String,
    picture: String
  },

  academic: {
    collegeName: String,
    degree: String,
    branch: String,
    yearofstudy: String
  },
  notifications: Array,
  awards: [{ type: Schema.Types.ObjectId, ref: 'awards' }],  
  projects: [{ type: Schema.Types.ObjectId, ref: 'projects' }],
  appliedCompanyProjects: [{ type: Schema.Types.ObjectId, ref: 'companyProjects' }],
  contests: [{ type: Schema.Types.ObjectId, ref: 'contests' }],
  tags: [{ type: Schema.Types.ObjectId, ref: 'tags' }]  

}, { timestamps: true });

/**
 * Password hash middleware.
//  */
studentSchema.pre('save', function save(next) {
  const student = this;
  if (!student.isModified('password')) { return next(); }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) { return next(err); }
    bcrypt.hash(student.password, salt, null, (err, hash) => {
      if (err) { return next(err); }
      student.password = hash;
      next();
    });
  });
});

/**
 * Helper method for validating student's password.
 */
studentSchema.methods.comparePassword = function comparePassword(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    cb(err, isMatch);
  });
};

/**
 * Helper method for getting student's gravatar.
 */
studentSchema.methods.gravatar = function gravatar(size) {
  if (!size) {
    size = 200;
  }
  if (!this.email) {
    return `https://gravatar.com/avatar/?s=${size}&d=retro`;
  }
  const md5 = crypto.createHash('md5').update(this.email).digest('hex');
  return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
};

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;

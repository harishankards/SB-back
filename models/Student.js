const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const studentSchema = new Schema({
  _id: Number,
  email: { type: String, unique: true },
  password: String,
  passwordResetToken: String,
  passwordResetExpires: Date,

  username: {type: String, unique: true},
  facebook: String,
  twitter: String,
  google: String,
  github: String,
  linkedin: String,
  steam: String,
  tokens: Array,

  profile: {
    name: String,
    gender: String,
    location: String,
    website: String,
    picture: String
  },
  projects: [{ type: Schema.Types.ObjectId, ref: 'Project' }]

}, { timestamps: true });

/**
 * Password hash middleware.
 */
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
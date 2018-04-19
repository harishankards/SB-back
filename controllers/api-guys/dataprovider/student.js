const express = require('express');
const mongoose = require('mongoose');
const { promisify } = require('util');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const passport = require('passport');
const Student = require('../../../models/Student');

const randomBytesAsync = promisify(crypto.randomBytes);


exports.giveStudents = (req, res) => {
    console.log('got the call from frontend')
    Student.find({}, (err, students) => {
        if(err) {console.log(err);}
        res.send(students);
    })
}


/**
 * POST /signup
 * Create a new local account.
 */

exports.postSignup = (req, res, next) => {
    console.log('received the signup request', req.body) 
}
// exports.postSignup = (req, res, next) => {
//     console.log('received the signup request', req)
//     // req.assert('email', 'Email is not valid').isEmail();
//     // req.assert('password', 'Password must be at least 4 characters long').len(4);
//     // req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);
//     req.sanitize('email').normalizeEmail({ gmail_remove_dots: false });
  
//     const errors = req.validationErrors();
  
//     if (errors) {
//     //   req.flash('errors', errors);
//       return res.send(errors);
//     }
  
//     const student = new Student({
//       email: req.body.email,
//       password: req.body.password
//     });
  
//     Student.findOne({ email: req.body.email }, (err, existingUser) => {
//       if (err) { return next(err); }
//       if (existingUser) {
//         req.flash('errors', { msg: 'Account with that email address already exists.' });
//         return res.send('Account with that email address already exists.');
//       }
//       student.save((err, saved) => {
//         if (err) { return next(err); }
//         req.logIn(user, (err) => {
//           if (err) {
//             return next(err);
//           }
//           res.send(saved);
//         });
//       });
//     });
//   };
  
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

// exports.postSignup = (req, res, next) => {
//     console.log('received the signup request', req.body) 
// }
exports.postSignup = (req, res, next) => {
    console.log('received the signup request', req.body)

    req.sanitize('email').normalizeEmail({ gmail_remove_dots: false });
  
    const errors = req.validationErrors();
  
    if (errors) {
      return res.send(errors);
    }
  
    const student = new Student({
      email: req.body.email,
      password: req.body.password
    });
  
    Student.findOne({ email: req.body.email }, (err, existingUser) => {
      if (err) { return next(err); }
      if (existingUser) {
        console.log('user already exists')
        return res.status(400).send('Account with that email address already exists.');
      }
      student.save((err, saved) => {
        if (err) { 
            console.log('err in saving student', err)
            return next(err); 
        }
        req.logIn(student, (err) => {
          if (err) {
            console.log('errin login', err)
            return next(err);
          }          
          console.log('saved',saved)
          res.status(200).send('signup success');
        });
      });
    });
  };
  
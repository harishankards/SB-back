const express = require('express');
const mongoose = require('mongoose');
const Student = require('../../../models/Student');
const { promisify } = require('util');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const passport = require('passport');
const randomBytesAsync = promisify(crypto.randomBytes);
const jwt = require('jsonwebtoken');


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
    console.log('student data', student)
    Student.findOne({ email: req.body.email }, (err, existingUser) => {
      if (err) { return next(err); }
      if (existingUser) {
        console.log('user already exists')
        return res.status(400).send('Account with that email address already exists.');
      }
      student.save((err, saved) => {
        console.log('saved1',saved)        
        if (err) { 
            console.log('err in saving student', err)
            return next(err); 
        }
        req.logIn(student, (err) => {
          if (err) {
            console.log('errin login', err)
            return next(err);
          }          
          console.log('student', student)
          console.log('saved2',saved)
          jwt.sign({student}, 'secret', (err, token) => {
            if (err) {
              console.log('err in creating token')
              res.json({
                message: 'err in creating token'
              })
            }
            console.log('inside signing jwt')
            res.json({
              token: token,
              message: 'signup_success'
            })
          });
        });
      });
    });
  };
  
exports.deleteStudent = (req, res) => {
  console.log('inside the delete studen functionality', req.body);
  jwt.verify(req.token, 'secret', {expiresIn: '10h'}, (authErr, authData) => {
    if(authErr) {
      console.log('autherr', authErr)
      res.sendStatus(403);
    } else {
      const studentId = req.body.student;
      Student.findById(studentId, (studentErr, studentDetails) =>{
        if(studentErr || studentDetails === null){
          console.log('could not find student', studentErr)
          res.status(413).send('student not found')
        }
        else {
          console.log('student is there')
          Student.findByIdAndRemove(studentId, (err, deleted) => {
            if (err) {
              console.log('could not find student', err)
              res.status(404).send(err)
            }
            else {
              console.log('deleted student', deleted)
              res.status(200).send('deleted_student')
            }
          })
        }
      })
    }
  })
}

exports.login = (req, res, next) => {
  console.log('inside the login function', req.body);
  const errors = req.validationErrors();

  if (errors) {
    console.log('found vallidation errors', errors)
    res.status(400).send(errors)
  }

  passport.authenticate('student-local', (err, student, info) => {
    if (err) { return next(err); }
    if (!student) {
      console.log('errors', info)
      res.status(403).send(info)
    }
    req.logIn(student, (err) => {
      if (err) { return next(err); }
      jwt.sign({student}, 'secret', (err, token) => {
        if (err) {
          console.log('err in creating token')
          res.json({
            message: 'err in creating token'
          })
        }
        console.log('inside signing jwt')
        console.log('user logged in', student)        
        res.json({
          id: student._id,
          token: token,
          message: 'login_success'
        })
      });
    });
  })(req, res, next); 
}

exports.updateStudent = (req, res) => {
  console.log('inside student updation',req.body)
  jwt.verify(req.token, 'secret', {expiresIn: '10h'}, (authErr, authData) => {
    if(authErr) {
      console.log('autherr', authErr)
      res.sendStatus(403);
    } else if (authData === null) {
      console.log('student not updated')
      res.sendStatus(403);
    } else {
      const studentId = req.body._id;
      
      Student.findByIdAndUpdate(studentId, req.body, (err, updated) => {
        if(err) {
          console.log('err in updating the student', err)
          res.status(401).send(err)
        }
        else {
          console.log('student updated', updated)        
          res.status(200).send('student_updated')    
        }
      }) 
    }
    })
}
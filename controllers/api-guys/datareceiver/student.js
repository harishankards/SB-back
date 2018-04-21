const express = require('express');
const mongoose = require('mongoose');
const Student = require('../../../models/Student');


exports.giveStudents = (req, res) => {
    console.log('got the call from frontend')
    Student.find({}, (err, students) => {
        if(err) {console.log(err);}
        res.send(students);
    })
}

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
          res.status(200).send('signup_success');
        });
      });
    });
  };
  
  exports.deleteStudent = (req, res) => {
    console.log('inside the delete studen functionality', req.body);
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
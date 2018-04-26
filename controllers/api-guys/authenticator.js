const express = require('express');
const mongoose = require('mongoose');
const { promisify } = require('util');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const passport = require('passport');
const Student = require('../../models/Student');
const Company = require('../../models/Company');
const jwt = require('jsonwebtoken');


const randomBytesAsync = promisify(crypto.randomBytes);


exports.authenticate = (req, res) => {
  console.log('inside the authenticate function', req.body);
  Student.findOne({email: req.body.email}, (err, student) => {
    if(err) {
      console.log('error in finding student', err);
      res.send(err);
    }

    if(!student) {
      console.log('student not found', err);      
      res.json({success: false, message: 'Authentication failed. student not found'});
    } 
    else if (student) {
      if (student.password != req.body.password) {
        res.json({ success: false, message: 'Authentication failed. Wrong password.' });
      }
      else {
        const payload = {
          email: student.email
        };
        
        let token = jwt.sign(payload, 'superSecret', {
          expiresIn: 1440
        });

        res.json({
          success: true,
          message: 'Have the token!',
          token: token
        })
      } 

    }
  })
}

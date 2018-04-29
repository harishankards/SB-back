const express = require('express');
const mongoose = require('mongoose');
const { promisify } = require('util');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const passport = require('passport');
const Student = require('../../../models/Student');
const { verifyToken } =  require('../authenticator');
const jwt = require('jsonwebtoken');

const randomBytesAsync = promisify(crypto.randomBytes);


exports.getStudent = (req, res) => {
  console.log('got the call from frontend', req.query)
  jwt.verify(req.token, 'secret', {expiresIn: '10h'}, (authErr, authData) => {
    if(authErr) {
      console.log('autherr', authErr)
      res.sendStatus(403);
    } else {
      if (req.query.id) {
        const userId = req.query.id;
        Student.find({_id: userId}, (err, student) => {
          if(err) {
              console.log(err);
              res.status(413).send(err)
          }
          console.log('found the student and returing', student)
          res.status(200).send(student);
        })
        }
        else {
          const userEmail = req.query.email;
          Student.find({email: userEmail}, (err, student) => {
            if(err) {
                console.log(err);
                res.status(413).send(err)
            }
            console.log('found the student and returing', student)
            res.status(200).send(student);
          })
        } 
    }
  })
}

exports.getAllStudents = (req, res) => {
  console.log('inside the get all students', req.body)
  jwt.verify(req.token, 'secret', {expiresIn: '10h'}, (authErr, authData) => {
    if(authErr) {
      console.log('autherr', authErr)
      res.sendStatus(403);
    } else {
      Student.find({}, (err, students) => {
        if(err) {
            console.log('err',err)
        }
        res.json({
          students,
          authData
        });
      })
    }
  });
}



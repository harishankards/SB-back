const express = require('express');
const mongoose = require('mongoose');
const {
  promisify
} = require('util');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const passport = require('passport');
const Student = require('../../models/Student');
const Company = require('../../models/Company');
const jwt = require('jsonwebtoken');
const mailer = require('../mailer');
const randomstring = require("randomstring");

exports.authenticate = (req, res) => {
  console.log('inside the authenticate function', req.body);
  const user = {
    email: req.body.email,
    password: req.body.password
  };
  jwt.sign({
    user
  }, 'secret', (err, token) => {
    res.json({
      token
    })
  });
}


exports.verifyToken = (req, res, next) => {
  const bearerHeader = req.headers['authorization'];
  if (!bearerHeader) {
    res.sendStatus(403);
  } else {
    console.log('inside the verify token', req.headers['authorization']);
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];
    req.token = bearerToken;
    try {
      jwt.verify(req.token, 'secret', function (err, data) {
        if (err) {
          console.log('callback', err);
          if (err.name === 'TokenExpiredError') {
            res.status(403).send('Token expired');
          }
          res.status(403).send('Invalid token');
        } else {
          console.log(data);
          if (data.student.verified || data.company.verified) {
            next()
          } else {
            res.status(403).send('Bad request');
          }
        }
      })
    } catch (err) {
      console.log('catch ', err);
      res.status(403).send('Token tampered');
    }
  }
}

exports.sendVerificationToken = (req, res) => {
  const bearerHeader = req.headers['authorization'];
  if (!bearerHeader) {
    console.log(req.headers)
    res.status(403).send('No authorization headers present');
  } else {
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];
    try {
      jwt.verify(bearerToken, 'secret', function (err, data) {
        if (err) {
          //console.log('callback', err);
          if (err.name === 'TokenExpiredError') {
            res.status(403).send('Token expired');
          }
          res.status(403).send('Invalid token');
        } else {
          let token = randomstring.generate();
          if (data.student) {
            console.log('Student')
            let email = data.student.email
            Student.findOne({
              email: data.student.email
            }, function (err, data) {
              if (err) {
                res.status(400).send('Email doesnot exist')
              } else if (data) {
                if (!data.verified) {
                  const link = 'http://localhost:3000/student/account/authenticate?email=' + email + '&token=' + token;
                  mailer.sendVerification(link, email, function (err, data) {
                    if (err) {
                      console.log(err)
                      res.status(400).send('Unable to send mail')
                    } else {
                      Student.updateOne({
                        email: data.email
                      }, {
                        $set: {
                          verificationToken: token,
                        }
                      }, function (err, data) {
                        res.status(200).send('Mail sent successfully')
                      })
                    }
                  })

                } else {
                  res.status(401).send('User already verified.Logout and sign in again');
                }
              } else {
                res.status(400).send('Unable to send mail')
              }
            })
          } else if (data.company) {
            console.log('Company')
            let email = data.company.email
            Company.findOne({
              email: data.company.email
            }, function (err, data) {
              if (err) {
                res.status(400).send('Email doesnot exist')
              } else if (data) {
                if (!data.verified) {
                  const link = 'http://localhost:3000/company/account/authenticate?email=' + email + '&token=' + token;
                  mailer.sendVerification(link, email, function (err, data) {
                    if (err) {
                      console.log(err)
                      res.status(400).send('Unable to send mail')
                    } else {
                      Company.updateOne({
                        email: data.email
                      }, {
                        $set: {
                          verificationToken: token,
                        }
                      }, function (err, data) {
                        res.status(200).send('Mail sent successfully')
                      })
                    }
                  })

                } else {
                  res.status(401).send('User already verified.Logout and sign in again');
                }
              } else {
                res.status(400).send('Unable to send mail')
              }
            })
          } else {
            res.status(403).send('Invalid user');
          }
        }
      })
    } catch (err) {
      console.log('catch ', err);
      res.status(403).send('Invalid user');
    }
  }
}
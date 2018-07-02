const express = require('express');
const mongoose = require('mongoose');
const Company = require('../../../models/Company');
const jwt = require('jsonwebtoken');
const Student = require('../../../models/Student');
const { promisify } = require('util');
const crypto = require('crypto');
const passport = require('passport');
const mailer = require('../../mailer')
const randomstring = require("randomstring");
 

exports.postSignup = (req, res, next) => {
    let token = randomstring.generate();
    console.log('received the signup request', req.body)

    req.sanitize('email').normalizeEmail({ gmail_remove_dots: false });
  
    const errors = req.validationErrors();
  
    if (errors) {
      return res.send(errors);
    }
    let email = req.body.email;
    const company = new Company({
      email: req.body.email,
      password: req.body.password,
      verificationToken: token
    });
  
    Company.findOne({ email: req.body.email }, (err, existingUser) => {
      if (err) { return next(err); }
      if (existingUser) {
        console.log('user already exists')
        return res.status(400).send('Account with that email address already exists.');
      }
      company.save((err, saved) => {
        if (err) { 
            console.log('err in saving company', err)
            return next(err); 
        } else {
          const link = 'http://localhost:3000/company/account/authenticate?email=' + email + '&token=' + token;
          mailer.sendVerification(link, req.body.email, function (err, data) {
            if (err) {
              console.log(err , 'Error here');
              Company.findOneAndRemove({email: email}, function(err,data){
                return next(err);
              })
            } else {
              req.logIn(company, (err) => {
                if (err) {
                  console.log('errin login', err)
                  return next(err);
                }
                console.log('company', company)
                console.log('saved2', saved)
                jwt.sign({
                  company
                }, 'secret', (err, token) => {
                  if (err) {
                    console.log('err in creating token')
                    res.json({
                      message: 'err in creating token'
                    })
                  }
                  console.log('inside signing jwt')
                  res.json({
                    token: token,
                    verified: company.verified || false,
                    message: 'signup_success'
                  })
                });
              });
            }
          })
        }
      });
    });
  };
  
  exports.deleteCompany = (req, res) => {
    console.log('inside the delete company functionality', req.body);
    jwt.verify(req.token, 'secret', {expiresIn: '10h'}, (authErr, authData) => {
      if(authErr) {
        console.log('autherr', authErr)
        res.sendStatus(403);
      } else {
        const companyId = req.body.company;
        Company.findById(companyId, (companyErr, companyDetails) =>{
          if(companyErr || companyDetails === null){
            console.log('could not find company', companyErr)
            res.status(413).send('company not found')
          }
          else {
            console.log('company is there')
            Company.findByIdAndRemove(companyId, (err, deleted) => {
              if (err) {
                console.log('could not find company', err)
                res.status(404).send(err)
              }
              else {
                console.log('deleted company', deleted)
                res.status(200).send('deleted_company')
              }
            })
          }
        })
      }
    })
  }

  exports.login = (req, res, next) => {
    console.log('inside the company login function', req.body);
    const errors = req.validationErrors();
  
    if (errors) {
      console.log('found vallidation errors', errors)
      res.status(400).send(errors)
    }
  
    passport.authenticate('company-local', (err, company, info) => {
      if (err) { return next(err); }
      if (!company) {
        console.log('errors', info);
        res.status(403).send(info);
      } else {
      req.logIn(company, (err) => {
        if (err) { return next(err); }
        jwt.sign({company}, 'secret', (err, token) => {
          if (err) {
            console.log('err in creating token')
            res.json({
              message: 'err in creating token'
            })
          }
          console.log('inside signing jwt')
          console.log('user logged in', company)        
          res.json({
            token: token,
            message: 'login_success',
            id: company._id,
            verified: company.verified || false
          })
        });
      });
    }
    })(req, res, next); 
  }

  exports.updateCompany = (req, res) => {
    console.log('inside company updation',req.body)
    jwt.verify(req.token, 'secret', {expiresIn: '10h'}, (authErr, authData) => {
      if(authErr) {
        console.log('autherr', authErr)
        res.sendStatus(403);
      } else if (authData === null) {
        console.log('company not updated')
        res.sendStatus(403);
      } else {
        const companyId = req.body._id;
        
        Company.findByIdAndUpdate(companyId, req.body, (err, updated) => {
          if(err) {
            console.log('err in updating the company', err)
            res.status(401).send(err)
          }
          else {
            console.log('company updated', updated)        
            res.status(200).send('company_updated')    
          }
        }) 
      }
      })
  }


  exports.verifyCompany = (req, res) => {
    try {
      console.log('req body', req.query)
      if (req.query.token && req.query.email) {
        Company.findOne({
          email: req.query.email
        }, function (err, data) {
          console.log('company data', data);
          if (err) {
            res.status(401).send('Email not found');
          } else {
            if (data) {
              if (data.verified) {
                res.status(400).send('User already activated');
              } else {
                if (req.query.token === data.verificationToken) {
                  Company.update({
                    email: req.query.email
                  }, {
                    $set: {
                      verificationToken: null,
                      verified: true
                    }
                  }, function (err, data) {
                    if (err) {
                      res.status(403).send('Unable to verify');
                    } else {
                      res.status(200).send('User verified successfully');
                    }
                  });
                }
                else{
                  res.status(403).send('Unable to verify');
                }
              }
            } else {
              res.status(401).send('Email not found');
            }
          }
        });
      } else {
        res.status(403).send('Invalid link');
      }
    } catch (err) {
      res.status(400).status('Bad request');
    }
  }

const express = require('express');
const mongoose = require('mongoose');
const Company = require('../../../models/Company');


exports.giveCompanies = (req, res) => {
    console.log('got the call from frontend')
    Company.find({}, (err, companies) => {
        if(err) {console.log(err);}
        res.send(companies);
    })
}

exports.postSignup = (req, res, next) => {
    console.log('received the signup request', req.body)

    req.sanitize('email').normalizeEmail({ gmail_remove_dots: false });
  
    const errors = req.validationErrors();
  
    if (errors) {
      return res.send(errors);
    }
  
    const company = new Company({
      email: req.body.email,
      password: req.body.password
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
        }
        req.logIn(company, (err) => {
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
  
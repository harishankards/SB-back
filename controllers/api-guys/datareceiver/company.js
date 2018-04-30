const express = require('express');
const mongoose = require('mongoose');
const Company = require('../../../models/Company');
const jwt = require('jsonwebtoken');


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
          jwt.sign({company}, 'secret', (err, token) => {
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
const express = require('express');
const mongoose = require('mongoose');
const Company = require('../../../models/Company');
const jwt = require('jsonwebtoken');

exports.getCompany = (req, res) => {
  console.log('got the call from frontend', req.query)
  jwt.verify(req.token, 'secret', {expiresIn: '10h'}, (authErr, authData) => {
    if(authErr) {
      console.log('autherr', authErr)
      res.sendStatus(403);
    } else {
      if(req.query.email) {
        const userEmail = req.query.email
        Company.find({email: userEmail}, (err, company) => {
          if (err) {
            console.log(err);
            res.status(413).send(err)      
          }
          else {
            console.log('found the company and returning', company)
            res.status(200).send(company);  
          }
        })
      }
      else if (req.query.id) {
        const companyId = req.query.id;
        Company.find({_id: companyId}, (err, company) => {
          if (err) {
            console.log(err);
            res.status(413).send(err)      
          }
          else {
            console.log('found the company and returning', company)
            res.status(200).send(company);  
          }
        })
      }
    }
  })
}

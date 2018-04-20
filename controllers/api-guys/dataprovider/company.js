const express = require('express');
const mongoose = require('mongoose');
const Company = require('../../../models/Company');

exports.getCompany = (req, res) => {
  console.log('got the call from frontend', req.query)
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

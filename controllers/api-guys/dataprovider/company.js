const express = require('express');
const mongoose = require('mongoose');
const Company = require('../../../models/Company');

exports.getCompany = (req, res) => {
  console.log('got the call from frontend', req.params)
  const userEmail = req.params('email')
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

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
  const user = {
    email: req.email,
    password: req.password
  };
  jwt.sign({user}, 'secret', (err, token) => {
    res.json({
      token
    })
  })
}


exports.verifyToken = (req, res, next) => {
  console.log('inside the verify token')
  const bearerHeader = req.headers['authorization'];

  if(typeof bearerHeader !== undefined) {
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];    
    req.token = bearerToken;
    next();
  } else {
    res.status(403);
  }

}
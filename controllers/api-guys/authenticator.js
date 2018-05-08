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
    email: req.body.email,
    password: req.body.password
  };
  jwt.sign({user}, 'secret', (err, token) => {
    res.json({
      token
    })
  });
}


exports.verifyToken = (req, res, next) => {
  console.log('inside the verify token', req.headers['authorization'])
  const bearerHeader = req.headers['authorization'];

  if (!bearerHeader) {
    res.sendStatus(403);
  }
  else {
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];    
    req.token = bearerToken;
    console.log('verify success')
    next();
  } 
}
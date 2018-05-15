const express = require('express');
const mongoose = require('mongoose');
const { promisify } = require('util');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const passport = require('passport');
const CompanyProject = require('../../../models/CompanyProject');
const jwt = require('jsonwebtoken');

const randomBytesAsync = promisify(crypto.randomBytes);

exports.getProject = (req, res) => {
  console.log('got the call from frontend', req.query)
  jwt.verify(req.token, 'secret', {expiresIn: '10h'}, (authErr, authData) => {
    if(authErr) {
      console.log('autherr', authErr)
      res.sendStatus(403);
    } else {
      const projectId = req.query.id;
      CompanyProject.findById(projectId, (err, project) => {
        if (err) {
          console.log('could not find the project', err)
          res.status(403).send(err)
        }
        else {
          console.log('found the project', project)
          res.status(200).send(project)
        }
      })
    }
  })
}

const express = require('express');
const mongoose = require('mongoose');
const { promisify } = require('util');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const passport = require('passport');
const Project = require('../../../models/Project');

const randomBytesAsync = promisify(crypto.randomBytes);

exports.getProject = (req, res) => {
  console.log('got the call from frontend', req.query)
  const projectId = req.query.id;
  Project.findById(projectId, (err, project) => {
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
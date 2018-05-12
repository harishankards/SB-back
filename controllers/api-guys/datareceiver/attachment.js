const express = require('express');
const mongoose = require('mongoose');
const Attachments = require('../../../models/Attachment');
const Student = require('../../../models/Student');
const Company = require('../../../models/Company');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const awsSDK = require('aws-sdk');


const serverConfig = {
  s3: {
    bucket: 'student-burger',
    region: 'us-east-1',
    accessKeyId: 'AKIAITZKXZC3HPB7M4UA',
    secretAccessKey: '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',
    defaultExpiry: 86400,
  }
}






















exports.createAttachment = (req, res) => {
  console.log('inside attachment creation project', req.file)
  if (!req.file) {
    console.log("No file received");
    return res.send({
      success: false
    });

  } else {
    console.log('file received');
    return res.json({
      success: true,
      filepath: req.file.path,
      filename: req.file.filename
    })
  }
}

exports.deleteAttachment = (req, res) => {
  console.log('inside the delete attachment function', req.body);
  const filepath = req.body.filepath[0]
  fs.unlink(filepath, (success, err) => {
    if (err) {
      console.log('err in deleting file', err)
    }
    console.log('deleted', success)
  })
}


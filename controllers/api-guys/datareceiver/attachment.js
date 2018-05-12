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

const generateSignature = (method, file, key, expires = serverConfig.s3.defaultExpiry) => {
  awsSDK.config.update({
    signatureVersion: 'v4',
    bucket: serverConfig.s3.bucket,
    region: serverConfig.s3.region,
    accessKeyId: serverConfig.s3.accessKeyId,
    secretAccessKey: serverConfig.s3.secretAccessKey
  })

  const s3 = new awsSDK.S3()

  const params = {
    Bucket: serverConfig.s3.bucket,
    Key: key,
    Expires: expires
  }

  return new Promise((resolve, reject) => {
    s3.getSignedUrl(method, params, (error, signedUrl) => {
      if (error) {
        reject(error)
      }

      let HTTPMethod = method.replace('Object', '').toUpperCase()

      resolve({
        method: HTTPMethod,
        key: key,
        url: signedUrl
      })
    })
  })
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


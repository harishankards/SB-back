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

let file = {
  name: "my_image.jpg",
  type: "image/jpeg"
}

let key = 'images/my_image.jpg'

exports.signedUrlGet = (req, res) => {
  console.log('inside signedUrlGet')
  let file = req.body.file;
  let key = req.body.key;
  generateSignature(
    'getObject',
    file,
    key,
  )
  .then((signature) => {
    console.log(signature)
    res.send(signature)
  })
}

exports.signedUrlPut = (req, res) => {
  console.log('inside signedUrlPut')
  // let file = req.body.file;
  // let key = req.body.key;
  generateSignature(
    'putObject',
    file,
    key,
  )
  .then((signature) => {
    console.log(signature)
    var url = signature.url;
    const urlNameRemoved = url.split("?").pop();
    const newParamsObj = JSON.parse('{"' + decodeURI(urlNameRemoved.replace(/&/g, "\",\"").replace(/=/g,"\":\"")) + '"}')
    console.log('newparamsobj', newParamsObj)    
    const signedObj = JSON.stringify({
      signature: {
        "Content-Type":"",
        "acl":"public-read-write",
        "success_action_status":"201",
        "policy":"Policy1526045161391",
        ...newParamsObj,
        "key":""
      },
      postEndPoint: "\/\/student-burger.s3.amazonaws.com\/images"
    })
    console.log('signedObj', signedObj)    
    
    res.send(signedObj)
  })
}


exports.createAttachment = (req, res) => {
  console.log('inside attachment creation project', req.file)
  if (!req.file) {
    console.log("No file received");
    return res.status(403).send({
      success: false
    });

  } else {
    console.log('file received');
    const file = {
      name: req.file.filename,
      type: req.file.mimetype
    };
    const key = req.file.filename;
    const filepath = req.file.path;
    generateSignature(
      'getObject',
      file,
      key,
    )
    .then((signature) => {
      console.log(signature)
      fs.unlink(filepath, (success, err) => {
        if (err) {
          console.log('err in deleting file', err)
        }
        console.log('deleted the file')
      })
      res.send(signature)
    })
  }
}

exports.deleteAttachment = (req, res) => {
  console.log('inside the delete attachment function');
  // const filepath = req.body.filepath[0]
  // fs.unlink(filepath, (success, err) => {
  //   if (err) {
  //     console.log('err in deleting file', err)
  //   }
  //   console.log('deleted')
  // })
  res.send('dummy function')
}


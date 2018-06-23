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
    region: 'us-east-2',
    accessKeyId: 'AKIAITZKXZC3HPB7M4UA',
    secretAccessKey: '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',
    defaultExpiry: 86400,
  }
}

awsSDK.config.update({
  signatureVersion: 'v4',
  bucket: serverConfig.s3.bucket,
  region: serverConfig.s3.region,
  accessKeyId: serverConfig.s3.accessKeyId,
  secretAccessKey: serverConfig.s3.secretAccessKey,
  apiVersion: '2006-03-01',
})

const s3 = new awsSDK.S3();

const generateSignature = (method, file, key, path,expires = serverConfig.s3.defaultExpiry) => {

  const params = {
    Bucket: 'student-burger/'+path,
    Key: key,
    Expires: expires,
    ACL: 'public-read-write',
  }
  console.log(params);
  return new Promise((resolve, reject) => {
    s3.getSignedUrl(method, params, (error, signedUrl) => {
      if (error) {
        reject(error)
      }

      let HTTPMethod = method.replace('Object', '').toUpperCase()

      resolve({
        method: HTTPMethod,
        key: key,
        url: signedUrl,
        path: path
      })
    })
  })
}

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
  console.log('inside signedUrlPut', req.body)
  let file = req.body.file;
  let key = req.body.key;
  generateSignature(
      'putObject',
      file,
      key,
    )
    .then((signature) => {
      console.log(signature)
      var url = signature.url;
      const urlNameRemoved = url.split("?").pop();
      const newParamsObj = JSON.parse('{"' + decodeURI(urlNameRemoved.replace(/&/g, "\",\"").replace(/=/g, "\":\"")) + '"}')
      console.log('newparamsobj', newParamsObj)
      const signedObj = JSON.stringify({
        signature: {
          "Content-Type": "",
          "acl": "public-read-write",
          "success_action_status": "201",
          "policy": "Policy1526045161391",
          ...newParamsObj,
          "key": ""
        },
        postEndPoint: "\/\/student-burger.s3.amazonaws.com\/images"
      })
      console.log('signedObj', signedObj)
      var signedObj2 = {
        "signature": {
          "Content-Type": "",
          "acl": "public-read-write",
          "success_action_status": "201",
          "policy": "eyJleHBpcmF0aW9uIjoiMjAxOC0wNS0yMlQxODozMjo0NVoiLCJjb25kaXRpb25zIjpbeyJidWNrZXQiOiJteXZpem8tZGItYmFja3VwIn0seyJhY2wiOiJwdWJsaWMtcmVhZC13cml0ZSJ9LFsic3RhcnRzLXdpdGgiLCIka2V5IiwiIl0sWyJzdGFydHMtd2l0aCIsIiRDb250ZW50LVR5cGUiLCIiXSxbImNvbnRlbnQtbGVuZ3RoLXJhbmdlIiwwLDUyNDI4ODAwMF0seyJzdWNjZXNzX2FjdGlvbl9zdGF0dXMiOiIyMDEifSx7IngtYW16LWNyZWRlbnRpYWwiOiJBS0lBSU0zUjRFRDNQTEFMT1lEUVwvMjAxODA1MjJcL2FwLXNvdXRoLTFcL3MzXC9hd3M0X3JlcXVlc3QifSx7IngtYW16LWFsZ29yaXRobSI6IkFXUzQtSE1BQy1TSEEyNTYifSx7IngtYW16LWRhdGUiOiIyMDE4MDUyMlQxMjMyNDVaIn1dfQ==",
          "X-amz-credential": "AKIAIM3R4ED3PLALOYDQ\/20180522\/ap-south-1\/s3\/aws4_request",
          "X-amz-algorithm": "AWS4-HMAC-SHA256",
          "X-amz-date": "20180522T123245Z",
          "X-amz-signature": "a3494ba08c600b79ae359f170a9137e0dfc3c6f67abcb83ee13a1e18b06d20ad",
          "key": "${filename}"
        },
        "postEndpoint": "\/\/s3-ap-south-1.amazonaws.com\/myvizo-db-backup"
      }
      res.send(signature)
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
    console.log('filedata',file);
    const key = req.file.filename;
    const filepath = req.file.path;
    generateSignature(
        'putObject',
        file,
        key,
        req.headers.path
      )
      .then((signature) => {
        console.log(signature)
        fs.unlink(filepath, (success, err) => {
          if (err) {
            console.log('err in deleting file', err)
          }
          console.log('deleted the file')
        })
        res.send(signature);
      })
  }
}

exports.deleteAttachment = (req, res) => {
  console.log('inside the delete attachment function');
  console.log(req.body);
  console.log(req.headers);
  const filePath = req.body.key;

  var params = {
    Bucket: 'student-burger'+req.headers.path,
    Key : filePath
  };
  console.log(params);
  s3.deleteObject(params, function (err, data) {
    if (err) console.log(err, err.stack); // error
    else {
      console.log('deleted',data);
      res.status(200).send({code : 'ok'}); // deleted
    }
  });
}
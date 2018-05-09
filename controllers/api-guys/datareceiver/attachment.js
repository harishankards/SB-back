const express = require('express');
const mongoose = require('mongoose');
const Attachments = require('../../../models/Attachment');
const Student = require('../../../models/Student');
const Company = require('../../../models/Company');
const jwt = require('jsonwebtoken');


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
      filepath: req.file.path
    })
  }
}

exports.deleteAttachment = (req, res) => {
  console.log('inside the delete attachment function', req.body);
  jwt.verify(req.token, 'secret', {expiresIn: '10h'}, (authErr, authData) => {
    if(authErr) {
      console.log('autherr', authErr)
      res.sendStatus(403);
    } else {
      const attachmentId = req.body.attachment;
      Attachment.findById(attachmentId, (err, attachment) => {
        if(err){
          console.log('err in find the attachment', err)
          res.status(404).send(err)
        }
        else if (attachment === null) {
          console.log('err in find the attachment', err)
          res.status(412).send(err)
        }
        else {
          console.log('found the attachment', attachment)
          Attachment.findByIdAndRemove(attachmentId, (attachmentErr, removedAttachment) => {
            if (attachmentErr) {
              console.log('could not remove attachment', err)
              res.status(413).send(err)
            }
    
            else {
              console.log('deleted attachment', removedAttachment)
              const removedAttachmentId = removedAttachment._id;
              const companyId = removedAttachment.provider;
              const studentId = removedAttachment.receiver; 
              Company.findByIdAndUpdate(companyId, {$pull: {attachments: removedAttachmentId}}, (removeFromCompanyErr, removedFromCompany) => {
                if(removeFromCompanyErr) {
                  console.log('unable to remove from company', removeFromCompanyErr)
                  res.status(413).send(removeFromCompanyErr)      
                }
                else {
                  console.log('removed from company', removedFromCompany)
                  Student.findByIdAndUpdate(studentId, {$pull: {attachments: removedAttachmentId}}, (removeFromStudentErr, removedFromStudent) => {
                    if(removeFromStudentErr) {
                      console.log('unable to remove from student', removeFromStudentErr)
                      res.status(413).send(removeFromStudentErr)      
                    }
                    else {
                      console.log('removed from student', removedFromStudent)
                      res.status(200).send('attachment_deleted')
                    }
                  })
                }
              })
            }
          })
        }
      })
    }
  })
}
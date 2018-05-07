const express = require('express');
const mongoose = require('mongoose');
const Attachments = require('../../../models/Attachment');
const Student = require('../../../models/Student');
const Company = require('../../../models/Company');
const jwt = require('jsonwebtoken');


exports.createAttachment = (req, res) => {
  console.log('inside attachment creation project',req.body)
  jwt.verify(req.token, 'secret', {expiresIn: '10h'}, (authErr, authData) => {
    if(authErr) {
      console.log('autherr', authErr)
      res.sendStatus(406);
    } else {
      const title = req.body.title,
      description = req.body.description,
      company = req.body.company,
      student = req.body.student,
      files = req.body.files,
      tags = req.body.tags;
      
      if (title === '' ||  description === '' || company === '' || student === '' || files === '' || tags === ''){
        res.status(403).send('Mandatory field missing')
      }
      else {
        Student.findOne({email:student}, (studentErr, student) => {
          if (studentErr) {
            console.log('error in finding the student', studentErr)
            res.status(403).send(studentErr)
          }
          else {
            console.log('found the student', student._id)
            Company.findOne({email: company}, (companyErr, company) => {
              if (companyErr) {
                console.log('error in finding the company', companyErr)
                res.status(403).send(companyErr)
              }
              else {
                console.log('found the company', company._id)            
                const attachment = new Attachment ({
                  title: title,
                  description: description,
                  provider: company._id,
                  receiver: student._id,
                  files: files,
                  tags: tags
                })
                attachment.save( (err, saved) => {
                  if(err) {
                    console.log('err in saving the attachment', err)
                    res.status(403).send(err)
                  }
                  else {
                    console.log('attachment saved', saved)            
                    Company.findByIdAndUpdate(saved.provider, {$push: {attachments: saved._id}}, (companyErr2, company2) =>  {
                      if (companyErr2) {
                        console.log('error in updating the student', companyErr2)
                        res.status(403).send(err)                
                      }
                      else {
                        console.log('company updated', company2)
                        Student.findByIdAndUpdate(saved.receiver, {$push: {attachments: saved._id}}, (studentErr2, student2) =>  {
                          if (studentErr2) {
                            console.log('error in updating the student', studentErr2) 
                            res.status(403).send(err)                                   
                          }
                          else {
                            console.log('student updated', student2)
                            res.status(200).send('attachment_creation_success')                            
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
    }
  })

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
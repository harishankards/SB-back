const express = require('express');
const mongoose = require('mongoose');
const Award = require('../../../models/Award');
const Student = require('../../../models/Student');
const Company = require('../../../models/Company');
const jwt = require('jsonwebtoken');
const Tag = require('../../../models/Tag');
const async = require('async');

exports.createAward = (req, res) => {
  console.log('inside award creation',req.body)
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
                const award = new Award ({
                  title: title,
                  description: description,
                  provider: company._id,
                  receiver: student._id,
                  files: files,
                  tags: tags
                })
                award.save( (err, saved) => {
                  if(err) {
                    console.log('err in saving the award', err)
                    res.status(403).send(err)
                  }
                  else {
                    console.log('award saved', saved)            
                    Company.findByIdAndUpdate(saved.provider, {$push: {awards: saved._id}}, (companyErr2, company2) =>  {
                      if (companyErr2) {
                        console.log('error in updating the student', companyErr2)
                        res.status(403).send(err)                
                      }
                      else {
                        console.log('company updated', company2)
                        Student.findByIdAndUpdate(saved.receiver, {$push: {awards: saved._id}}, (studentErr2, student2) =>  {
                          if (studentErr2) {
                            console.log('error in updating the student', studentErr2) 
                            res.status(403).send(err)                                   
                          }
                          else {
                            console.log('student updated', student2)
                            async.map(saved.tags, (tag, callback) => {
                              Tag.findByIdAndUpdate(tag.id, {$push: {awards: saved._id}}, (tagUpdateErr, tagUpdated) => {
                                if (tagUpdateErr) {
                                console.log('tag updateErr', tagUpdateErr)                                                  
                                } else {
                                  console.log('tag updated', tagUpdated)
                                  callback()                                                                        
                                }
                              })
                            }, (tagUpdateErr2, tagUpdated2) => {
                              if (tagUpdateErr2) {
                                console.log('tag updateErr', tagUpdateErr)                        
                                res.status(401).send(tagUpdateErr2)
                              } else {
                                console.log('tagupdated final and going to emit', tagUpdated2)
                                let notification = {
                                  text: company2.email + ' have given you a new award',
                                  link: saved._id,
                                  type: 'award',
                                  read: false
                                }
                                Student.findByIdAndUpdate(saved.receiver, {$push: {notifications: notification}}, (pushErr, pushed) => {
                                  if (pushErr) {
                                    console.log('could not push the notification')
                                  } else {
                                    console.log('notification pushed', pushed)
                                  }
                                })
                                global.io.emit('award created', 'yes created dude!!!')
                                res.status(200).send('award_creation_success') 
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
        })
      }
    }
  })

}

exports.updateAward = (req, res) => {
  console.log('inside award updation',req.body)
  jwt.verify(req.token, 'secret', {expiresIn: '10h'}, (authErr, authData) => {
    if(authErr) {
      console.log('autherr', authErr)
      res.sendStatus(403);
    } else {
      const awardId = req.body._id;
      
      Award.findByIdAndUpdate(awardId, req.body, (err, updated) => {
        if(err) {
          console.log('err in updating the award', err)
          res.status(401).send(err)
        }
        else {
          console.log('award updated', updated)        
          res.status(200).send('award_updated')    
        }
      }) 
    }
    })
}

exports.deleteAward = (req, res) => {
  console.log('inside the delete award function', req.body);
  jwt.verify(req.token, 'secret', {expiresIn: '10h'}, (authErr, authData) => {
    if(authErr) {
      console.log('autherr', authErr)
      res.sendStatus(403);
    } else {
      const awardId = req.body.award;
      Award.findById(awardId, (err, award) => {
        if(err){
          console.log('err in find the award', err)
          res.status(404).send(err)
        }
        else if (award === null) {
          console.log('err in find the award', err)
          res.status(412).send(err)
        }
        else {
          console.log('found the award', award)
          Award.findByIdAndRemove(awardId, (awardErr, removedAward) => {
            if (awardErr) {
              console.log('could not remove award', err)
              res.status(413).send(err)
            }
    
            else {
              console.log('deleted award', removedAward)
              const removedAwardId = removedAward._id;
              const companyId = removedAward.provider;
              const studentId = removedAward.receiver; 
              Company.findByIdAndUpdate(companyId, {$pull: {awards: removedAwardId}}, (removeFromCompanyErr, removedFromCompany) => {
                if(removeFromCompanyErr) {
                  console.log('unable to remove from company', removeFromCompanyErr)
                  res.status(413).send(removeFromCompanyErr)      
                }
                else {
                  console.log('removed from company', removedFromCompany)
                  Student.findByIdAndUpdate(studentId, {$pull: {awards: removedAwardId}}, (removeFromStudentErr, removedFromStudent) => {
                    if(removeFromStudentErr) {
                      console.log('unable to remove from student', removeFromStudentErr)
                      res.status(413).send(removeFromStudentErr)      
                    }
                    else {
                      console.log('removed from student', removedFromStudent)
                      async.map(award.tags, (tag, callback) => {
                        Tag.findByIdAndUpdate(tag.id, {$pull: {awards: award._id}}, (tagUpdateErr, tagUpdated) => {
                          if (tagUpdateErr) {
                          console.log('tag updateErr', tagUpdateErr)                                                  
                          } else {
                            console.log('tag updated', tagUpdated)
                            callback()
                          }
                        })
                      }, (tagUpdateErr2, tagUpdated2) => {
                        if (tagUpdateErr2) {
                          console.log('tag updateErr', tagUpdateErr)                        
                          res.status(401).send(tagUpdateErr2)
                        } else {
                          console.log('tagupdated final and going to emit', tagUpdated2)
                          res.status(200).send('award_deleted')
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
  })
}
const express = require('express');
const mongoose = require('mongoose');
const Award = require('../../../models/Award');
const Student = require('../../../models/Student');
const Company = require('../../../models/Company');


exports.createAward = (req, res) => {
  console.log('inside award creation project',req.body)
  const title = req.body.title,
        description = req.body.description,
        company = req.body.company,
        student = req.body.student;
        
  if (title === '' ||  description === '' || company === '' || student === ''){
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
              receiver: student._id
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
}

exports.deleteAward = (req, res) => {
  console.log('inside the delete award function', req.body);
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
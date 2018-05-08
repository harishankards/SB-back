const express = require('express');
const mongoose = require('mongoose');
const Contest = require('../../../models/Contest');
const Company = require('../../../models/Company');
const jwt = require('jsonwebtoken');


exports.createContest = (req, res) => {
  console.log('inside creating contest', req.body)
  jwt.verify(req.token, 'secret', {expiresIn: '10h'}, (authErr, authData) => {
    if(authErr) {
      console.log('autherr', authErr)
      res.sendStatus(403);
    } else {
        const title = req.body.title,
              about = req.body.about,
              date = req.body.date,
              rulesFormat = req.body.rulesFormat,
              host = req.body.host,
              tags = req.body.tags;
        if ( title === '' || about === '' || date === '' || host === ''|| rulesFormat === '' || tags === '') {
          res.status(403).send('Mandatory field missing')    
        }
        else {
          Company.findOne({email:host}, (companyErr, company) => {
            if (companyErr) {
              console.log('err in find the company', companyErr)
              res.status(403).send('company not found')
            }
            else {
              console.log('found the company', company)
              const contest = new Contest({
                title: title,
                about: about,
                date: date,
                rulesFormat: rulesFormat,
                tags: tags,
                host: company._id
              })
              contest.save( (err, saved) => {
                if (err) {
                  console.log('err in saving the contest', err)
                  res.status(403).send(err)
                }
                else {
                  console.log('contest saved', saved)            
                  Company.findByIdAndUpdate(saved.host, {$push: {contests: saved._id}}, (companyErr2, company2) => {
                    if (companyErr2) {
                      console.log('error in updating the company', companyErr2)                
                    }
                    else {
                      console.log('company updated', company2)
                      res.status(200).send('contest_creation_success')
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

exports.updateContest = (req, res) => {
  console.log('inside contest updation',req.body)
  jwt.verify(req.token, 'secret', {expiresIn: '10h'}, (authErr, authData) => {
    if(authErr) {
      console.log('autherr', authErr)
      res.sendStatus(403);
    } else {
      const contestId = req.body._id;
      
      Contest.findByIdAndUpdate(contestId, req.body, (err, updated) => {
        if(err) {
          console.log('err in updating the contest', err)
          res.status(401).send(err)
        }
        else {
          console.log('contest updated', updated)        
          res.status(200).send('contest_updated')    
        }
      }) 
    }
    })
}

exports.addRegistrations = (req, res) => {
  console.log('inside adding registrations', req.body)
  jwt.verify(req.token, 'secret', {expiresIn: '10h'}, (authErr, authData) => {
    if(authErr) {
      console.log('autherr', authErr)
      res.sendStatus(403);
    } else {
        const contestId = req.body.contest,
        studentId = req.body.student;
        Contest.findById(contestId, (contestErr, contestDetails) => {
          if(contestErr) {
            console.log('couldnoot find contest', contestErr)
            res.status(403).send(contestErr)
          }
          else {
            console.log('found the contest', contestDetails)
            if(contestDetails.registrations.indexOf(studentId)> -1) {
              console.log('student is alreaady registered')
              res.status(415).send('student alreaady regitered')
            }
            else {
              Contest.findByIdAndUpdate(contestId, {$push: {registrations: studentId}}, (err, contestUpdated) => {
                if(err) {
                  console.log('could not update contest', err)
                  res.status(403).send(err)
                }
                else {
                  console.log('updated the contest registration', contestUpdated)
                  res.status(200).send(contestUpdated)
                }
              })
            }
          }
        })
    }
  })
}

exports.removeRegistrations = (req, res) => {
  console.log('inside removing registrations', req.body)
  jwt.verify(req.token, 'secret', {expiresIn: '10h'}, (authErr, authData) => {
    if(authErr) {
      console.log('autherr', authErr)
      res.sendStatus(403);
    } else {
      const contestId = req.body.contest;
      const studentId = req.body.student;
      Contest.findById(contestId, (contestErr, contestDetails) => {
        if (contestErr) {
          console.log('could not find contest', contestErr)
          res.status(404).send(contestErr)
        }
        else {
          console.log('found the contest', contestDetails)
          if(contestDetails.registrations.indexOf(studentId) > -1){
            console.log('yes student is there')
            Contest.findByIdAndUpdate(contestId, {$pull: {registrations: studentId}}, (err, contest) => {
              if(err) {
                console.log('could not find the contest', err)
                res.status(404).send(err)
              }
              else {
                console.log('removed the student',contest)
                res.status(200).send('removed')
              }
            })
          }
          else {
            console.log('student not found')
            res.status(403).send('student not found')
          }
        }
      })
    }
  })
}

exports.deleteContest = (req, res) => {
  console.log('inside the delete contest function', req.body);
  jwt.verify(req.token, 'secret', {expiresIn: '10h'}, (authErr, authData) => {
    if(authErr) {
      console.log('autherr', authErr)
      res.sendStatus(403);
    } else {
      const contestId = req.body.contest;
      Contest.findById(contestId, (err, contest) => {
        if (err) {
          console.log('could not find contest', err)
          res.status(404).send(err)
        }
        else if (contest === null) {
          console.log('could not find contest', contest)
          res.status(404).send('could not find contest')
        }
        else {
          console.log('found the contest', contest)
          Contest.findByIdAndRemove(contest._id, (removeErr, contestRemoved) => {
            if(removeErr) {
              console.log('could not remove coontest', removeErr)
              res.status(403).send(removeErr)
            }
            else if (contestRemoved === null) {
              console.log('could not remove coontest', contestRemoved)
              res.status(403).send('could not remove contest')
            }
            else {
              console.log('removed contest', contestRemoved)
              Company.findByIdAndUpdate(contestRemoved.host, {$pull: {contests: contestRemoved._id}}, (updateErr, updatedCompany) => {
                if(updateErr) {
                  console.log('could not update company', updateErr)
                  res.status(403).send(updateErr)              
                }
                else {
                 console.log('updated the company', updatedCompany) 
                 res.status(200).send('removed contest')
                }
              })
            }
          })
        }
      })
    }
  })
}
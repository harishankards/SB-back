const express = require('express');
const mongoose = require('mongoose');
const Contest = require('../../../models/Contest');
const Company = require('../../../models/Company');


exports.createContest = (req, res) => {
  console.log('inside creating contest', req.body)
  const title = req.body.title,
        description = req.body.description,
        date = req.body.date,
        host = req.body.host;
  if ( title === '' || description === '' || date === '' || host === '') {
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
          description: description,
          date: date,
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

exports.addRegistrations = (req, res) => {
  console.log('inside adding registrations', req.body)
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

exports.removeRegistrations = (req, res) => {
  console.log('inside removing registrations', req.body)
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
        Contest.findOneAndUpdate(contestId, {$pull: {registrations: studentId}}, (err, contest) => {
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

const express = require('express');
const mongoose = require('mongoose');
const Contest = require('../../../models/Contest');
const jwt = require('jsonwebtoken');

exports.getContest = (req, res) => {
  console.log('inside the get contest', req.query)
  jwt.verify(req.token, 'secret', {expiresIn: '10h'}, (authErr, authData) => {
    if(authErr) {
      console.log('autherr', authErr)
      res.sendStatus(403);
    } else {
      const contestId = req.query.id;
      Contest.findById(contestId, (err, contest) => {
        if (err) {
          console.log('could not find contest', err)
          res.status(403).send(err)
        }
        else {
          console.log('found the contest', contest)
          res.status(200).send(contest)
        }
      })
    }
  })
  }

  exports.getAllContests = (req, res) => {
    console.log('inside the get all contests', req.body)
    jwt.verify(req.token, 'secret', {expiresIn: '10h'}, (authErr, authData) => {
      if(authErr) {
        console.log('autherr', authErr)
        res.sendStatus(403);
      } else {
        Contest.find({}, (err, contests) => {
          if(err) {
              console.log('err',err)
          }
          res.json({
            contests,
            authData
          });
        })
      }
    });
  }
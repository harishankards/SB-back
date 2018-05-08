
const express = require('express');
const mongoose = require('mongoose');
const Award = require('../../../models/Award');
const jwt = require('jsonwebtoken');

exports.getAward = (req, res) => {
    console.log('inside the get award', req.query)
    jwt.verify(req.token, 'secret', {expiresIn: '10h'}, (authErr, authData) => {
      if(authErr) {
        console.log('autherr', authErr)
        res.sendStatus(403);
      } else {
        const awardId = req.query.id;
        Award.findById(awardId, (err, award) => {
          if (err) {
            console.log('could not find award', err)
            res.status(403).send(err)
          }
          else {
            console.log('found the award', award)
            res.status(200).send(award)
          }
        })
      }
    })
  }

  exports.getAllAwards = (req, res) => {
    console.log('inside the get all awards', req.body)
    jwt.verify(req.token, 'secret', {expiresIn: '10h'}, (authErr, authData) => {
      if(authErr) {
        console.log('autherr', authErr)
        res.sendStatus(403);
      } else {
        Award.find({}, (err, awards) => {
          if(err) {
              console.log('err',err)
          }
          res.json({
            awards,
            authData
          });
        })
      }
    });
  }
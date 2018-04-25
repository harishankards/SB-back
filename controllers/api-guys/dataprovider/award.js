
const express = require('express');
const mongoose = require('mongoose');
const Award = require('../../../models/Award');

exports.getAward = (req, res) => {
    console.log('inside the get award', req.query)
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
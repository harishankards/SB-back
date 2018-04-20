
const express = require('express');
const mongoose = require('mongoose');
const Contest = require('../../../models/Contest');

exports.getContest = (req, res) => {
    console.log('inside the get contest', req.query)
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
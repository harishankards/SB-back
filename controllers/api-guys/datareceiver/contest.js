const express = require('express');
const mongoose = require('mongoose');
const Contest = require('../../../models/Contest');

exports.createContest = (req, res) => {
  console.log('inside creating contest', req.body)
  const title = req.body.title,
        description = req.body.description,
        date = req.body.date,
        host = req.body.host;
  if ( title === '' || description === '' || date === '') {
    res.status(403).send('Mandatory field missing')    
  }
  else {
    const contest = new Contest({
      title: title,
      description: description,
      date: date,
      host: host
    })
    contest.save( (err, saved) => {
      if (err) {
        console.log('err in saving the contest', err)
        res.status(403).send(err)
      }
      else {
        console.log('contest saved', saved)
        res.status(200).send('contest_creation_success')
      }
    })
  }
}
const express = require('express');
const mongoose = require('mongoose');
const Attachment = require('../../../models/Attachment');
const jwt = require('jsonwebtoken');
const path = require('path');

exports.getAttachments = (req, res) => {
  console.log('inside the get attachments', req.query)
  jwt.verify(req.token, 'secret', {
    expiresIn: '10h'
  }, (authErr, authData) => {
    if (authErr) {
      console.log('autherr', authErr)
      res.sendStatus(403);
    } else {
      const filePath = req.query.filepath
      console.log('filepath', filePath)
      if (filePath) {
        res.sendFile(path.join(__dirname, '..', '..', '..', filePath))
      } else {
        res.status(404).send('file not found')
      }
    }
  })
}
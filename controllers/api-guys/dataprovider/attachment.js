
const express = require('express');
const mongoose = require('mongoose');
const Attachment = require('../../../models/Attachment');
const jwt = require('jsonwebtoken');

exports.getAttachments = (req, res) => {
    console.log('inside the get attachments', req.query)
    jwt.verify(req.token, 'secret', {expiresIn: '10h'}, (authErr, authData) => {
      if(authErr) {
        console.log('autherr', authErr)
        res.sendStatus(403);
      } else {
        const attachmentId = req.query.id;
        Attachment.findById(attachmentId, (err, attachment) => {
          if (err) {
            console.log('could not find attachment', err)
            res.status(403).send(err)
          }
          else {
            console.log('found the attachment', attachment)
            res.status(200).send(attachment)
          }
        })
      }
    })
  }
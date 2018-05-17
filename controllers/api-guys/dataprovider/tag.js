
const express = require('express');
const mongoose = require('mongoose');
const Tag = require('../../../models/Tag');
const jwt = require('jsonwebtoken');

exports.getTag = (req, res) => {
    console.log('inside the get tag', req.query)
    jwt.verify(req.token, 'secret', {expiresIn: '10h'}, (authErr, authData) => {
      if(authErr) {
        console.log('autherr', authErr)
        res.sendStatus(403);
      } else {
        const tagId = req.query.id;
        Tag.findById(tagId, (err, tag) => {
          if (err) {
            console.log('could not find tag', err)
            res.status(403).send(err)
          }
          else {
            console.log('found the tag', tag)
            res.status(200).send(tag)
          }
        })
      }
    })
  }

  exports.getAllTags = (req, res) => {
    console.log('inside the get all tags', req.body)
    jwt.verify(req.token, 'secret', {expiresIn: '10h'}, (authErr, authData) => {
      if(authErr) {
        console.log('autherr', authErr)
        res.sendStatus(403);
      } else {
        Tag.find({}, (err, tags) => {
          if(err) {
              console.log('err',err)
          }
          res.json({
            tags
          });
        })
      }
    });
  }
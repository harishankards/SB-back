const express = require('express');
const mongoose = require('mongoose');
const Tag = require('../../../models/Tag');
const Student = require('../../../models/Student');
const jwt = require('jsonwebtoken');
const Project = require('../../../models/Project');
const Contest = require('../../../models/Contest');
const Company = require('../../../models/Company');
const CompanyProject = require('../../../models/CompanyProject');
const Award = require('../../../models/Award');


exports.createTag = (req, res) => {
  console.log('inside tag creation',req.body)
  jwt.verify(req.token, 'secret', {expiresIn: '10h'}, (authErr, authData) => {
    if(authErr) {
      console.log('autherr', authErr)
      res.sendStatus(403);
    } else {
      const name = req.body.name,
            code = req.body.code;
      
      if (name === '' || code === '' ){
        res.status(406).send('Mandatory field missing')
      }
      else {
            
        const tag = new Tag ({
          name: name,
          code: code
        })
        tag.save( (err, saved) => {
          if(err) {
            console.log('err in saving the tag', err)
            res.status(401).send(err)
          }
          else {
            console.log('tag saved', saved)            
            res.status(200).send('tag_creation_success')    
          }  
        })
      }
    }
  })
}

exports.updateTag = (req, res) => {
  console.log('inside tag updation',req.body)
  jwt.verify(req.token, 'secret', {expiresIn: '10h'}, (authErr, authData) => {
    if(authErr) {
      console.log('autherr', authErr)
      res.sendStatus(403);
    } else {
      const tagId = req.body._id;
      
      Tag.findByIdAndUpdate(tagId, req.body, (err, updated) => {
        if(err) {
          console.log('err in saving the tag', err)
          res.status(401).send(err)
        }
        else {
          console.log('tag updated', updated)        
          res.status(200).send('tag_updated')    
        }
      }) 
    }
    })
}

exports.deleteTag = (req, res) => {
  console.log('inside the delete tag function', req.body);
  jwt.verify(req.token, 'secret', {expiresIn: '10h'}, (authErr, authData) => {
    if(authErr) {
      console.log('autherr', authErr)
      res.sendStatus(403);
    } else {
      const tagId = req.body.tag;
      Tag.findById(tagId, (err, tag) => {
        if (err) {
          console.log('could not find tag', err)
          res.status(404).send(err)
        }
        else if (tag === null) {
          console.log('could not find tag', tag)
          res.status(404).send('could not find tag')
        }
        else {
          console.log('found the contest', tag)
          Tag.findByIdAndRemove(tag._id, (removeErr, tagRemoved) => {
            if(removeErr) {
              console.log('could not remove tag', removeErr)
              res.status(403).send(removeErr)
            }
            else if (tagRemoved === null) {
              console.log('could not remove tag', tagRemoved)
              res.status(403).send('could not remove tag')
            }
            else {
              console.log('removed tag', tagRemoved)
            }
          })
        }
      })
    }
  })
}
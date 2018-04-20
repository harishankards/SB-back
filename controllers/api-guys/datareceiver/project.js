const express = require('express');
const mongoose = require('mongoose');
const Project = require('../../../models/Project');

exports.createProject = (req, res) => {
  console.log('inside project creation project',req.body)
  const title = req.body.title,
        abstract = req.body.abstract,
        description = req.body.description,
        author = req.body.author;
  if (title === '' || abstract === '' || description === ''){
    res.status(403).send('Mandatory field missing')
  }
  else {
    const project = new Project ({
      title: title,
      abstract: abstract,
      description: description
    })
    project.save( (err, saved) => {
      if(err) {
        console.log('err in saving the project', err)
        res.status(403).send(err)
      }
      else {
        console.log('project saved', saved)
        res.status(200).send('project_creation_success')
      }
    })  
  }
}
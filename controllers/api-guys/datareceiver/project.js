const express = require('express');
const mongoose = require('mongoose');
const Project = require('../../../models/Project');
const Student = require('../../../models/Student');

exports.createProject = (req, res) => {
  console.log('inside project creation project',req.body)
  const title = req.body.title,
        abstract = req.body.abstract,
        description = req.body.description,
        author = req.body.author;
        
  if (title === '' || abstract === '' || description === '' || author === ''){
    res.status(403).send('Mandatory field missing')
  }
  else {
    Student.findOne({email:author}, (studentErr, student) => {
      if (studentErr) {
        console.log('error in finding the student', studentErr)
        res.status(403).send(studentErr)
      }
      else {
        console.log('found the student', student._id)
        const project = new Project ({
          title: title,
          abstract: abstract,
          description: description,
          author: student._id
        })
        project.save( (err, saved) => {
          if(err) {
            console.log('err in saving the project', err)
            res.status(403).send(err)
          }
          else {
            console.log('project saved', saved)            
            Student.findByIdAndUpdate(saved.author, {$push: {projects: saved._id}}, (studentErr2, student2) =>  {
              if (studentErr2) {
                console.log('error in updating the student', studentErr2)
              }
              else {
                console.log('student updated', student2)
                res.status(200).send('project_creation_success')    
              }
            })
          }
        }) 
      }
    })
  }
}
const express = require('express');
const mongoose = require('mongoose');
const Project = require('../../../models/Project');
const Student = require('../../../models/Student');
const jwt = require('jsonwebtoken');

exports.createProject = (req, res) => {
  console.log('inside project creation project',req.body)
  jwt.verify(req.token, 'secret', {expiresIn: '10h'}, (authErr, authData) => {
    if(authErr) {
      console.log('autherr', authErr)
      res.sendStatus(403);
    } else {
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
  })
}

exports.addUpvotes = (req, res) => {
  console.log('inside adding upvotes', req.body)
  jwt.verify(req.token, 'secret', {expiresIn: '10h'}, (authErr, authData) => {
    if(authErr) {
      console.log('autherr', authErr)
      res.sendStatus(403);
    } else {
      const studentId = req.body.student,
      projectId = req.body.project;
      Project.findById(projectId, (err, project) => {
        if(err) {
          console.log('could noot find the project', err)
          res.status(404).send(err)
        }
        else {
          console.log('found the project', project)
          if (project.upvotes.indexOf(studentId) > -1) {
            console.log('already upvoted')
          }
          else {
            Project.findByIdAndUpdate(projectId, {$push: {upvotes: studentId}}, (upvoteErr, upvoted) => {
              if(upvoteErr) {
                console.log('could not add upvote', upvoteErr)
                res.status(413).send(upvoteErr)
              }
              else {
                console.log('project upvoted', upvoted)
                res.status(200).send('upvoted')
              }
            })
          }
        }
      })
    }
  })
}

exports.removeUpvotes = (req, res) => {
  console.log('inside the remove upvotes function', req.body)
  const studentId = req.body.student,
        projectId = req.body.project;
  Project.findById(projectId, (err, project) => {
    if(err) {
      console.log('could not find the project', err)
      res.status(404).send(err)
    }
    else {
      console.log('found the project', project)
      if(project.upvotes.indexOf(studentId) > -1){
        console.log('yes student is there')
        Project.findByIdAndUpdate(projectId, {$pull: {upvotes: studentId}}, (removeErr, removed) => {
          if(removeErr) {
            console.log('could not remove upvote', removeErr)
            res.status(413).send(removeErr)
          }
          else{
            console.log('removed the upvote', removed)
            res.status(200).send('removed upvote')            
          }
        })
      }
      else {
        console.log('upvote not found')
        res.status(404).send('upvote not found')
      }
    }
  })
}

exports.deleteProject = (req, res) => {
  console.log('inside the delete project function', req.body);
  var projectId = req.body.project;
  Project.findById(projectId, (err, project) => {
    if (err) {
      console.log('could not find project', err)
      res.status(404).send(err)
    }
    else if (project === null) {
      console.log('could not find project', project)
      res.status(404).send('could not find project')
    }
    else {
      console.log('found the contest', project)
      Project.findByIdAndRemove(project._id, (removeErr, projectRemoved) => {
        if(removeErr) {
          console.log('could not remove project', removeErr)
          res.status(403).send(removeErr)
        }
        else if (projectRemoved === null) {
          console.log('could not remove project', projectRemoved)
          res.status(403).send('could not remove project')
        }
        else {
          console.log('removed project', projectRemoved)
          Student.findByIdAndUpdate(project.author, {$pull: {projects: projectRemoved._id}}, (updateErr, updated) => {
            if(updateErr) {
              console.log('could not upda te the student', updateErr)
              res.status(403).send('could not update student')
            }
            else {
              console.log('updated the student')
              res.status(200).send('removed project')     
            }
          })
        }
      })
    }
  })
}
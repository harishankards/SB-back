const express = require('express');
const mongoose = require('mongoose');
const CompanyProject = require('../../../models/CompanyProject');
const Company = require('../../../models/Company');
const Student = require('../../../models/Student');
const jwt = require('jsonwebtoken');

exports.createCompanyProject = (req, res) => {
  console.log('inside project creation project',req.body)
  jwt.verify(req.token, 'secret', {expiresIn: '10h'}, (authErr, authData) => {
    if(authErr) {
      console.log('autherr', authErr)
      res.sendStatus(403);
    } else {
      const title = req.body.title,
            abstract = req.body.abstract,
            description = req.body.description,
            author = req.body.author,
            files = req.body.files,
            tags = req.body.tags;
      
      if (title === '' || abstract === '' || description === '' || author === '' || files === '' || tags === ''){
        res.status(406).send('Mandatory field missing')
      }
      else {
        Company.findOne({email:author}, (companyErr, company) => {
          if (studentErr) {
            console.log('error in finding the company', companyErr)
            res.status(404).send(companyErr)
          }
          else {
            console.log('found the company', company._id)
            const project = new CompanyProject ({
              title: title,
              abstract: abstract,
              description: description,
              author: student._id,
              tags: tags,
              files: files
            })
            project.save( (err, saved) => {
              if(err) {
                console.log('err in saving the project', err)
                res.status(401).send(err)
              }
              else {
                console.log('project saved', saved)            
                Company.findByIdAndUpdate(saved.author, {$push: {projects: saved._id}}, (companyErr2, company2) =>  {
                  if (companyErr2) {
                    console.log('error in updating the student', studentErr2)
                  }
                  else {
                    console.log('company updated', company2)
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

exports.updateCompanyProject = (req, res) => {
  console.log('inside company project updation',req.body)
  jwt.verify(req.token, 'secret', {expiresIn: '10h'}, (authErr, authData) => {
    if(authErr) {
      console.log('autherr', authErr)
      res.sendStatus(403);
    } else {
      const projectId = req.body._id;
      
      CompanyProject.findByIdAndUpdate(projectId, req.body, (err, updated) => {
        if(err) {
          console.log('err in saving the project', err)
          res.status(401).send(err)
        }
        else {
          console.log('project updated', updated)        
          res.status(200).send('project_updated')    
        }
      }) 
    }
    })
}

const express = require('express');
const mongoose = require('mongoose');
const CompanyProject = require('../../../models/CompanyProject');
const Company = require('../../../models/Company');
const Student = require('../../../models/Student');
const jwt = require('jsonwebtoken');
const Tag = require('../../../models/Tag');
const async = require('async');

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
          if (companyErr) {
            console.log('error in finding the company', companyErr)
            res.status(404).send(companyErr)
          }
          else {
            console.log('found the company', company._id)
            const project = new CompanyProject ({
              title: title,
              abstract: abstract,
              description: description,
              author: company._id,
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
                    console.log('error in updating the company', companyErr2)
                  }
                  else {
                    console.log('company updated', company2)
                    async.map(saved.tags, (tag, callback) => {
                      Tag.findByIdAndUpdate(tag.id, {$push: {companyProjects: saved._id}}, (tagUpdateErr, tagUpdated) => {
                        if (tagUpdateErr) {
                        console.log('tag updateErr', tagUpdateErr)                                                  
                        } else {
                          console.log('tag updated', tagUpdated)
                          let notification = {
                            text: company2.email + ' posted a new project',
                            link: saved._id,
                            type: 'companyproject',
                            read: false
                          }
                          async.map(tagUpdated.students, (studentToBeNotified, callback2) => {
                            console.log('student to be notified', studentToBeNotified)
                            Student.findByIdAndUpdate(studentToBeNotified, {$push: {notifications: notification}}, (pushErr, pushed) => {
                              if (pushErr) {
                                console.log('could not push the notification')
                              } else {
                                console.log('notification pushed', pushed)
                              }
                            })
                          }, (studentUpdateErr, studentUpdated) => {
                            if (studentUpdateErr) {
                              console.log('student update err', studentUpdateErr)
                            }
                            callback()
                          })
                        }
                      })
                    }, (tagUpdateErr2, tagUpdated2) => {
                      if (tagUpdateErr2) {
                        console.log('tag updateErr', tagUpdateErr)                        
                        res.status(401).send(tagUpdateErr2)
                      } else {
                        console.log('tagupdated final and going to emit', tagUpdated2)
                        global.io.emit('companyproject created', 'yes created dude!!!')
                        res.status(200).send('company_project_creation_success')
                      }
                    })
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

exports.addUpvotes = (req, res) => {
  console.log('inside adding upvotes', req.body)
  jwt.verify(req.token, 'secret', {expiresIn: '10h'}, (authErr, authData) => {
    if(authErr) {
      console.log('autherr', authErr)
      res.sendStatus(403);
    } else {
      const studentId = req.body.student,
            projectId = req.body.project;
      CompanyProject.findById(projectId, (err, project) => {
        if(err) {
          console.log('could noot find the project', err)
          res.status(404).send(err)
        }
        else {
          console.log('found the project', project)
          if (project.upvotes.indexOf(studentId) > -1) {
            console.log('already upvoted')
            res.status(404).send('already upvoted')            
          }
          else {
            CompanyProject.findByIdAndUpdate(projectId, {$push: {upvotes: studentId}}, (upvoteErr, upvoted) => {
              if(upvoteErr) {
                console.log('could not add upvote', upvoteErr)
                res.status(413).send(upvoteErr)
              }
              else {
                console.log('project upvoted', upvoted)
                Student.findById(studentId, (upvotedStudentErr, upvotedStudent) => {
                  if (upvotedStudentErr) {
                    console.log('upvoted Student Err', upvotedStudentErr)
                    res.status(404).send(err)                    
                  } else {
                    console.log('upvoted student', upvotedStudent)
                    let notification = {
                      text: upvotedStudent.email + ' upvoted your project',
                      link: projectId,
                      type: 'companyproject',
                      read: false
                    }
                    Company.findByIdAndUpdate(upvoted.author, {$push: {notifications: notification}}, (pushErr, pushed) => {
                      if (pushErr) {
                        console.log('could not push the notification')
                      } else {
                        console.log('notification pushed', pushed)
                        res.status(200).send('upvoted')                          
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
  })
}

exports.removeUpvotes = (req, res) => {
  console.log('inside the remove upvotes function', req.body)
  jwt.verify(req.token, 'secret', {expiresIn: '10h'}, (authErr, authData) => {
    if(authErr) {
      console.log('autherr', authErr)
      res.sendStatus(403);
    } else {
        const studentId = req.body.student,
              projectId = req.body.project;
        CompanyProject.findById(projectId, (err, project) => {
          if(err) {
            console.log('could not find the project', err)
            res.status(404).send(err)
          }
          else {
            console.log('found the project', project)
            if(project.upvotes.indexOf(studentId) > -1){
              console.log('yes student is there')
              CompanyProject.findByIdAndUpdate(projectId, {$pull: {upvotes: studentId}}, (removeErr, removed) => {
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
              console.log('student not upvoted')
              res.status(404).send('student not upvoted')
            }
          }
        })
    }
  })
}

exports.deleteCompanyProject = (req, res) => {
  console.log('inside the delete company project function', req.body);
  jwt.verify(req.token, 'secret', {expiresIn: '10h'}, (authErr, authData) => {
    if(authErr) {
      console.log('autherr', authErr)
      res.sendStatus(403);
    } else {
      const projectId = req.body.project;
      CompanyProject.findById(projectId, (err, project) => {
        if (err) {
          console.log('could not find project', err)
          res.status(404).send(err)
        }
        else if (project === null) {
          console.log('could not find project', project)
          res.status(404).send('could not find project')
        }
        else {
          console.log('found the company projct', project)
          CompanyProject.findByIdAndRemove(project._id, (removeErr, projectRemoved) => {
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
              Company.findByIdAndUpdate(project.author, {$pull: {projects: projectRemoved._id}}, (updateErr, updated) => {
                if(updateErr) {
                  console.log('could not upda te the company', updateErr)
                  res.status(403).send('could not update company')
                }
                else {
                  console.log('updated the company')
                  async.map(project.tags, (tag, callback) => {
                    Tag.findByIdAndUpdate(tag.id, {$pull: {companyProjects: project._id}}, (tagUpdateErr, tagUpdated) => {
                      if (tagUpdateErr) {
                      console.log('tag updateErr', tagUpdateErr)                                                  
                      } else {
                        console.log('tag updated', tagUpdated)
                        callback()
                      }
                    })
                  }, (tagUpdateErr2, tagUpdated2) => {
                    if (tagUpdateErr2) {
                      console.log('tag updateErr', tagUpdateErr)                        
                      res.status(401).send(tagUpdateErr2)
                    } else {
                      console.log('tagupdated final and going to emit', tagUpdated2)
                      res.status(200).send('removed project')     
                    }
                  })  
                }
              })
            }
          })
        }
      })
    }
  })
}


exports.applyProject = (req, res) => {
  console.log('inside apply project', req.body)
  jwt.verify(req.token, 'secret', {expiresIn: '10h'}, (authErr, authData) => {
    if(authErr) {
      console.log('autherr', authErr)
      res.sendStatus(403);
    } else {
      const studentId = req.body.student,
      projectId = req.body.project;
      CompanyProject.findById(projectId, (err, project) => {
        if(err) {
          console.log('could noot find the project', err)
          res.status(404).send(err)
        }
        else {
          console.log('found the project', project)
          if (project.appliedStudents.indexOf(studentId) > -1) {
            console.log('already applied')
            res.status(404).send('already applied')            
          }
          else {
            CompanyProject.findByIdAndUpdate(projectId, {$push: {appliedStudents: studentId}}, (applyErr, applied) => {
              if(applyErr) {
                console.log('could not apply', applyErr)
                res.status(413).send(applyErr)
              }
              else {
                console.log('project applied', applied)
                Student.findById(studentId, (appliedStudentErr, appliedStudent) => {
                  if (appliedStudentErr) {
                    console.log('applied Student Err', appliedStudentErr)
                    res.status(404).send(err)                    
                  } else {
                    console.log('applied student', appliedStudent)
                    Student.findByIdAndUpdate(studentId, {$push: {appliedCompanyProjects: applied._id}}, (updateStudentErr, updateStudent) => {
                      if (updateStudentErr) {
                        console.log('could not update student', updateStudentErr)
                      } else {
                        console.log('student updated', updateStudent)
                      }
                    })
                    let notification = {
                      text: appliedStudent.email + ' applied to do your project',
                      link: projectId,
                      type: 'companyproject',
                      read: false
                    }
                    Company.findByIdAndUpdate(applied.author, {$push: {notifications: notification}}, (pushErr, pushed) => {
                      if (pushErr) {
                        console.log('could not push the notification')
                      } else {
                        console.log('notification pushed', pushed)
                        res.status(200).send('applied')                          
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
  })
}

exports.unapplyProject = (req, res) => {
  console.log('inside the unapply project function', req.body)
  jwt.verify(req.token, 'secret', {expiresIn: '10h'}, (authErr, authData) => {
    if(authErr) {
      console.log('autherr', authErr)
      res.sendStatus(403);
    } else {
        const studentId = req.body.student,
              projectId = req.body.project;
        CompanyProject.findById(projectId, (err, project) => {
          if(err) {
            console.log('could not find the project', err)
            res.status(404).send(err)
          }
          else {
            console.log('found the project', project)
            if(project.appliedStudents.indexOf(studentId) > -1){
              console.log('yes student is there')
              CompanyProject.findByIdAndUpdate(projectId, {$pull: {appliedStudents: studentId}}, (removeErr, removed) => {
                if(removeErr) {
                  console.log('could not unapply', removeErr)
                  res.status(413).send(removeErr)
                }
                else{
                  console.log('unapplied the student', removed)
                  res.status(200).send('removed upvote')            
                }
              })
            }
            else {
              console.log('student not applied')
              res.status(404).send('student not applied')
            }
          }
        })
    }
  })
}
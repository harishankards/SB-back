const express = require('express');
const mongoose = require('mongoose');
const Project = require('../../../models/Project');
const Student = require('../../../models/Student');
const Company = require('../../../models/Company');
const Tag = require('../../../models/Tag');
const jwt = require('jsonwebtoken');
const async = require('async');

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
            author = req.body.author,
            files = req.body.files,
            tags = req.body.tags;
      
      if (title === '' || abstract === '' || description === '' || author === '' || files === '' || tags === ''){
        res.status(406).send('Mandatory field missing')
      }
      else {
        Student.findOne({email:author}, (studentErr, student) => {
          if (studentErr) {
            console.log('error in finding the student', studentErr)
            res.status(404).send(studentErr)
          }
          else {
            console.log('found the student', student._id)
            const project = new Project ({
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
                Student.findByIdAndUpdate(saved.author, {$push: {projects: saved._id}}, (studentErr2, student2) =>  {
                  if (studentErr2) {
                    console.log('error in updating the student', studentErr2)
                    res.status(401).send(err)                    
                  }
                  else {
                    console.log('student updated', student2)
                    let notifiedStudents = [];
                    async.map(saved.tags, (tag, callback) => {
                      Tag.findByIdAndUpdate(tag.id, {$push: {projects: saved._id}}, (tagUpdateErr, tagUpdated) => {
                        if (tagUpdateErr) {
                        console.log('tag updateErr', tagUpdateErr)                                                  
                        } else {
                          console.log('tag updated', tagUpdated)
                          let notification = {
                            text: student2.email + ' posted a project',
                            link: saved._id,
                            type: 'project',
                            title: saved.title,
                            read: false
                          }
                          async.map(tagUpdated.students, (studentToBeNotified, callback2) => {
                            if (studentToBeNotified.toString() == saved.author.toString()) {
                              console.log('same student')
                            } else {
                              console.log('different student')
                              if (notifiedStudents.includes(studentToBeNotified)) {
                                console.log('already notified')
                              } else {
                                console.log('going to notify')
                                notifiedStudents.push(studentToBeNotified)
                                Student.findByIdAndUpdate(studentToBeNotified, {$push: {notifications: notification}}, (pushErr, pushed) => {
                                  if (pushErr) {
                                    console.log('could not push the notification')
                                  } else {
                                    console.log('notification pushed', pushed)
                                  }
                                })
                              }
                            }
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
                        global.io.emit('project created', 'yes created dude!!!')
                        res.status(200).send('project_creation_success')
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

exports.updateProject = (req, res) => {
  console.log('inside project updation',req.body)
  jwt.verify(req.token, 'secret', {expiresIn: '10h'}, (authErr, authData) => {
    if(authErr) {
      console.log('autherr', authErr)
      res.sendStatus(403);
    } else {
      const projectId = req.body._id;
      
      Project.findByIdAndUpdate(projectId, req.body, (err, updated) => {
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
      Project.findById(projectId, (err, project) => {
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
            Project.findByIdAndUpdate(projectId, {$push: {upvotes: studentId}}, (upvoteErr, upvoted) => {
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
                      type: 'project',
                      read: false
                    }
                    if (studentId.toString() == upvoted.author.toString()) {
                      console.log('same student')
                      res.status(200).send('upvoted')                                                
                    } else {
                      console.log('different student')
                      Student.findByIdAndUpdate(upvoted.author, {$push: {notifications: notification}}, (pushErr, pushed) => {
                        if (pushErr) {
                          console.log('could not push the notification')
                        } else {
                          console.log('notification pushed', pushed)
                          res.status(200).send('upvoted')                          
                        }
                      })
                    }
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
              console.log('student not upvoted')
              res.status(404).send('student not upvoted')
            }
          }
        })
    }
  })
}

exports.deleteProject = (req, res) => {
  console.log('inside the delete project function', req.body);
  jwt.verify(req.token, 'secret', {expiresIn: '10h'}, (authErr, authData) => {
    if(authErr) {
      console.log('autherr', authErr)
      res.sendStatus(403);
    } else {
      const projectId = req.body.project;
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
                  async.map(project.tags, (tag, callback) => {
                    Tag.findByIdAndUpdate(tag.id, {$pull: {projects: project._id}}, (tagUpdateErr, tagUpdated) => {
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

exports.addStudentViews = (req, res) => {
  console.log('inside adding student views', req.body)
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
          if (project.studentsViewed.indexOf(studentId) > -1) {
            console.log('already viewed')
            res.status(304).send('already viewed')            
          }
          else {
            Project.findByIdAndUpdate(projectId, {$push: {studentsViewed: studentId}}, (viewErr, viewed) => {
              if(viewErr) {
                console.log('could not add view', viewErr)
                res.status(413).send(viewErr)
              }
              else {
                console.log('project viewed', viewed)
                Student.findById(studentId, (viewedStudentErr, viewedStudent) => {
                  if (viewedStudentErr) {
                    console.log('viewed Student Err', viewedStudentErr)
                    res.status(404).send(err)                    
                  } else {
                    console.log('viewed student', viewedStudent)
                    res.status(200).send('student_view_added')                                                                    
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

exports.addCompanyViews = (req, res) => {
  console.log('inside adding company views', req.body)
  jwt.verify(req.token, 'secret', {expiresIn: '10h'}, (authErr, authData) => {
    if(authErr) {
      console.log('autherr', authErr)
      res.sendStatus(403);
    } else {
      const companyId = req.body.company,
            projectId = req.body.project;
      Project.findById(projectId, (err, project) => {
        if(err) {
          console.log('could noot find the project', err)
          res.status(404).send(err)
        }
        else {
          console.log('found the project', project)
          if (project.companiesViewed.indexOf(companyId) > -1) {
            console.log('already viewed')
            res.status(304).send('already viewed')            
          }
          else {
            Project.findByIdAndUpdate(projectId, {$push: {companiesViewed: companyId}}, (viewErr, viewed) => {
              if(viewErr) {
                console.log('could not add view', viewErr)
                res.status(413).send(viewErr)
              }
              else {
                console.log('project viewed', viewed)
                Company.findById(companyId, (viewedCompanyErr, viewedCompany) => {
                  if (viewedCompanyErr) {
                    console.log('viewed company Err', viewedCompanyErr)
                    res.status(404).send(err)                    
                  } else {
                    console.log('viewed company', viewedCompany)
                    res.status(200).send('company_view_added')                                                                    
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
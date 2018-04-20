const express = require('express');
const mongoose = require('mongoose');
const { promisify } = require('util');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const passport = require('passport');
const Student = require('../../../models/Student');

const randomBytesAsync = promisify(crypto.randomBytes);


exports.getStudent = (req, res) => {
    console.log('got the call from frontend', req.query)
    if (req.query.id) {
        const userId = req.query.id;
        Student.find({_id: userId}, (err, student) => {
            if(err) {
                console.log(err);
                res.status(413).send(err)
            }
            console.log('found the student and returing', student)
            res.status(200).send(student);
        })
    }
    else {
        const userEmail = req.query.email;
        Student.find({email: userEmail}, (err, student) => {
            if(err) {
                console.log(err);
                res.status(413).send(err)
            }
            console.log('found the student and returing', student)
            res.status(200).send(student);
        })
    } 
}

exports.getStudentById = (req, res) => {
    console.log('got the call from frontend to give student by id', req.query.id)
    res.status(200).send('student')
}



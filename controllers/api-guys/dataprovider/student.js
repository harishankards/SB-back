const express = require('express');
const mongoose = require('mongoose');
const { promisify } = require('util');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const passport = require('passport');
const Student = require('../../../models/Student');

const randomBytesAsync = promisify(crypto.randomBytes);


exports.giveStudents = (req, res) => {
    console.log('got the call from frontend')
    Student.find({}, (err, students) => {
        if(err) {console.log(err);}
        res.send(students);
    })
}



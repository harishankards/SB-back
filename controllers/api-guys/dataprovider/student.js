const express = require('express');
const mongoose = require('mongoose');
const { promisify } = require('util');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const passport = require('passport');
const Student = require('../../../models/Student');

const randomBytesAsync = promisify(crypto.randomBytes);


exports.getStudent = (req, res) => {
    console.log('got the call from frontend', req.body)
    const userEmail = req.param('email')
    Student.find({email: userEmail}, (err, student) => {
        if(err) {
            console.log(err);
            res.status(413).send(err)
        }
        console.log('found the student and returing', student)
        res.status(200).send(student);
    })
}



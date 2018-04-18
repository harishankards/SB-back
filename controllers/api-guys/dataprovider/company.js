const express = require('express');
const mongoose = require('mongoose');
const Company = require('../../../models/Company');


exports.giveCompanies = (req, res) => {
    console.log('got the call from frontend')
    Company.find({}, (err, companies) => {
        if(err) {console.log(err);}
        res.send(companies);
    })
}
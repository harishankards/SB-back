const express = require('express');
const mongoose = require('mongoose');
const { promisify } = require('util');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const passport = require('passport');
const Student = require('../../../models/Student');
const Company = require('../../../models/Company');

const randomBytesAsync = promisify(crypto.randomBytes);


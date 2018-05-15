const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const companyProjectSchema = new Schema({

author : { type: Schema.Types.ObjectId, ref: 'Company' },
title : String,
abstract : String,
description : String,
upvotes : [{ type: Schema.Types.ObjectId, ref: 'Student' }],
tags: Array,
files: Array,
},{ timestamps: true })


const CompanyProject = mongoose.model('companyProjects', companyProjectSchema);

module.exports = CompanyProject;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const projectSchema = new Schema({

author : { type: Schema.Types.ObjectId, ref: 'Student' },
title : String,
abstract : String,
description : String,
upvotes : [{ type: Schema.Types.ObjectId, ref: 'Student' }],
tags: Array,
files: Array,
studentsViewed: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
companiesViewed: [{ type: Schema.Types.ObjectId, ref: 'Company' }],
},{ timestamps: true })


const Project = mongoose.model('projects', projectSchema);

module.exports = Project;
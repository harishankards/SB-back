const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const projectSchema = new Schema({

author : { type: Schema.Types.ObjectId, ref: 'Student' },
id : String,
title : String,
abstract : String,
description : String,
upvotes : [{ type: Schema.Types.ObjectId, ref: 'Student' }]
})


const Project = mongoose.model('projects', projectSchema);

module.exports = Project;
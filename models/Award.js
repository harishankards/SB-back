const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const awardSchema = new Schema({

provider : { type: Schema.Types.ObjectId, ref: 'Company' },
title : String,
description : String,
date: Date,
receiver : { type: Schema.Types.ObjectId, ref: 'Student' },
files: Array,
tags: Array
},{ timestamps: true })

const Award = mongoose.model('awards', awardSchema);

module.exports = Award;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const contestSchema = new Schema({

host : { type: Schema.Types.ObjectId, ref: 'Company' },
title : String,
description : String,
date: Date,
registrations : [{ type: Schema.Types.ObjectId, ref: 'Student' }]
})


const Contest = mongoose.model('contests', contestSchema);

module.exports = Contest;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const contestSchema = new Schema({

host : { type: Schema.Types.ObjectId, ref: 'Company' },
title : String,
about : String,
rulesFormat: String,
date: Object,
registrations : [{ type: Schema.Types.ObjectId, ref: 'Student' }],
tags: Array
})

const Contest = mongoose.model('contests', contestSchema);

module.exports = Contest;
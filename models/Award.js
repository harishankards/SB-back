const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const awardSchema = new Schema({

provider : { type: Schema.Types.ObjectId, ref: 'Company' },
title : String,
description : String,
date: Date,
receivers : [{ type: Schema.Types.ObjectId, ref: 'Student' }]
})

const Award = mongoose.model('awards', contestSchema);

module.exports = Award;
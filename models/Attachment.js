const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const attachmentSchema = new Schema({

content : {data: Buffer, contentType: String},
name: String,
owner: {
  role: String,
  id: String
},
}, { timestamps: true })

const Attachment = mongoose.model('attachments', attachmentSchema);

module.exports = Attachment;
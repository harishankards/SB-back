const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tagSchema = new Schema({
name : String,
code : String,
students: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
companies: [{ type: Schema.Types.ObjectId, ref: 'Company' }],
awards: [{ type: Schema.Types.ObjectId, ref: 'awards' }],
contests: [{ type: Schema.Types.ObjectId, ref: 'contests' }],
projects: [{ type: Schema.Types.ObjectId, ref: 'projects' }],  
companyProjects: [{ type: Schema.Types.ObjectId, ref: 'companyProjects' }],  
},{ timestamps: true })

const Tag = mongoose.model('tags', tagSchema);

module.exports = Tag;
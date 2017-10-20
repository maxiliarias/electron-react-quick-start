const mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
  fname: String,
  lname: String,
  username: String,
  password: String,
  doc: [{type: mongoose.Schema.Types.ObjectId, ref: "Document"}]
});

var docSchema = new mongoose.Schema({
  author: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}],
  collaborators: Array,
  title: String,
  content: String,
  lastModified: Date,
});

module.exports = {
  User: mongoose.model('User', userSchema),
  Document: mongoose.model('Document', docSchema)
};

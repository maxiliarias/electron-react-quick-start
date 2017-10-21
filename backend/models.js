const mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
  username: String,
  password: String,
  doc: [{type: mongoose.Schema.Types.ObjectId, ref: "Document"}]
});

var docSchema = new mongoose.Schema({
  author: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}],
  collaborators: Array,
  password: String,
  title: String,
  content: String,
});

module.exports = {
  User: mongoose.model('User', userSchema),
  Document: mongoose.model('Document', docSchema)
};

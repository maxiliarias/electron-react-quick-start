const express = require('express');
const app = express();
const server = require('http').createServer(app);
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const { User, Document} = require('./models');

mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on('connected', function(){
  console.log('successfully connected to database');
});
mongoose.Promise = global.Promise;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
  secret: 'keyboard cat',
  store: new MongoStore({
    mongooseConnection: mongoose.connection
  })
}));

// Passport
app.use(session({
  secret: process.env.SECRET,
  store: new MongoStore({mongooseConnection: mongoose.connection})
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(null, user);
  });
});

// passport strategy
passport.use(new LocalStrategy(function(username, password, done) {
  // Find the user with the given username
  User.findOne({username: username}, function(err, user) {
    // if there's an error, finish trying to authenticate (auth failed)
    if (err) {
      console.error('Error fetching user in LocalStrategy', err);
      return done(err);
    }
    // if no user present, auth failed
    if (!user) {
      console.log("no user");
      return done(null, false, {message: 'Incorrect username.'});
    }
    // if passwords do not match, auth failed
    if (user.password !== password) {
      return done(null, false, {message: 'Incorrect password.'});
    }
    // auth has has succeeded
    console.log('success');
    return done(null, user);
  });
}));
/* END OF PASSPORT SETUP */

app.post('/register', function(req,res){
  console.log('inside register ');
  var u = new User({
    username: req.body.username,
    password: req.body.password,
    fname: req.body.fname,
    lname: req.body.lname
  });
  u.save(function(err,user){
    if(err){
      console.log('hi error ');
      res.json({success: false, error: err});
    } else {
      console.log('Hi success');
      res.json({success: true});
    }
  });
});

app.post('/login',passport.authenticate('local'),(req, res) => {
  res.json({success: true, user: req.user});
});

/* END OF AUTHENTICATION ROUTES*/

app.post('/newdocument',function(req,res){
  var d = new Document({
    author: req.user._id,
    title: req.body.title,
    collaborators: [req.user._id],
    lastModified: new Date()
  });
  d.save(function(err,doc){
    if(err){
      console.log('error is', err);
    } else {
      User.findById(req.user._id)
      .then(user => {
        user.doc.push(doc._id);
        user.save();
      })
      .then(function(){
        res.json({success: true, doc: doc });
      })
      .catch(function(err){
        res.json({ success: false, error: err });
      });
    }
  });
});

app.get('/getdocuments', function(req,res){
  User.findById(req.user._id)
  .populate('doc')
  .exec()
  .then(user => {
    res.json({success: true, userDocs: user.doc });
  })
  .catch(err => {throw err;});
});

app.get('/getdocument', function(req,res){
  var docId = req.query.id;
  console.log('id is ', docId);
  Document.findById(docId)
  .then(doc => {
    res.json({success:true, doc: doc});
  })
  .catch(err => {
    res.json({ success: false, error: err });
  });
});

app.post('/content', function(req,res){
  console.log('im here just beginning', req.query.id);
  var textArray = req.body.content.blocks;
  let  allTexts = "";

  for (var i =0; i <textArray.length; i++){
    allTexts += textArray[i].text + "\n";
  }

  console.log('testing here', allTexts, "user is", req.user._id);

  Document.findById(req.query.id)
  .then(doc => {
    doc.content = allTexts;
    doc.save();
    console.log('im on the server side saving');
  })
  .catch(err => {throw err;});
});

server.listen(3000, function () {
  console.log('Backend server for Electron App running on port 3000!');
});

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
  var username = req.body.username;
  var password = req.body.password;
  var repeat= req.body.repeat;

  if( password !== repeat){
    console.log('inside password not match');
    res.json({success: false, error: "Your passwords do not match."});
  } else if( username.length <7){
    console.log('inside username.length');
    res.json({success: false, error: "Your username must be at least 7 characters long."});
  } else {
    var u = new User({
      username: req.body.username,
      password: req.body.password,
    });
    u.save(function(err,user){
      if(err){
        res.json({success: false, error: err});
      } else {
        res.json({success: true});
      }
    });
  }
});

app.post('/login',passport.authenticate('local'),(req, res) => {
  res.json({success: true, user: req.user});
});

/* END OF AUTHENTICATION ROUTES*/

app.post('/newdocument',function(req,res){
  if(req.body.title && req.body.password){
    var d = new Document({
      author: req.user._id,
      title: req.body.title,
      password: req.body.password,
      collaborators: [req.user._id],
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
  } else {
    res.json({success: false, error: "Need title and password"});
  }
});

app.post('/checkpassword', function(req,res){
  Document.findById(req.body.id)
  .then(doc => {
    if(doc.password === req.body.password){
      res.json({success: true, doc: doc });
    } else {
      res.json({ success: false, error: "Passwords do not match" });
    }
  })
  .catch(err => {throw err;});
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
  Document.findById(req.query.id)
  .then(doc => {
    doc.content = req.body.content;
    doc.save();
  })
  .then(
    res.json({success:true})
  )
  .catch(err => {throw err;});
});

server.listen(3000, function () {
  console.log('Backend server for Electron App running on port 3000!');
});

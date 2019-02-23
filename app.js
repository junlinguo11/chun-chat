const express = require('express');
const path = require('path');
const cors = require('cors');
const jsonParser = require("body-parser").json;
const cookieParser = require('cookie-parser');
const passport = require('passport');
const compression = require('compression');

const db = require('./models/db');
const formValidation = require('./routes/formValidation');
const userRoutes = require('./routes/user');

const app = express();
app.use(compression());
const http = require('http').Server(app);
const io   = require('socket.io')(http);

app.use(express.static(path.join(__dirname, 'public')));

app.use(jsonParser());
app.use(cookieParser());
app.use(cors());

// Passport init
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => { 
  req.io = io; 
  next(); 
});

const chatListener = require('./sockets/chat')(io);

app.use('/', formValidation);
app.use('/user', userRoutes);

app.get('*', (req, res, next) => {
  res.redirect('/');
});

const Report = require('./models/reportSchema');
const verify = require('./jwt');
app.post('/report', verify.jwt, async (req, res, next) => {
  try {
    let report = new Report({content: req.body.content});
    await report.saveReport();
    res.json({isSuccess: true});
  } catch(err) {
    next(err);
  }
});

app.use(function(req, res, next) {
  var err = new Error('File Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({message: 'invalid token...'});
  } else {
    res.status(err.status || 500);
    res.json({message: err.message});
  }
});

http.listen(process.env.PORT || 3000, function(){
  console.log(`listening on: ${process.env.PORT || 3000}`);
});
  
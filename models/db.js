const mongoose = require('mongoose');
mongoose.Promise = global.Promise; 

mongoose.connect(process.env.MONGODB_URI ||'mongodb://localhost/chun-chat', { useNewUrlParser: true });

const db = mongoose.connection;

db.on('error', err => console.error('connection error:', err));
db.once('open', () => console.log('mongodb connected'));

module.exports = db;
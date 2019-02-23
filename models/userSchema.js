const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  mobile: {
    type: String,
    trim: true
  },
  gender: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    required: true
  },
  password: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    trim: true,
    default: ''
  },
  friends: [
    {
      type: Schema.Types.ObjectId, ref: 'User'
    }
  ],
  chatRooms: [
    {
      type: Schema.Types.ObjectId, ref: 'Chat'
    }
  ],
  sentFriendRequests: [
    {
      type: Schema.Types.ObjectId, ref: 'User'
    }
  ],
  incomingFriendRequests: [
    {
      type: Schema.Types.ObjectId, ref: 'User'
    }
  ],
});

module.exports = userSchema;
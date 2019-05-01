const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const models = require('../models');
const userSchema = models.userSchema;

userSchema.statics.uniqueUsername = function(username) {
  return this.findOne({ username: username }).exec();
}

userSchema.statics.uniqueEmail = function(email) {
return this.findOne({ email: email }).exec();
}

userSchema.methods.createUser = async function() {
  try {
      let hash = await bcrypt.hash(this.password, 10);
      this.password = hash;
      this.save();
  } catch(err) {
      console.log(err);
  }
}

userSchema.statics.getUserByUsername = function(username) {
  return this.findOne({username}).exec();
}

userSchema.statics.searchUsersByUsername = function(username) {
  return this.find({username: {$regex: username, $options: 'i'}},'_id username avatar status').exec();
}

userSchema.statics.getUserById = function(id) {
  return this.findById(id, '-password').populate('friends', 'username gender email mobile avatar status')
             .populate('incomingFriendRequests', '_id username gender avatar').exec();
}

userSchema.statics.getUserInfoById = function(id) {
  return this.findById(id, '-password').populate('friends', 'username gender email avatar').exec();
}

userSchema.statics.comparePassword = function(providedPassword, hash) {
  return bcrypt.compare(providedPassword, hash);
}

userSchema.statics.updateAvatar = function(id, newAvatar) {
  return this.findByIdAndUpdate(id, { $set: {avatar: newAvatar}}, {new: true, select: 'avatar'}).exec();
}

userSchema.statics.updateStatus = function(id, newStatus) {
  return this.findByIdAndUpdate(id, { $set: {status: newStatus}}, {new: true, select: 'status'}).exec();
}

userSchema.statics.getFriendsList = function(id) {
  return this.findById(id).populate('friends', 'username gender email mobile avatar status').exec();
}

userSchema.statics.addFriend = function(id, fid) {
  return this.findByIdAndUpdate(id, {$addToSet:{friends: fid}}, {new: true, select: 'friends'}).populate('friends', '_id username gender email mobile status avatar').exec();
}

userSchema.statics.addChatRoom = function(id, chatRoomId, callback) {
  return this.findByIdAndUpdate(id, {$addToSet:{chatRooms: chatRoomId}}, callback);
}

userSchema.statics.sentFriendRequest = function(id, fid) {
  return this.findByIdAndUpdate(id, {$addToSet:{sentFriendRequests: fid}}, {new: true}).exec();
}

userSchema.statics.incomingFriendRequest = function(fid, id) {
  return this.findByIdAndUpdate(fid, {$addToSet:{incomingFriendRequests: id}}, {new: true, select: 'incomingFriendRequests'}).populate('incomingFriendRequests', '_id username gender avatar').exec();
}

userSchema.statics.removeIncomingFriendRequest = function(id, fid) {
  return this.findByIdAndUpdate(id, { $pullAll: {incomingFriendRequests: [fid] } }, {new: true, select: 'incomingFriendRequests'}).populate('incomingFriendRequests', '_id username gender avatar').exec();
}

userSchema.statics.removeSentFriendRequest = function(fid, id) {
  return this.findByIdAndUpdate(fid, { $pullAll: {sentFriendRequests: [id] } }, {new: true}).exec();
}

userSchema.methods.generateJwt = function() {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 7);
  
  return jwt.sign({
    _id: this._id,
    exp: parseInt(expiry.getTime() / 1000),
  }, "junlinguoisthebest"); // DO NOT KEEP YOUR SECRET IN THE CODE!
};

const User = mongoose.model('User', userSchema);

module.exports = User;
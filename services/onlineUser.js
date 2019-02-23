const mongoose = require('mongoose');
const models = require('../models');
const onlineUserSchema = models.onlineUserSchema;

onlineUserSchema.statics.checkOnline = function(id) {
    return this.findOne({user: id}).exec();
}

onlineUserSchema.methods.online = function() {
    return this.save();
}

onlineUserSchema.statics.offline = function(id) {
    return this.findOneAndRemove({user: id}).exec();
}

const OnlineUser = mongoose.model('OnlineUser', onlineUserSchema);

module.exports = OnlineUser;
const mongoose = require('mongoose');
const models = require('../models');
const chatRoomSchema = models.chatRoomSchema;


chatRoomSchema.statics.getChatRooms = function(id) {
    return this.find({owner: id}).slice('messages', [-15, 15]).populate('recipient', '_id username gender email mobile avatar status').exec();
}

chatRoomSchema.statics.findChatRoom = function(id, fid) {
    return this.findOne({owner: id, recipient: fid}).exec();
}

chatRoomSchema.statics.createChatRoom = function(id, fid) {
    const options =  {
        upsert: true, 
        new: true, 
        setDefaultsOnInsert: true
    };
    return this.findOneAndUpdate({owner: id, recipient: fid}, {}, options).populate('recipient', '_id username gender email mobile avatar status').exec();
}

chatRoomSchema.statics.insertMessage = function(id, fid, message) {
    const options =  {
        upsert: true, 
        new: true, 
        setDefaultsOnInsert: true
    };
    return this.findOneAndUpdate({owner: id, recipient: fid}, { $push: { messages: message } }, options).populate('recipient', '_id username gender email mobile avatar status').exec();
}

chatRoomSchema.statics.deleteChatRoom = function(id) {
    return this.findByIdAndRemove(id).exec();
}

chatRoomSchema.statics.getOldMessages = async function(chatRoomId, startIndex) {
    const oldMessages = await this.findById(chatRoomId).select('messages').exec();
    const numOfRestMessages = oldMessages.messages.length - startIndex;
    if(numOfRestMessages < 15) {
        return { oldMessages: oldMessages.messages.slice(0, numOfRestMessages), isLast: true };
    } else {
        return { oldMessages: oldMessages.messages.slice(numOfRestMessages-15, numOfRestMessages), isLast: false };
    }
}

const ChatRoom = mongoose.model('Chat', chatRoomSchema);

module.exports = ChatRoom;
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const chatRoomSchema = new Schema({
    owner:{
        type: Schema.Types.ObjectId, ref: 'User'
    },
    recipient: {
        type: Schema.Types.ObjectId, ref: 'User'
    },
    messages: [{
        sender: {
            type: Schema.Types.ObjectId, ref: 'User'
        },
        receiver: {
            type: Schema.Types.ObjectId, ref: 'User'
        },
        body: String,
        delivered: {
            type: Boolean,
            default: false
        },
        read: {
            type: Boolean,
            default: false
        },
        time: {
            type: Date,
            default: Date.now
        }
    }]
});

module.exports = chatRoomSchema;
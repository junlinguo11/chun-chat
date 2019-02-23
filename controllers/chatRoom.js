const ChatRoom = require('../services').ChatRoom;

exports.getChatRooms = async (req, res, next) => {
    try {
        let chatRooms = await ChatRoom.getChatRooms(req.payload._id);
        chatRooms.sort((a,b) => {
            if(a.messages.length && b.messages.length) {
                return new Date(b.messages[b.messages.length - 1].time) - new Date(a.messages[a.messages.length - 1].time); 
            } 
        })
        res.json({chatRooms: chatRooms});
    } catch(err) {
        next(err);
    }
}

exports.getOldMessages = async (req, res, next) => {
    try {
        let result = await ChatRoom.getOldMessages(req.query.id, req.query.hasMsg);
        res.json({oldMessages: result.oldMessages, isLast: result.isLast});
    } catch(err) {
        next(err);
    }
}

exports.deleteChatRoom = async (req, res, next) => {
    try{
        let removedChatRoom = await ChatRoom.deleteChatRoom(req.params.id);
        if(removedChatRoom) {
            res.json({isSuccess: true, removedChatRoom: removedChatRoom._id});
        }
    } catch(err) {
        next(err);
    }
}
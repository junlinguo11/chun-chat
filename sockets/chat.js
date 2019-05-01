const User = require('../services').User;
const ChatRoom = require('../services').ChatRoom;
const OnlineUser = require('../services').OnlineUser;

module.exports = function(io){
    const onlineList = [];
    io.on('connection', (socket) => {
        let onlineConnection;
        console.log('a user connected');
        socket.on('online', async function(uid) {
            onlineConnection = uid;
            try{
                let existUser = await OnlineUser.checkOnline(uid);
                if(!existUser) {
                    const onlineUser = new OnlineUser({user: uid});
                    onlineUser.online();
                }
                socket.join(uid);
                if ( onlineList.indexOf(uid) === -1) {
                    onlineList.push(uid);
                }
                console.log(uid + ' online...');
            } catch(err) {
                console.log(err);
            }
        });

        socket.on('startChat', async function(uid, fid) {
            try{
                let chatRoom = await ChatRoom.createChatRoom(uid, fid);
                io.to(uid).emit('startChat', chatRoom);
                ChatRoom.createChatRoom(fid, uid);
            } catch(err) {
                console.log(err);
            }

        });

        socket.on('typing', function(uid, fid, isTyping) {
            io.to(fid).emit('typing', {uid, isTyping});
        });

        socket.on('message', async function(message){
            try{
                ChatRoom.insertMessage(message.sender, message.receiver, message);
                let chatRoom = await ChatRoom.findChatRoom(message.receiver, message.sender);
                let newChatRoom = await ChatRoom.insertMessage(message.receiver, message.sender, message);
                let isOnline = await OnlineUser.checkOnline(message.receiver);
                if(isOnline){
                    if(!chatRoom || chatRoom.messages.length === 0) {
                        io.to(message.receiver).emit('messageInNewChatRoom', newChatRoom);
                    } else {
                        io.to(message.receiver).emit('message', getLastestMessage(newChatRoom));
                    }
                }
            } catch(err) {
                console.log(err);
            }
        });

        socket.on('friendRequest', async function(request){
            try{
                let sentFriendRequest = await User.sentFriendRequest(request.uid, request.fid);
                let incomingFriendRequests = await User.incomingFriendRequest(request.fid, request.uid);
                io.to(request.uid).emit('sentFriendRequest', request.fid);
                io.to(request.fid).emit('incomingFriendRequest', incomingFriendRequests);
            } catch(err) {
                console.log(err);
            }
        });

        socket.on('agreeAddFriend', async function(request) {
            try{
                let userUpdates = await Promise.all([
                    User.addFriend(request.uid, request.fid),
                    User.removeIncomingFriendRequest(request.uid, request.fid)
                ]);
                io.to(request.uid).emit('addFriend', {updatedFriendsList: userUpdates[0], updatedIncomingFriendRequestList: userUpdates[1]});
                let friendUpdates = await Promise.all([
                    User.addFriend(request.fid, request.uid),
                    User.removeSentFriendRequest(request.fid, request.uid)
                ])
                let isOnline = await OnlineUser.checkOnline(request.fid);
                if(isOnline) {
                    io.to(request.fid).emit('agreeAddFriend', {friendUpdatedFriendsList: friendUpdates[0], updatedSendFriendRequestList: friendUpdates[1]});
                }
            } catch(err) {
                console.log(err);
            }
        });

        socket.on('refuseAddFriend', function(request) {
            User.removeIncomingFriendRequest(request.uid, request.fid, (err, updatedIncomingFriendRequestList) => {
                if(err) console.log(err);
                io.to(request.uid).emit('refuseAddFriend', updatedIncomingFriendRequestList);
            });
        });

        socket.on('videoOffer', async (request) => {
            const sender = await User.getUserInfoById(request.sender);

            io.to(request.receiver).emit('videoOffer', {
                sender,
                sdp: request.sdp,
            });
        });

        socket.on('videoAnswer', async (answer) => {
            const sender = await User.getUserInfoById(answer.sender);

            io.to(answer.receiver).emit('videoAnswer', {
                sender,
                sdp: answer.sdp,
            });
        });

        socket.on('iceCandidate', (request) => {
            io.to(request.receiver).emit('iceCandidate', {
                candidate: request.candidate,
            });
        });

        socket.on('disconnect', function(){
            if ( onlineList.indexOf(onlineConnection) !== -1) {
                onlineList.splice(onlineList.indexOf(onlineConnection),1);
                OnlineUser.offline(onlineConnection, (err, offlineUser) => {
                    if(err) next(err);
                    socket.leave(onlineConnection);
                    console.log(onlineConnection + ' offline...');
                })
            }
        });
    });
}

function getLastestMessage(chatRoom) {
    return chatRoom.messages[chatRoom.messages.length - 1];
}
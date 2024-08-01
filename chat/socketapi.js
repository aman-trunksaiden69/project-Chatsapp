const userModel = require('./routes/users');
const msgModel = require('./routes/msg');
const io = require("socket.io")();
const socketapi = {
    io: io
};

// Add your socket.io logic here!
io.on("connection", function (socket) {
    // console.log(socket.id)
    // io.to(socket.id).emit('sony', "hello from server")

    socket.on('join-server', async username => {
        const currentUser = await userModel.findOne({username: username})

        if (!currentUser) {
            console.error('User not found:', username);
            return;
        }

        const onlineUsers = await userModel.find({
            socketId: { $nin: [ "" ] },
            username: { $nin: [ currentUser.username ] }
        })

        onlineUsers.forEach(onlineUser => {
            socket.emit('newUserJoined', {
                img: onlineUser.img,
                username: onlineUser.username,
                lastMessage: 'hello everyone!',
                id: onlineUser._id
            })
        });

        socket.broadcast.emit('newUserJoined', {
            img: currentUser.img,
            username: currentUser.username,
            lastMessage: 'hello everyone!',
            id: currentUser._id
        })

        currentUser.socketId = socket.id
        await currentUser.save()
    });

    socket.on('disconnect', async () => {
        await userModel.findOneAndUpdate(
            {socketId: socket.id}, 
            {socketId: ''}
        );
    });

    socket.on("privateMessage", async (msgObject) =>{
        
        await msgModel.create({
            actualMessage: msgObject.msg,
            sender: msgObject.sender,
            receiver: msgObject.receiver
        });

        const toUser = await userModel.findById(msgObject.receiver)

        if (!toUser || !toUser.socketId) {  // Added null check
            console.error('Recipient user or socketId not found:', msgObject.receiver);
            return;
        }

        io.to(toUser.socketId).emit('receivePrivateMessage', msgObject)
    });
    
    socket.on('getPrivateMessage', async (users) => {
        const allMessages = await msgModel.find(

            {
                $or: [
                    {
                        sender: users.receiver /* b */,
                        receiver: users.sender/* a */,
                    },
                    {
                        receiver: users.receiver /* b */,
                        sender: users.sender/* a */,
                    }
                ]
            }

        )

        socket.emit('getChatMessages', allMessages)

    })

    console.log("A user connected");
});
// end of socket.io logic

module.exports = socketapi;
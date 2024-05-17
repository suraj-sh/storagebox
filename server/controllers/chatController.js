const Chat = require('../model/Chat');

const saveChatMessage = async (io, socket, { sender, receiver, storage, content }) => {
    try {
        if (!sender || !receiver || !storage || !content) {
            return res.status(401).json({ message: 'Missing required feilds' })
        };

        const newChat = new Chat({
            sender,
            receiver,
            storage,
            content
        });
        const savedChat = await newChat.save();

        io.to(sender).emit('privatrMessage', savedChat);
        io.to(receiver).emit('privateMessage', savedChat);
        return res(200).json({ message: "chat message saved and sent sucessfully" });
    } catch (error) {
        console.error('Error saving chat:', error);
        return res(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = {
    saveChatMessage,
};
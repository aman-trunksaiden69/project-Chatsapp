const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
    actualMessage: String,
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
})

module.exports = mongoose.model("message", messageSchema)

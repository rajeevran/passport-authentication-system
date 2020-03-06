var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var chatschema = new Schema({

    to_user: {
        type:  mongoose.Schema.Types.ObjectId,
        required: false
    },
    from_user: {
        type:  mongoose.Schema.Types.ObjectId,
        required: false
    },
    message: {
        type: String,
        required: false
    },
    channelId: {
        type: String,
        required: false
    }

}, {
    timestamps: true
});
module.exports = mongoose.model('Chat', chatschema);
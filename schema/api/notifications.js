var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var Schema = mongoose.Schema;
var Notoficationschema = new Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    notificationUserType: {
        type: String
    },
    notificationFor: {
        type: String,
        enum: ['user', 'team_member'],
        default: 'user'
    },
    message: [ {type: mongoose.Schema.Types.ObjectId, required: false } ],
    readStatus: {
        type: String,
        enum: ['yes', 'no'],
        default: 'no'
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('Notification', Notoficationschema);
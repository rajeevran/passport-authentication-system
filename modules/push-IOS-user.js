var apn = require('apn');
var configDriver = require('./config').driverProduction;
var configUser = require('./config').userProduction;
var ritoPassengerPush = new apn.Provider({
    cert: __dirname + configUser.USER_APN_CERTI,
    key: __dirname + configUser.USER_APN_KEY,
    production: true
});

var ritoDriverPush = new apn.Provider({
    cert: __dirname + configDriver.DRIVER_APN_CERTI,
    key: __dirname + configDriver.DRIVER_APN_KEY,
    production: true
});

var pushNotificationServiceUser = {

    pushIosUser: function(data, callback){
        var all_data={'all_data':data};
        var note = new apn.Notification();
        note.alert = data.msg;
        note.payload = all_data;
        note.badge=1;
        note.sound="default";
        note.topic = "com.app.RitoRideSharingAppPassenger";
        ritoPassengerPush.send(note, data.deviceId).then(result => {
            callback({
                result: result
            })
        });
    },
    pushIosDriver: function(data, callback){
        var all_data={'all_data':data};
        var note = new apn.Notification();
        note.alert = data.msg;
        note.payload = all_data;
        note.badge=1;
        note.sound="default";
        note.topic = "com.app.RitoRideSharingAppDriver";
        ritoDriverPush.send(note, data.deviceId).then(result => {
            callback({
                result: result
            })
        });
    }
}
module.exports = pushNotificationServiceUser;
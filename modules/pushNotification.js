var apn = require('apn');
var FCM = require('fcm-push');
var path = require('path');
var config = require('./config')('production');
//=====================APN=================================
var madlyFrnd = new apn.Provider({
    cert: __dirname + config.DRIVER_APN_CERTI,
    key: __dirname + config.DRIVER_APN_KEY,
    production: true
});
var apnOne = new apn.Provider({
    cert: __dirname + config.DRIVER_APN_CERTI,
    key: __dirname + config.DRIVER_APN_KEY,
    production: true
});
//====================APN=================================
//====================FCM SETUP FOR PUSH NOTIFICATION=================
var serverKey = config.FCM_SERVER_KEY;
var fcm = new FCM(serverKey);
//====================FCM SETUP FOR PUSH NOTIFICATION=================

var pushNotificationService = {
    iosPush: function(iosDriverData, callback) {
        var note = new apn.Notification();
        note.alert = iosDriverData.from;
        //note.payload = iosDriverData;
        
        apnOne.send(note, iosDriverData.deviceId).then(result => {
            console.log(result.failed);
            callback({
                result: result
            })
        });
    },
    iosPushPushFrined: function (iosDriverData, callback) {
        var all_data={'all_data':iosDriverData};
        var note = new apn.Notification();
        note.alert = iosDriverData.msg;
        note.payload = all_data;
        note.badge=1;
        note.sound="default";
        note.topic = "com.RobRoe.MadlyRad";
        madlyFrnd.send(note, iosDriverData.deviceId).then(result => {
            callback({
                result: result
            })
        });
    },
    androidPushFrined: function (androidData, callback) {
        var message = {
            to: androidData.deviceId, // required fill with device token or topics
            collapse_key: 'demo',
            data: {
                rawData: androidData,
                title: androidData.title,
                user_id: androidData.user_id,
                friend_name: androidData.friend_name
            }

        };
        fcm.send(message)
            .then(function (response) {
                console.log("Successfully sent with response: ", response);
                callback({
                    success: true,
                    result: response
                })
            })
            .catch(function (err) {
                console.log("Something has gone wrong!");
                console.error(err);
                callback({
                    success: false,
                    result: err
                })
            })
    },
    adminPush: function (adminPushData, callback) {
        if (adminPushData.notificationData.user_type == "passenger") {
            var adminNote = new apn.Notification();
            adminNote.alert = adminPushData.notificationData.alert;
            adminNote.payload = adminPushData.notificationData;
            passenger.send(adminNote, adminPushData.array.iosArray).then(result => {
                console.log("sent:", result.sent.length);
                console.log("failed:", result.failed.length);
                console.log(result.failed);
            });
            adminPushData.array.androidArray.forEach(function (v, i) {
                pushNotificationService.androidPushPasenger({
                    deviceId: v,
                    alert: "adminAlert",
                    body: adminPushData.notificationData
                }, function (adminPushDataRes) {
                })
            });
            callback({
                success: true,
                STATUSCODE: 2000,
                message: "Push notification send for passenger."
            })
        }
        if (adminPushData.notificationData.user_type == "driver") {
            var adminNote = new apn.Notification();
            adminNote.alert = adminPushData.notificationData.alert;
            adminNote.payload = adminPushData.notificationData;
            driver.send(adminNote, adminPushData.array.iosArray).then(result => {
                console.log("sent:", result.sent.length);
                console.log("failed:", result.failed.length);
                console.log(result.failed);

            });
            adminPushData.array.androidArray.forEach(function (v, i) {
                pushNotificationService.androidPushPasenger({
                    deviceId: v,
                    alert: "adminAlert",
                    body: adminPushData.notificationData
                }, function (adminPushDataRes) {
                })
            });
             callback({
                success: true,
                STATUSCODE: 2000,
                message: "Push notification send for driver."
            })
        }
    }


};


module.exports = pushNotificationService;
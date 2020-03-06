var config = require('../../config');
var async = require("async");
var mongo = require('mongodb');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt-nodejs');
var ObjectID = mongo.ObjectID;
var randomize = require('randomatic');
var mongoose = require('mongoose');

var Admin = require('../../schema/api/admin');
var UserSchema = require('../../schema/api/user');
var NotificationsSchema = require('../../schema/api/notifications');

//======================MONGO MODELS============================
var CommonModel = require('../../models/api/apiCommonModel');
// var VehicleType = require('../../models/');
var mailProperty = require('../../modules/sendMail');
var secretKey = config.secretKey;

var common = {
    jwtAuthVerification: (jwtData, callback) => {
        
        if (jwtData["x-access-token"]) {
            CommonModel.authenticate(jwtData, function (auth) {
                callback(auth);
            })
        } else {
            callback({
                success: false,
                STATUSCODE: 4200,
                message: "token missing",
                response: {}
            })
        }
    },
   
    adminSignup: function (adminData, callback) {
        if (!adminData.email) {
            callback({
                success: false,
                message: "please enter email"
            });
        }
        if (!adminData.password) {
            callback({
                success: false,
                message: "please enter password"
            });
        }
        if (!adminData.name) {
            callback({
                success: false,
                message: "please enter name"
            });
        }
        
        async.waterfall([
            function (nextcb) {       //checking email existance
                var cError1 = "";
                Admin.findOne({ email: adminData.email }, function (err, admindet) {
                    if (err)
                        nextcb(err);
                    else {
                        if (admindet) {
                            cError1 = "email already taken";
                        }
                        nextcb(null, cError1);
                    }
                });
            },
            function (cError1, nextcb) {    //updating admin's data
                if (cError1) {
                    nextcb(null, cError1);
                } else {
                    var admin = new Admin(adminData);
                    admin.save(function (err) {
                        if (err) {
                            nextcb(err);
                        } else {
                            nextcb(null, cError1);
                        }
                    });
                }
            }

        ], function (err, cError) {
            if (err) {
                callback({ success: false, message: "some internal error has occurred", err: err });
            } else if (cError != "") {
                callback({ success: false, message: cError });
            } else {
                callback({ success: true, message: "Admin saved successfully" })
            }
        });
    },
    adminLogin: function (adminData, callback) {
        console.log("data",adminData); 
        var id = "0";
        if (adminData.email && adminData.password) {

            Admin.findOne({ email: adminData.email })
                .select('password name companyName permission authtoken blockStatus userType')
                .lean(true)
                .then(function (loginRes) {
                    console.log("loginRes",loginRes);
                    
                    if (!loginRes) {
                        callback({
                            success: false,
                            STATUSCODE: 4000,
                            message: "User doesn't exist",
                            response: {}
                        });
                    } else {
                        //if (!loginRes.comparePassword(adminData.password)) {
                        var c = bcrypt.compareSync(adminData.password, loginRes.password);
                        console.log("compare",c);
                        
                        if (!c){

                            callback({
                                success: false,
                                STATUSCODE: 4000,
                                message: "User name or password is wrong",
                                response: {}
                            });
                        } else {
                            var token = jwt.sign({
                                email: adminData.email,
                                adminId: loginRes._id,
                                userType: loginRes.userType
                            }, config.secretKey, { expiresIn: '12h' });

                            Admin.update({
                                _id: loginRes._id
                            }, {
                                $set: {
                                    authtoken: token
                                }
                            }, function (err, resUpdate) {
                                if (err) {
                                    
                                } else {
                                    callback({
                                        success: true,
                                        STATUSCODE: 2000,
                                        message: "Login success",
                                        response: {
                                            email: adminData.email,
                                            token: token,
                                            //"id": loginRes._id,
                                            "userType": loginRes.userType,
                                            "permission": loginRes.permission,
                                            "name": loginRes.name,
                                            "companyName": loginRes.companyName,
                                            "profileImage": loginRes.profileImage,
                                            "blockStatus": loginRes.blockStatus
                                        }
                                    })
                                }
                            });
                           
                        }
                    }

                });
        } else {
            callback({
                success: false,
                STATUSCODE: 5000,
                message: "Insufficient information provided for user login",
                response: {}
            });
        }
    },


//#region user login

userLogin: function (userData, callback) {
    console.log("data",userData); 
    var id = "0";
    if (userData.email && userData.password) {

        UserSchema.findOne(
            {
                email: String(userData.email).toLowerCase(),
                isEmailVerified: true
            }
            )
            .select('password fullname permission authtoken')
            .lean(true)
            .then(function (loginRes) {
                console.log("loginRes",loginRes);
                
                if (!loginRes) {
                    callback({
                        success: false,
                        STATUSCODE: 4002,
                        message: "Either User doesn't exist or Email is not Verified",
                        response: {}
                    });
                } else {
                    //if (!loginRes.comparePassword(userData.password)) {
                        console.log('userData.password-->',userData.password)
                        console.log('loginRes.password-->',loginRes.password)
                    var c = bcrypt.compareSync(userData.password, loginRes.password);
                    console.log("compare",c);
                    
                    if (!c){

                        callback({
                            success: false,
                            STATUSCODE: 4002,
                            message: "User name or password is wrong",
                            response: {}
                        });
                    } else {
                        var token = jwt.sign({
                            email: String(userData.email).toLowerCase(),
                            userId: loginRes._id,
                            userType: loginRes.userType
                        }, config.secretKey, { expiresIn: '12h' });

                        UserSchema.update({
                            _id: loginRes._id
                        }, {
                            $set: {
                                authtoken: token
                            }
                        }, function (err, resUpdate) {
                            if (err) {
                                
                            } else {
                                callback({
                                    success: true,
                                    STATUSCODE: 2000,
                                    message: "Login success",
                                    response: {

                                        email: String(userData.email).toLowerCase(),
                                        authtoken: token,
                                        "_id": loginRes._id,
                                        "permission": loginRes.permission,
                                        "name": loginRes.fullname,
                                        "profileImage": loginRes.profileImage,
                                    }
                                })
                            }
                        });
                       
                    }
                }

            });
    } else {
        callback({
            success: false,
            STATUSCODE: 5000,
            message: "Insufficient information provided for user login",
            response: {}
        });
    }
},

//#endregion user login

    //User Change password
    changePassword: async (data, token, callback) => {

        console.log(token)
        if(!token)
        {
                callback({
                    success: false,
                    STATUSCODE: 4200,
                    message: "token missing",
                    response: {}
                }) 
        }else{

    
            //====JWT Token verification
            var decoded = await jwt.verify(token, secretKey);

            console.log('decoded---->',decoded)
            data.userId = decoded.userId

            if (decoded != null) {

             var userDetails = await UserSchema.findOne({_id: decoded.userId},{email:1,password:1})
             data.email = String(userDetails.email).toLowerCase()
             console.log('userDetails---->',userDetails)



            if (!data.currentPassword || typeof data.currentPassword === undefined) {
                callback({ 
                    success: false,
                    STATUSCODE: 5002,
                    message: "please provide Current Password ",
                    response: {}
                    });
            }else  if (!data.newPassword || typeof data.newPassword === undefined) {
                callback({ 
                    success: false,
                    STATUSCODE: 5002,
                    message: "please provide New Password ",
                    response: {}
                    });

            } else {
                console.log('data.newPassword',data.newPassword)
                console.log('userDetails.password',userDetails.password)
                var c = bcrypt.compareSync(data.currentPassword, userDetails.password);
                console.log("compare",c);
                if(!c)
                {
                callback({ 
                    success: false,
                    STATUSCODE: 5002,
                    message: "Current Password Not Matched",
                    response: {}
                    });
                }else{
                //data.password = randomize('*', 6);
                CommonModel.changepassword(data, function (result) {
                    mailProperty('forgotPasswordMail')(data.email, {
                        password: data.newPassword,
                        email: data.email,
                        name: result.response.fullname,
                        date: new Date(),
                        logo: config.liveUrl + '' + config.siteConfig.LOGO,
                        site_color: config.siteConfig.SITECOLOR,
                        site_name: config.siteConfig.SITENAME
                    }).send();
                    callback({ 
                        success: true,
                        STATUSCODE: result.STATUSCODE,
                        message: result.message,
                        response: {}
                    });
                });
            }
            }
        }else{
            callback({ 
                success: false,
                STATUSCODE: 5002,
                message: "Invalid Auth Token ",
                response: {}
                });
        }
        }


    },

    //User forgot password
    forgotPassword: (data, callback) => {
        if (!data.email || typeof data.email === undefined) {
            callback({ 
                success: false,
                STATUSCODE: 5002,
                message: "Email Id Required ",
                response: {}
                });
            }else if (!data.password || typeof data.password === undefined) {
                callback({ 
                    success: false,
                    STATUSCODE: 5002,
                    message: "Password  Required ",
                    response: {}
                    });
                } else {
            //data.password = randomize('*', 6);
            CommonModel.forgotpassword(data, function (result) {
                mailProperty('forgotPasswordMail')(String(data.email).toLowerCase(), {
                    password: data.password,
                    email: String(data.email).toLowerCase(),
                    name: result.response.fullname,
                    date: new Date(),
                    logo: config.liveUrl + '' + config.siteConfig.LOGO,
                    site_color: config.siteConfig.SITECOLOR,
                    site_name: config.siteConfig.SITENAME
                }).send();
                callback({
                    success: true,
                    STATUSCODE: result.STATUSCODE,
                    message: result.message,
                    response: {}
                    });
            });
        }

    },

   // Social Login
   socialRegister: (data, callback) => {
    if (!data.email || typeof data.email === undefined) {
        callback({
            success: false,
            STATUSCODE: 5002,
            message: "email  Required ",
            response: {}
        });
    }else if (!data.socialLogin || typeof data.socialLogin === undefined) {
        callback({
            success: false,
            STATUSCODE: 5002,
            message: "socialLogin  Required ",
            response: {}
        });
        
    } else {
        data.email = String(data.email).toLowerCase();
        CommonModel.socialRegister(data, function (result) {
            callback(result);
        });
    }
},

//#region AboutUs

addAboutUsService: function (adminData, callback) {
    CommonModel.addAboutUsModel(adminData, function (res) {
        callback(res);
    })
    },
    listAboutUsService: function (adminData, callback) {
        CommonModel.listAboutUsModel(adminData, function (res) {
            callback(res);
        })
    },
    editAboutUsService: function (adminData, callback) {
        CommonModel.editAboutUsModel(adminData, function (res) {
            callback(res);
        })
    },
    deleteAboutUsService: function (adminData, callback) {
        CommonModel.deleteAboutUsModel(adminData, function (res) {
            callback(res);
        })
    },    
    getAllAboutUsService: function (adminData, callback) {
        CommonModel.getAllAboutUsModel(adminData, function (res) {
            callback(res);
        })
    },

//#endregion AboutUs

//#region User


    addUserService: function (adminData, callback) {
    CommonModel.addUserModel(adminData, function (res) {
        callback(res);
    })
    },


    chatService: function (adminData, callback) {
        CommonModel.chatProcess(adminData, function (res) {
            callback(res);
        })
        },
    
    listUserService: function (adminData, callback) {
        CommonModel.listUserModel(adminData, function (res) {
            callback(res);
        })
    },

    //Edit Profile Image
    uploadUserImageService: (data, fileData, callback) => {

        if (!data._id || typeof data._id === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide user id",
                "response_data": {}
            });
        } else if (!fileData || typeof fileData === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide profile image",
                "response_data": {}
            });
        } else {

            var imageFile = fileData.profileImage;
            var timeStamp = Date.now();
            var fileName = timeStamp + imageFile.name;
            var folderpath = config.uploadUserPath;
            let profilepicPath = config.userPath;
            let split = imageFile
                .mimetype
                .split("/");
            if (split[1] = "jpeg" || "png" || "jpg") {
                imageFile.mv(
                    folderpath + fileName,
                    function (err) {

                        if (err) {
                            callback({
                                "response_code": 5005,
                                "response_message": "INTERNAL DB ERROR",
                                "response_data": err
                            });
                        } else {
                            data.profileImage = profilepicPath + fileName;
                            CommonModel.uploadUserImageModel(data, function (result) {
                                callback(result);
                            });
                        }

                    }
                )
            } else {
                callback({
                    status: 5002,
                    message: "MIME type not allowed please upload jpg or png file"
                })
            }


        }
    },

    // uploadUserImageService: function (data,fileData, callback) {

    //     var pic = fileData.profileImage;
    //     var ext = pic.name.slice(pic.name.lastIndexOf('.'));
    //     var fileName = Date.now() + ext;
    //     var folderpath = config.uploadUserPath;

    //     if(!data._id)
    //     {
    //         callback({
    //             success: false,
    //             STATUSCODE: 4200,
    //             message: "Please provide user id",
    //             response: {}
    //         });
    //     }

    //     pic.mv(folderpath + fileName, function (err) {
    //         if (err) {
    //             callback({
    //                 "success": false,
    //                 "STATUSCODE": 5005,
    //                 "message": "INTERNAL DB ERROR",
    //                 "response": err
    //             })
    //         } else {
    //             //data._id = new ObjectID;
    //             if(data.profileImage == (config.userPath + fileName) )
    //             {

    //             }else{
    //                 data.profileImage = config.userPath + fileName;
    //             }
    //             data= {...data,fileData:fileData}

    //             CommonModel.uploadUserImageModel(data, function (result) {
    //                 callback(result)
    //             });
    //         }
    //     });

    // },

    editUserService: function (data,fileData, callback) {

        console.log('fileData-->',fileData)
        if (fileData === undefined || fileData === null ) {
            console.log('fileData is null-->')
            data= {...data,fileData:fileData}
          //  data.profileImage = data.profileImage//.replace(/,/g, '');
          CommonModel.editUserModel(data, function (result) {
            callback(result)
        });
        }else{

            var pic = fileData.profileImage;

            var ext = pic.name.slice(pic.name.lastIndexOf('.'));
            var fileName = Date.now() + ext;
            var folderpath = config.uploadUserPath;
            pic.mv(folderpath + fileName, function (err) {
                if (err) {
                    callback({
                        "success": false,
                        "STATUSCODE": 5005,
                        "message": "INTERNAL DB ERROR",
                        "response": err
                    })
                } else {
                    //data._id = new ObjectID;
                    if(data.profileImage == (config.userPath + fileName) )
                    {

                    }else{
                        data.profileImage = config.userPath + fileName;
                    }
                    data= {...data,fileData:fileData}

                    CommonModel.editUserModel(data, function (result) {
                        callback(result)
                    });
                }
            });
        }




    // CommonModel.editUserModel(adminData, function (res) {
    //     callback(res);
    // })
},
    deleteUserService: function (adminData, callback) {
        CommonModel.deleteUserModel(adminData, function (res) {
            callback(res);
        })
    },    
    getAllUserService: function (adminData, callback) {
        CommonModel.getAllUserModel(adminData, function (res) {
            callback(res);
        })
    },

//#endregion User

//#region Category


    addCategoryService: function (adminData, callback) {
    CommonModel.addCategoryModel(adminData, function (res) {
        callback(res);
    })
    },
    listCategoryService: function (adminData, callback) {
        CommonModel.listCategoryModel(adminData, function (res) {
            callback(res);
        })
    },
    editCategoryService: function (adminData, callback) {
        CommonModel.editCategoryModel(adminData, function (res) {
            callback(res);
        })
    },
    deleteCategoryService: function (adminData, callback) {
        CommonModel.deleteCategoryModel(adminData, function (res) {
            callback(res);
        })
    },    
    getAllCategoryService: function (adminData, callback) {
        CommonModel.getAllCategoryModel(adminData, function (res) {
            callback(res);
        })
    },

//#endregion Specialization



//#region Field


    addFieldService: function (adminData, callback) {
    CommonModel.addFieldModel(adminData, function (res) {
        callback(res);
    })
    },
    listFieldService: function (adminData, callback) {
        CommonModel.listFieldModel(adminData, function (res) {
            callback(res);
        })
    },
    editFieldService: function (adminData, callback) {
        CommonModel.editFieldModel(adminData, function (res) {
            callback(res);
        })
    },
    deleteFieldService: function (adminData, callback) {
        CommonModel.deleteFieldModel(adminData, function (res) {
            callback(res);
        })
    },    
    getAllFieldService: function (adminData, callback) {
        CommonModel.getAllFieldModel(adminData, function (res) {
            callback(res);
        })
    },

//#endregion Field

    //Verify Mail
    verifyEmail: (data, callback) => {
        if (!data.email || typeof data.email === undefined) {
            callback({
                success: false,
                STATUSCODE: 4000,
                message: "Please Provide Email ID ",
                response: {}
            });
        } else {
            data.email = String(data.email).toLowerCase();
            data.otp = Math.random().toString().replace('0.', '').substr(0, 4);
            CommonModel.verifyEmail(data, function (result) {
                console.log('result----->',result)

                callback({
                    success: true,
                    STATUSCODE: result.STATUSCODE,
                    message: result.message,
                    response: result.response
                });
                
            });
        }

    },


    verifyEmailOtpService: function (adminData, callback) {
        CommonModel.verifyEmailOtpModel(adminData, function (res) {
            callback(res);
        })
    },

    
    //Verify Changed Email
    verifyChangedEmail: (data, callback) => {
        if (!data.oldEmail || typeof data.oldEmail === undefined) {
            callback({
                success: false,
                STATUSCODE: 4000,
                message: "Please Provide Old Email ID ",
                response: {}
            });
        }else if (!data.newEmail || typeof data.newEmail === undefined) {
            callback({
                success: false,
                STATUSCODE: 4000,
                message: "Please Provide New Email ID ",
                response: {}
            });
        } else {
            data.oldEmail = String(data.oldEmail).toLowerCase();
            data.newEmail = String(data.newEmail).toLowerCase();
            data.otp = Math.random().toString().replace('0.', '').substr(0, 4);
            CommonModel.verifyChangedEmailModel(data, function (result) {

                callback(result);
                
            });
        }

    },

    
    addEditUserSpecialization: async (data, token, callback) => {

        console.log(token)
        if(!token)
        {
                callback({
                    success: false,
                    STATUSCODE: 4200,
                    message: "token missing",
                    response: {}
                }) 
        }else{

            //====JWT Token verification
            var decoded = await jwt.verify(token, secretKey);

            console.log('decoded---->',decoded)

            if (decoded != null) {

                //var notificationDetails = await NotificationSchema.findOne({userId: decoded.userId})
                data.userId = decoded.userId

               // console.log('notificationDetails---->',notificationDetails)

                if (!data.action || typeof data.action === undefined) {
                    callback({ 
                        success: false,
                        STATUSCODE: 5002,
                        message: "please provide action like add or delete ",
                        response: {}
                        });
                }else  if (!data.specialization || typeof data.specialization === undefined) {
                    callback({ 
                        success: false,
                        STATUSCODE: 5002,
                        message: "please provide specialization ",
                        response: {}
                        });

                } else {
                    let arrayMessage = []

                    if(data.action == 'add')
                    {
                        var userDetails = await UserSchema.findOne({_id: data.userId})

                      // console.log('userDetails.specialization--->',userDetails)//,userDetails.specialization)
                        if(userDetails.specialization !== undefined  || userDetails.specialization !== null){
                            arrayMessage = userDetails.specialization
                        }

                       for (let index = 0; index < JSON.parse(data.specialization).length; index++) {

                            const element = JSON.parse(data.specialization)[index];

                            arrayMessage = arrayMessage.filter(function(value) { return value != element; });
                            //console.log('element tyype--',typeof element.toString())
                            arrayMessage.push(mongoose.Types.ObjectId(element.toString()))

                        }
                        data.specialization = arrayMessage

                    }

                    if(data.action == 'delete')
                    {
                       var userDetails = await UserSchema.findOne({_id: data.userId})

                       if(userDetails.specialization !== undefined || userDetails.specialization !== null){
                        arrayMessage = userDetails.specialization
                       }
                    //console.log('JSON.parse(data.specialization)--',JSON.parse(data.specialization).length)

                       for (let index = 0; index < JSON.parse(data.specialization).length; index++) {
                           const element = JSON.parse(data.specialization)[index];

                           arrayMessage = arrayMessage.filter(function(value) { return value != element; });

                       }

                       data.specialization = arrayMessage


                    }
                    console.log('data.action',data.action)
                    console.log('data.specialization',data.specialization)
                    CommonModel.addEditUserSpecializationModel(data, function (result) {
                        
                        callback({ 
                            success: true,
                            STATUSCODE: result.STATUSCODE,
                            message: result.message,
                            response: result.response
                        });
                    });
                
                }
        }else{
            callback({ 
                success: false,
                STATUSCODE: 5002,
                message: "Invalid Auth Token ",
                response: {}
                });
        }
        }


    }, 

    
    addVideoCallService: async (data, token, callback) => {

        console.log(token)
        if(!token)
        {
                callback({
                    success: false,
                    STATUSCODE: 4200,
                    message: "token missing",
                    response: {}
                }) 
        }else{
            //====JWT Token verification
            var decoded = await jwt.verify(token, secretKey, function(err, decoded) {
                            if (err) {
                                callback({ 
                                    success: false,
                                    STATUSCODE: 4200,
                                    message: "Auth Token Expire",
                                    response: {error:err.message}
                                    });
                            }else{
                                return decoded
                            }
                        });
            console.log('typeof decoded outside---',typeof decoded)

            if (decoded !== undefined) {
                console.log('typeof decoded in---',typeof decoded)

                //var notificationDetails = await NotificationSchema.findOne({userId: decoded.userId})
                data.userId = decoded.userId

               // console.log('notificationDetails---->',notificationDetails)

                if (!data.talkTo || typeof data.talkTo === undefined) {
                    callback({ 
                        success: false,
                        STATUSCODE: 5002,
                        message: "please provide talkTo like p2p, p2g, e2p, e2g ",
                        response: {}
                        });
                }else  if (!data.specialization || typeof data.specialization === undefined) {
                    callback({ 
                        success: false,
                        STATUSCODE: 5002,
                        message: "please provide specialization ",
                        response: {}
                        });

                }else  if (!data.timeForTalking || typeof data.timeForTalking === undefined) {
                    callback({ 
                        success: false,
                        STATUSCODE: 5002,
                        message: "please provide timeForTalking ",
                        response: {}
                        });

                } else {

                    CommonModel.addVideoCallModel(data, function (result) {
                        
                        callback({ 
                            success: true,
                            STATUSCODE: result.STATUSCODE,
                            message: result.message,
                            totalData:result.totalData,
                            response: result.response
                        });
                    });
                
                }
        }else{
            callback({ 
                success: false,
                STATUSCODE: 5002,
                message: "Invalid Auth Token ",
                response: {}
                });
        }
        }


    },        


    addNotificationService: async (data, token, callback) => {

        console.log(token)
        if(!token)
        {
                callback({
                    success: false,
                    STATUSCODE: 4200,
                    message: "token missing",
                    response: {}
                }) 
        }else{

            //====JWT Token verification
            var decoded = await jwt.verify(token, secretKey);

            console.log('decoded---->',decoded)

            if (decoded != null) {

                //var notificationDetails = await NotificationSchema.findOne({userId: decoded.userId})
                data.userId = decoded.userId

               // console.log('notificationDetails---->',notificationDetails)

                if (!data.action || typeof data.action === undefined) {
                    callback({ 
                        success: false,
                        STATUSCODE: 5002,
                        message: "please provide action like add or delete ",
                        response: {}
                        });
                }else  if (!data.message || typeof data.message === undefined) {
                    callback({ 
                        success: false,
                        STATUSCODE: 5002,
                        message: "please provide notification message ",
                        response: {}
                        });
                        
                }else  if (!data.notificationUserType || typeof data.notificationUserType === undefined) {
                    callback({ 
                        success: false,
                        STATUSCODE: 5002,
                        message: "please provide notificationUserType ",
                        response: {}
                        });
                        
                } else {
                    let arrayMessage = []

                    if(data.action == 'add')
                    {
                        var notificationDetails = await NotificationsSchema.findOne({userId: data.userId})
                       
                        if(notificationDetails.message !== undefined || notificationDetails.message !== null){
                            arrayMessage = notificationDetails.message
                           }

                       for (let index = 0; index < JSON.parse(data.message).length; index++) {

                            const element = JSON.parse(data.message)[index];

                            arrayMessage = arrayMessage.filter(function(value) { return value != element; });
                            //console.log('element tyype--',typeof element.toString())
                            arrayMessage.push(mongoose.Types.ObjectId(element.toString()))

                        }
                        data.message = arrayMessage

                    }

                    if(data.action == 'delete')
                    {
                       var notificationDetails = await NotificationsSchema.findOne({userId: data.userId})

                       if(notificationDetails.message !== undefined || notificationDetails.message !== null){
                        arrayMessage = notificationDetails.message
                       }
                   //console.log('JSON.parse(data.message)--',JSON.parse(data.message).length)

                       for (let index = 0; index < JSON.parse(data.message).length; index++) {
                           const element = JSON.parse(data.message)[index];

                           arrayMessage = arrayMessage.filter(function(value) { return value != element; });

                       }

                       data.message = arrayMessage


                    }
                    console.log('data.action',data.action)
                    console.log('data.message',data.message)
                    CommonModel.addNotificationModel(data, function (result) {
                        
                        callback({ 
                            success: true,
                            STATUSCODE: result.STATUSCODE,
                            message: result.message,
                            response: result.response
                        });
                    });
                
                }
        }else{
            callback({ 
                success: false,
                STATUSCODE: 5002,
                message: "Invalid Auth Token ",
                response: {}
                });
        }
        }


    },        

    getTermsAndConditionsService: function (adminData, callback) {
        CommonModel.getTermsAndConditionsModel(adminData, function (res) {
            callback(res);
        })
    },
    editTermsAndConditionsService: function (adminData, callback) {
        CommonModel.editTermsAndConditionsModel(adminData, function (res) {
            callback(res);
        })
    },

}

module.exports = common;
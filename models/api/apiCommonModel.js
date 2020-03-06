
var AdminSchema = require('../../schema/api/admin');

var commonMethod = require("../../utility/common");
const fetch = require('node-fetch');


var AboutUsSchema = require('../../schema/api/aboutus');
var UserSchema = require('../../schema/api/user');
var FieldSchema = require('../../schema/api/field');
var CategorySchema = require('../../schema/api/category');
var NotificationsSchema = require('../../schema/api/notifications');


const moment = require('moment')


var TermSchema = require('../../schema/api/term');

var config = require('../../config');
var async = require("async");
var bcrypt = require('bcrypt-nodejs');
var mailProperty = require('../../modules/sendMail');

var jwt = require('jsonwebtoken');
var jwtOtp = require('jwt-otp');
var fs = require('fs');
var csvtojson = require("csvtojson");

var mongoose = require('mongoose');
var mongo = require('mongodb');

var FCM = require('fcm-node')
var fcmServerKey = config.FCM_SERVER_KEY;
const serverKey = fcmServerKey //put your server key here
const fcm = new FCM(serverKey);

var ObjectID = mongoose.Types.ObjectId;
var secretKey = config.secretKey;

//create auth token
createToken = (admin) => {
    var tokenData = {
        id: admin._id
    };
    var token = jwt.sign(tokenData, secretKey, {
        expiresIn: 86400
    });
    return token;
};

var commonModel = {
    authenticate: function (jwtData, callback) {
        if (jwtData["x-access-token"]) {
            jwt.verify(jwtData["x-access-token"], config.secretKey, function (err, decoded) {
                if (err) {
                    callback({
                        success: false,
                        STATUSCODE: 4200,
                        message: "Session timeout! Please login again.",
                        response: err
                    });
                } else {
                    callback({
                        success: true,
                        STATUSCODE: 2000,
                        message: "Authenticate successfully.",
                        response: decoded
                    });
                }
            });
        }
    },


//#region AboutUs

changepassword: function (data, callback) {
    console.log('data----',data)
    if (data.userId) {
        UserSchema.findOne({
            _id: data.userId
        }, {
            fullname: 1
        }, function (err, resDetails) {
            if (err) {
                callback({
                    success: false,
                    STATUSCODE: 5005,
                    message: "INTERNAL DB ERROR",
                    response: err
                });
            } else {
                if (resDetails == null) {
                    callback({
                        success: false,
                        STATUSCODE: 5002,
                        message: "User does not exist",
                        response: {}
                    });
                } else {
                    bcrypt.hash(data.newPassword, null, null, function (err, hash) {
                        if (err) {
                            callback({
                                success: false,
                                STATUSCODE: 5005,
                                message: "INTERNAL DB ERROR",
                                response: err
                            });
                        } else {
                            UserSchema.update({
                                _id: resDetails._id
                            }, {
                                $set: {
                                    password: hash
                                }
                            }, function (err, result) {
                                if (err) {
                                    callback({
                                        success: false,
                                        STATUSCODE: 5005,
                                        message: "INTERNAL DB ERROR",
                                        response: err
                                    });
                                } else {
                                    callback({
                                        success: true,
                                        STATUSCODE: 2000,
                                        message: "Password changed.Please check your registered email.",
                                        response: resDetails
                                    });
                                }
                            });
                        }
                    });

                }
            }
        });
    } else {
        callback({
            success: false,
            STATUSCODE: 5005,
            message: "User Id not provided",
            response: {}
        });
    }
},



forgotpassword: function (data, callback) {
    console.log('data----',data)

        UserSchema.findOne({
            email: data.email.toLowerCase()
        }, {
            fullname: 1
        }, function (err, resDetails) {
            if (err) {
                callback({
                    success: false,
                    STATUSCODE: 5005,
                    message: "INTERNAL DB ERROR",
                    response: err
                });
            } else {
                if (resDetails === null) {
                    callback({
                        success: false,
                        STATUSCODE: 5002,
                        message: "User does not exist",
                        response: {}
                    });
                } else {
                    bcrypt.hash(data.password, null, null, function (err, hash) {
                        if (err) {
                            callback({
                                success: false,
                                STATUSCODE: 5005,
                                message: "INTERNAL DB ERROR",
                                response: err
                            });
                        } else {
                            UserSchema.update({
                                _id: resDetails._id
                            }, {
                                $set: {
                                    password: hash
                                }
                            }, function (err, result) {
                                if (err) {
                                    callback({
                                        success: false,
                                        STATUSCODE: 5005,
                                        message: "INTERNAL DB ERROR",
                                        response: err
                                    });
                                } else {
                                    callback({
                                        success: true,
                                        STATUSCODE: 2000,
                                        message: "Password changed.Please check your registered email.",
                                        response: resDetails
                                    });
                                }
                            });
                        }
                    });

                }
            }
        });
    
},



addEditUserCategoryModel: async function (data, callback) {
                
    if (data) {


    var userDetails = await UserSchema.findOne({_id: data.userId})

    if(userDetails)
    {

        UserSchema.update({
            _id: data.userId
        }, {
            $set: {
                category: data.category
            }
        }, async function (err, result) {
            if (err) {
                callback({
                    success: false,
                    STATUSCODE: 5005,
                    message: "INTERNAL DB ERROR",
                    response: err
                });
            } else {
                var userDetail = await UserSchema.findOne({_id: data.userId})
                callback({
                    success: true,
                    STATUSCODE: 2000,
                    message: "Category Updated Successfully.",
                    response: userDetail
                });
            }
        });

    }else{
                callback({
                    success: false,
                    STATUSCODE: 4200,
                    message: "User  not Exist.",
                    response: {}
                });
            }
          

    }
},


addVideoCallModel: async function (data, callback) {
                
    if (data) {


//p2p, p2g, e2p, e2g
    if(data.talkTo == 'p2p' || data.talkTo == 'p2g')
    {
        data.talkTo = "1"
    }else if(data.talkTo == 'e2p' || data.talkTo == 'e2g')
    {
        data.talkTo = "2"
    }
    let searchFilters ={}

    if (data.talkTo) {
    searchFilters["userType"] = data.talkTo;
    }  

    if (data.category) {

    searchFilters["category"] = data.category ;
    }    


    var userDetails = await UserSchema.find(searchFilters)

    if(userDetails)
    {


                callback({
                    success: true,
                    STATUSCODE: 2000,
                    message: "List of users fetched Successfully.",
                    totalData: userDetails.length,
                    response: userDetails
                });
           

    }else{



                callback({
                    success: false,
                    STATUSCODE: 2000,
                    message: "Something Went Wrong.",
                    response: {}
                });
           
            }
          

    }
},

addNotificationModel: async function (data, callback) {
                
    if (data) {


    var notificationDetails = await NotificationsSchema.findOne({userId: data.userId})

    if(notificationDetails)
    {

        NotificationsSchema.update({
            userId: data.userId
        }, {
            $set: {
                message: data.message,
                notificationUserType:data.notificationUserType
            }
        }, async function (err, result) {
            if (err) {
                callback({
                    success: false,
                    STATUSCODE: 5005,
                    message: "INTERNAL DB ERROR",
                    response: err
                });
            } else {
                var notificationDetail = await NotificationsSchema.findOne({userId: data.userId})
                callback({
                    success: true,
                    STATUSCODE: 2000,
                    message: "Notification Data Updated Successfully.",
                    response: notificationDetail
                });
            }
        });

    }else{


        new NotificationsSchema({
            userId: data.userId,
            message: data.message.length>0 ? JSON.parse(data.message): data.message,
            notificationUserType:data.notificationUserType

        })
            .save(r =>{
                callback({
                    success: true,
                    STATUSCODE: 2000,
                    message: "Submitted test successfully.",
                    response: r
                });
            })

    }
          

    }
},


addAboutUsModel: async function (data, callback) {
                
    if (data) {

        var aboutusSchema = {
            
            description: data.description  
        }

        new AboutUsSchema(aboutusSchema)
            .save(r =>{
                console.log('addAboutUs',r)
                callback({
                    success: true,
                    STATUSCODE: 2000,
                    message: "Submitted test successfully.",
                    response: r
                });
            })
          

    }
},
listAboutUsModel: async function (data, callback) {
    var searchArray = [];
    var combineResponse = [];

    if(data.searchTerm){
        searchArray.push({'description': new RegExp(data.searchTerm, 'i')});
    }
    else{
        searchArray.push({})
    }
    
    var qry = {$or: searchArray};
    
    AboutUsSchema.countDocuments(qry).exec(function (err, resCount) {
        if(err){
            callback({
                success: false,
                STATUSCODE: 4200,
                message: "something went wrong!",
                response: err
            });
        }
    })

let countAboutUs = await AboutUsSchema.countDocuments(qry).exec()


let aboutusCategory = await AboutUsSchema.findOne(qry)
    .skip(data.offset).limit(data.limit)

callback({
        success: true,
        STATUSCODE: 2000,
        message: "Success",
        totalData: countAboutUs,
        response: aboutusCategory
    })


    
},
editAboutUsModel: async function (data, callback) {
    var obj = data.options;
    //console.log(obj);
    
    var answer = 0
    var answer_key = 0;
    var counter = 0;

    //console.log("answer",answer);
    
    if(data){
        AboutUsSchema.update(
            {_id: data._id},
            {
                $set:{
                   
                    description: data.description                            
                }
            }
        ).then(r =>{
            callback({
                success: true,
                STATUSCODE: 2000,
                message: "Success"
            });
        })
    }
},

deleteAboutUsModel: async function (data, callback) {
    var obj = data.options;
    //console.log(obj);
    
    var answer = 0
    var answer_key = 0;
    var counter = 0;

    //console.log("answer",answer);
    
    if(data){
        AboutUsSchema.deleteOne({ _id:data._id  })
        .then(r =>{
            callback({
                success: true,
                STATUSCODE: 2000,
                message: "Success"
            });
        })
    }
},


getAllAboutUsModel: async function (data, callback) {

    AboutUsSchema.findOne()
        .then(res =>{
            callback({
                success: true,
                STATUSCODE: 2000,
                message: "Success",
                response: res
            });
        })
        .catch(err => {
            callback({
                success: false,
                STATUSCODE: 4200,
                message: "something went wrong!",
                response: err
            });
        })
    
},



//#endregion AboutUs



//#region User Management



addUserModel: async function (data, callback) {
                
console.log('data.email--------',data.email.toLowerCase())
 let duplicateUserEmail = await UserSchema.findOne({ email: String(data.email).toLowerCase() })
 console.log('duplicateUserEmail--------',duplicateUserEmail)

    if(duplicateUserEmail !== null){

        callback({
            success: false,
            STATUSCODE: 4200,
            message: "Email Id already exist",
            response: {}
        });

    }else{
        
        if (data) {

            if (!data.fullname) {
                callback({
                    success: false,
                    STATUSCODE: 4200,
                    message: "fullname Required",
                    response: {}
                      });
            }

            if (!data.phone) {
                callback({
                    success: false,
                    STATUSCODE: 4200,
                    message: "phone Required",
                    response: {}
                      });
            }

            if (!data.email) {
                callback({
                    success: false,
                    STATUSCODE: 4200,
                    message: "Email Id Required",
                    response: {}
                      });
            }

            if (!data.password) {
                callback({
                    success: false,
                    STATUSCODE: 4200,
                    message: "password Required",
                    response: {}
                      });
            }

            if (!data.termCondition) {
                callback({
                    success: false,
                    STATUSCODE: 4200,
                    message: "termCondition Required",
                    response: {}
                      });
            }

            let hashedPassword = await  bcrypt.hashSync(data.password, bcrypt.genSaltSync(8), null);


            data.email = String(data.email).toLowerCase();
            data.otp = Math.random().toString().replace('0.', '').substr(0, 4);

          

            var userSchemaData = {
                fullname: data.fullname,
                email: data.email,
                phone: data.phone,
                gender: data.gender,
                age: data.age,
                state: data.state,
                country: data.country,
                category: data.category,
                password: hashedPassword,
                profileImage: data.profileImage,
                permission: data.permission,
                //authtoken: data.authtoken,
                termCondition: data.termCondition
            }

            let addUserSchemaDataResponse = await UserSchema.create(userSchemaData);

            if(addUserSchemaDataResponse)
            {
                var token = createToken(addUserSchemaDataResponse);
                mailProperty('sendEmailVerification')(data.email, {
                    email: data.email,
                    name: data.fullname,
                    site_url: config.liveUrl+'verify/'+addUserSchemaDataResponse._id,
                    date: new Date()
                }).send();


                let updateResponse = await UserSchema.updateOne({_id: addUserSchemaDataResponse._id}, {
                $set: {authtoken: token}           
                });
         
                let userResponse = await UserSchema.findOne({_id: addUserSchemaDataResponse._id});

                bcrypt.hash(data.password, null, null, function (err, hash) {
                    if (err) {
                        callback({
                            success: false,
                            STATUSCODE: 5005,
                            message: "INTERNAL DB ERROR",
                            response: err
                        });
                    } else {
                        UserSchema.update({
                            _id: userResponse._id
                        }, {
                            $set: {
                                password: hash
                            }
                        }, function (err, result) {
                            if (err) {
                                callback({
                                    success: false,
                                    STATUSCODE: 5005,
                                    message: "INTERNAL DB ERROR",
                                    response: err
                                });
                            } else {
                                callback({
                                    success: true,
                                    STATUSCODE: 2000,
                                    message: "User Registered Successfully. Please Check Your Email for Verification. ",
                                    response: userResponse
                                });
                            }
                        });
                    }
                });




            }else{
                callback({
                    success: false,
                    STATUSCODE: 4200,
                    message: "Something went wrong",
                    response: {}
                      });
            }
              
    
        }

    }

},
listUserModel: async function (data, callback) {

    var searchArray = [];
    var combineResponse = [];

    if(data.searchTerm){
        searchArray.push({'fullname': new RegExp(data.searchTerm, 'i')});
    }
    else{
        searchArray.push({})
    }
    
    var qry = {$or: searchArray};
    
    UserSchema.countDocuments(qry).exec(function (err, resCount) {
        if(err){
            callback({
                success: false,
                STATUSCODE: 4200,
                message: "something went wrong!",
                response: err
            });
        }
    })

   let countUser = await UserSchema.countDocuments().exec()

//   let users = await UserSchema.find({})
//     .skip(data.offset).limit(data.limit)

    let searchFilters = {};

      if (data.searchTerm) {
        searchFilters["fullname"] = { $regex: data.searchTerm, $options: "i" };
      }

      if (data.phone) {
        searchFilters["phone"] = data.phone;
      }

      if (data.gender) {
        searchFilters["gender"] = data.gender;
      }

      if (data.age) {
        searchFilters["age"] = data.age;
      }    

      if (data._id) {
        searchFilters["_id"] = data._id;
      }  

      if (data.category) {
        searchFilters["category"] = data.category;
      }

      if (data.state) {
        searchFilters["state"] = data.state;
      } 
      
      if (data.country) {
        searchFilters["country"] = data.country;
      } 

      if (data.email) {
        searchFilters["email"] = data.email;
      } 

      if (data.fullname) {
        searchFilters["fullname"] = { $regex: data.fullname, $options: "i" };
      }


    //#region Set pagination and sorting===============================================
    //=======(common Params[pageindex=1&pagesize=10&sortby=name&sorttype=Asc])
    let sortRecord = { updatedAt: 'desc' };
    let pageIndex = 1;
    let pageSize = parseInt(config.limit);
    let limitRecord = pageSize;
    let skipRecord = 0;
    //pageSize, pageIndex, sortBy, sortType, lat, long
    if (data.pageSize) {
      pageSize = parseInt(data.pageSize);
    }
    if (data.pageIndex) {
      pageIndex = parseInt(data.pageIndex);
    }
    if (pageIndex > 1) {
      skipRecord = (pageIndex - 1) * pageSize;
    }
    limitRecord = pageSize;
    if (data.sortBy && data.sortType) {
      let sortBy = data.sortBy;
      let sortType = "";
      if (data.sortType.toLowerCase() === "desc") {
        sortType = -1;
      }
      //sortRecord = {}
      sortRecord[sortBy] = sortType;
    }


    let users = await UserSchema.find(searchFilters)
      .sort(sortRecord)
      .limit(limitRecord)
      .skip(skipRecord)
      .exec();



    let usersCountFiltered = await UserSchema.find(searchFilters)
      

    if(users.length>0)
    {
    callback({
            success: true,
            STATUSCODE: 2000,
            message: "Success",
            totalData: countUser,
            filteredData:usersCountFiltered.length,
            response: users
        })
    }else {
        callback({
            success: true,
            STATUSCODE: 2000,
            message: "Success",
            totalData: 0,
            filteredData:0,
            response: []
        })
    }
    
},
    //Update Profile image
    uploadUserImageModel: function (data, callback) {
        if (data) {
            UserSchema.findOne({
                    _id: data._id
                }, {
                    profileImage: 1
                },
                function (err, result) {
                    if (err) {
                        callback({
                            success: false,
                            STATUSCODE: 4200,
                            message: "INTERNAL DB ERROR",
                            response: err

                        });
                    } else {
                        if (result == null) {
                            callback({
                                success: false,
                                STATUSCODE: 4200,
                                message: "Invalid User",
                                response: {}
    
                            });
                        } else {
                            // fs.unlink(result.profileImage, (err) => {
                            //     if (err) {
                            //         console.log('err', err);
                            //     } else {
                            //         console.log(result.profileImage + ' was deleted');
                            //     }

                            // });
                            UserSchema.update({
                                _id: data._id
                            }, {
                                $set: {
                                    profileImage: data.profileImage
                                }
                            }, function (err, resUpdate) {
                                if (err) {
                                    
                                    callback({
                                        success: false,
                                        STATUSCODE: 4200,
                                        message: "Errror occur.",
                                        response: err
            
                                    });
                                } else {
                                    callback({
                                        success: true,
                                        STATUSCODE: 2000,
                                        message: "Profile image has been changed.",
                                        response: data.profileImage
            
                                    });
                                }
                            });
                        }
                    }
                });
        } else {
            callback({
                            success: true,
                            STATUSCODE: 4200,
                            message: "INTERNAL DB ERROR",
                            response: {}

                        });

        }
    },
// uploadUserImageModel: async function (data, callback) {
//     var obj = data.options;
//     //console.log(obj);
    
//     var answer = 0
//     var answer_key = 0;
//     var counter = 0;
//     let file_with_path=''
//     console.log('data--->',data._id);


//     UserSchema.findOne({_id: data._id})
//         .then(async ven => {
//             if(ven){
//                 console.log('data.profileImage--->',data.profileImage)
//                 console.log('data.profileImage type of--->',typeof data.profileImage)

//                 if (data.fileData !== undefined && data.fileData !== null && ven.profileImage !== undefined) {

//                     if( (ven.profileImage !== null ) && ven.profileImage.toString().indexOf('/') > -1)
//                     {
//                     var resStrSplit = ven.profileImage.toString().split("/")[5];
//                     console.log('resStrSplit--',resStrSplit)
//                     file_with_path = `./public/uploads/user/${resStrSplit}`;
//                     //console.log('file_with_path--',file_with_path)

//                         if (fs.existsSync(file_with_path)) {
//                             await fs.unlink(file_with_path, (err) => {
//                                 if (err) throw err;
//                                 console.log('successfully deleted');
//                             });
//                         }
//                     }
//                 }
    
//     if(data){
//         UserSchema.findOne({_id: data._id})
//         .then(userData => {
            
//             console.log('--fileData--',data.fileData)

//         console.log('--userData--',userData)
//             UserSchema.update(
//                 {_id: data._id},
//                 {

//                     $set:{
//                          profileImage: (data.fileData !== undefined && data.fileData !== null)?data.profileImage:userData.profileImage,
                         
//                     }
//                 }
//             )
//             .then(r =>{

//                     UserSchema.findOne({_id: data._id})
//                     .then(user => {

//                         callback({
//                             success: true,
//                             STATUSCODE: 2000,
//                             message: "Profile Image Uploaded Successfully",
//                             response: user

//                         });
//                     }).catch(err => {
//                         callback({
//                             success: false,
//                             STATUSCODE: 4200,
//                             message: "Something Went Wrong",
//                             response: err
//                         });
//                     })


//                     })
//                 })
//         }else{
//             callback({
//                 success: false,
//                 STATUSCODE: 4200,
//                 message: "Something Went Wrong",
//                 response: {}
//             });
//         }
// }else{
//     callback({
//         success: false,
//         STATUSCODE: 4200,
//         message: "User not exist",
//         response: {}
//     });
// }
// })
// },

editUserModel: async function (data, callback) {
    var obj = data.options;
    //console.log(obj);
    
    var answer = 0
    var answer_key = 0;
    var counter = 0;
    let file_with_path=''
    console.log('data--->',data._id);
//  let us = await UserSchema.findOne({_id: data._id})
//  console.log('user data--->',us);

    UserSchema.findOne({_id: data._id})
        .then(async ven => {
        if(ven){

    
        if(data){
            UserSchema.findOne({_id: data._id})
            .then(userData => {
                
                console.log('--fileData--',data.fileData)

            console.log('--userData--',userData)
                UserSchema.update(
                    {_id: data._id},
                    {

                        $set:{

                            fullname: data.fullname?data.fullname:userData.fullname ,
                            email: data.email?String(data.email).toLowerCase():userData.email,
                            phone: data.phone?data.phone:userData.phone,
                            gender: data.gender?data.gender:userData.gender,
                            age: data.age?data.age:userData.age,
                            state: data.state?data.state:userData.state,
                            country: data.country?data.country:userData.country,
                            website: data.website?data.website:userData.website,

                            category: data.category?data.category:userData.category,

                            permission: data.permission?JSON.parse(data.permission):userData.permission,
                            authtoken: data.authtoken?data.authtoken:userData.authtoken,
                            
                            termCondition: data.termCondition?data.termCondition:userData.termCondition 
                        }
                    }
                )
                .then(r =>{

                        UserSchema.findOne({_id: data._id})
                        .then(user => {

                            callback({
                                success: true,
                                STATUSCODE: 2000,
                                message: "Success",
                                response: user

                            });
                        }).catch(err => {
                            callback({
                                success: false,
                                STATUSCODE: 4200,
                                message: "Something Went Wrongs",
                                response: err
                            });
                        })


                        })
                    })
            }else{
                callback({
                    success: false,
                    STATUSCODE: 4200,
                    message: "Something Went Wrongs",
                    response: {}
                });
            }
    }else{
        callback({
            success: false,
            STATUSCODE: 4200,
            message: "User not exist",
            response: {}
        });
    }
    })


},



deleteUserModel: async function (data, callback) {
    var obj = data.options;
    //console.log(obj);
    
    var answer = 0
    var answer_key = 0;
    var counter = 0;

    //console.log("answer",answer);
    
    if(data){
        UserSchema.deleteOne({ _id:data._id  })
        .then(r =>{
            callback({
                success: true,
                STATUSCODE: 2000,
                message: "Success"
            });
        })
    }
},


getAllUserModel: async function (data, callback) {

    UserSchema.findOne()
        .then(res =>{
            callback({
                success: true,
                STATUSCODE: 2000,
                message: "Success",
                response: res
            });
        })
        .catch(err => {
            callback({
                success: false,
                STATUSCODE: 4200,
                message: "something went wrong!",
                response: err
            });
        })
    
},



//#endregion User


//#region Category



addCategoryModel: async function (data, callback) {
                
    if (data) {

        var aboutusSchema = {
            name : data.name,
            description: data.description  
        }

        new CategorySchema(aboutusSchema)
            .save(r =>{
                console.log('addCategory',r)
                callback({
                    success: true,
                    STATUSCODE: 2000,
                    message: "Submitted test successfully.",
                    response: r
                });
            })
          

    }
},
listCategoryModel: async function (data, callback) {
    var searchArray = [];
    var combineResponse = [];

    if(data.searchTerm){
        searchArray.push({'description': new RegExp(data.searchTerm, 'i')});
    }
    else{
        searchArray.push({})
    }
    
    var qry = {$or: searchArray};
    
    CategorySchema.countDocuments(qry).exec(function (err, resCount) {
        if(err){
            callback({
                success: false,
                STATUSCODE: 4200,
                message: "something went wrong!",
                response: err
            });
        }
    })

let countCategory = await CategorySchema.countDocuments(qry).exec()


let aboutusCategory = await CategorySchema.findOne(qry)
    .skip(data.offset).limit(data.limit)

callback({
        success: true,
        STATUSCODE: 2000,
        message: "Success",
        totalData: countCategory,
        response: aboutusCategory
    })


    
},
editCategoryModel: async function (data, callback) {
    var obj = data.options;
    //console.log(obj);
    
    var answer = 0
    var answer_key = 0;
    var counter = 0;

    //console.log("answer",answer);
    
    if(data){
        CategorySchema.update(
            {_id: data._id},
            {
                $set:{
                    name : data.name,
                    description: data.description                            
                }
            }
        ).then(r =>{
            callback({
                success: true,
                STATUSCODE: 2000,
                message: "Success"
            });
        })
    }
},

deleteCategoryModel: async function (data, callback) {
    var obj = data.options;
    //console.log(obj);
    
    var answer = 0
    var answer_key = 0;
    var counter = 0;

    //console.log("answer",answer);
    
    if(data){
        CategorySchema.deleteOne({ _id:data._id  })
        .then(r =>{
            callback({
                success: true,
                STATUSCODE: 2000,
                message: "Success"
            });
        })
    }
},


getAllCategoryModel: async function (data, callback) {

    let searchFilters ={}


    CategorySchema.find(searchFilters)
        .then(res =>{
            callback({
                success: true,
                STATUSCODE: 2000,
                message: "Success",
                response: res
            });
        })
        .catch(err => {
            callback({
                success: false,
                STATUSCODE: 4200,
                message: "something went wrong!",
                response: err
            });
        })
    
},



//#endregion Category



//#region Field



addFieldModel: async function (data, callback) {
                
    if (data) {

        var fieldSchema = {
            
            description: data.description  
        }

        new FieldSchema(fieldSchema)
            .save(r =>{
                console.log('addField',r)
                callback({
                    success: true,
                    STATUSCODE: 2000,
                    message: "Submitted test successfully.",
                    response: r
                });
            })
          

    }
},
listFieldModel: async function (data, callback) {
    var searchArray = [];
    var combineResponse = [];

    if(data.searchTerm){
        searchArray.push({'description': new RegExp(data.searchTerm, 'i')});
    }
    else{
        searchArray.push({})
    }
    
    var qry = {$or: searchArray};
    
    FieldSchema.countDocuments(qry).exec(function (err, resCount) {
        if(err){
            callback({
                success: false,
                STATUSCODE: 4200,
                message: "something went wrong!",
                response: err
            });
        }
    })

let countField = await FieldSchema.countDocuments(qry).exec()


let fieldCategory = await FieldSchema.findOne(qry)
    .skip(data.offset).limit(data.limit)

callback({
        success: true,
        STATUSCODE: 2000,
        message: "Success",
        totalData: countField,
        response: fieldCategory
    })


    
},
editFieldModel: async function (data, callback) {
    var obj = data.options;
    //console.log(obj);
    
    var answer = 0
    var answer_key = 0;
    var counter = 0;

    //console.log("answer",answer);
    
    if(data){
        FieldSchema.update(
            {_id: data._id},
            {
                $set:{
                   
                    description: data.description                            
                }
            }
        ).then(r =>{
            callback({
                success: true,
                STATUSCODE: 2000,
                message: "Success"
            });
        })
    }
},

deleteFieldModel: async function (data, callback) {
    var obj = data.options;
    //console.log(obj);
    
    var answer = 0
    var answer_key = 0;
    var counter = 0;

    //console.log("answer",answer);
    
    if(data){
        FieldSchema.deleteOne({ _id:data._id  })
        .then(r =>{
            callback({
                success: true,
                STATUSCODE: 2000,
                message: "Success"
            });
        })
    }
},


getAllFieldModel: async function (data, callback) {



    FieldSchema.find()
        .then(res =>{
            callback({
                success: true,
                STATUSCODE: 2000,
                message: "Success",
                response: res
            });
        })
        .catch(err => {
            callback({
                success: false,
                STATUSCODE: 4200,
                message: "something went wrong!",
                response: err
            });
        })
    
},

//#endregion Field
  
   
    //verifyChangedEmailModel
    verifyChangedEmailModel: function (data, callback) {
        if (data) {

            if(!data.oldEmail)
            {
                callback({
                    success: false,
                    STATUSCODE: 4200,
                    message: "Old Email required!",
                    response: {}
                });
            }

            if(!data.newEmail)
            {
                callback({
                    success: false,
                    STATUSCODE: 4200,
                    message: "New Email required!",
                    response: {}
                });
            }
            UserSchema.findOne({
                email: data.oldEmail.toLowerCase()
            },
                function (err, resDetails) {
                    if (err) {
                        callback({
                            success: false,
                            STATUSCODE: 5002,
                            message: "something went wrong!",
                            response: err
                        });
                    } else {
                        if (resDetails === null) {
                            callback({
                                success: false,
                                STATUSCODE: 4200,
                                message: "User does not exist",
                                response: {}
                            });
                        } else {

                                    UserSchema.update({
                                        _id: resDetails._id
                                    }, {
                                        $set: {
                                            email: data.newEmail
                                        }
                                    }, function (err, result) {
                                        if (err) {
                                            callback({
                                                success: false,
                                                STATUSCODE: 5002,
                                                message: "something went wrong!",
                                                response: err
                                            });
                                        } else {
                                            resDetails.email = data.newEmail
                                            callback({
                                                success: true,
                                                STATUSCODE: 2000,
                                                message: "Email Updated Successfully ",
                                                response: resDetails
                                            });
                                        }
                                    });

                                }                                               
                    }
                });
        } else {
            callback({
                success: false,
                STATUSCODE: 5005,
                message: "Internal Server Error!",
                response: {}
            });
        }
    },


    //verifyEmail
    verifyEmail: function (data, callback) {
        if (data) {
            console.log('verified Email Data---->',data)
            UserSchema.findOne({
                    email: data.email.toLowerCase()
                }, {
                    fullname: 1,email:1,isEmailVerified:1
                },
                function (err, resDetails) {
                    if (err) {
                        callback({
                            success: false,
                            STATUSCODE: 5002,
                            message: "something went wrong!",
                            response: err
                        });
                    } else {
                        console.log('resDetails--',resDetails)
                        if (resDetails === null) {
                            callback({
                                success: false,
                                STATUSCODE: 5002,
                                message: "Email does not exist!",
                                response: {}
                            });
                        }else if(resDetails.isEmailVerified === false)
                        {
                            callback({
                                success: false,
                                STATUSCODE: 5002,
                                message: "Please verify your EMail Id from Your Email!",
                                response: {}
                            });
                        }
                        else {
                           
                            callback({
                                success: true,
                                STATUSCODE: 2000,
                                message: "Email Id Verified Successfully.",
                                response: resDetails
                            });
                                

                        }
                    }
                });
        } else {
            callback({
                success: false,
                STATUSCODE: 5005,
                message: "Internal Server Error!",
                response: {}
            });
        }
    },

    
    //verifyEmailOtpModel
    verifyEmailOtpModel: function (data, callback) {
        if (data) {

            if(!data.otp)
            {
                callback({
                    success: false,
                    STATUSCODE: 4200,
                    message: "Otp required!",
                    response: {}
                });
            }

            if(!data.email)
            {
                callback({
                    success: false,
                    STATUSCODE: 4200,
                    message: "Email required!",
                    response: {}
                });
            }
            UserSchema.findOne({
                email: data.email.toLowerCase(),
                otp: data.otp
            },
                function (err, resDetails) {
                    if (err) {
                        callback({
                            success: false,
                            STATUSCODE: 5002,
                            message: "something went wrong!",
                            response: err
                        });
                    } else {
                        if (resDetails === null) {
                            callback({
                                success: false,
                                STATUSCODE: 4200,
                                message: "Otp Verification Failed!",
                                response: {}
                            });
                        } else {
                                    callback({
                                        success: true,
                                        STATUSCODE: 2000,
                                        message: "Otp Verify successfully",
                                        response: resDetails
                                    });
                                }                                               
                    }
                });
        } else {
            callback({
                success: false,
                STATUSCODE: 5005,
                message: "Internal Server Error!",
                response: {}
            });
        }
    },


    socialRegister: (data, callback) => {

        UserSchema.findOne({
            email: String(data.email).toLowerCase()
        }, (err, user) => {
            if (err) {
                console.log("Error1", err);
                callback({
                    success: false,
                    STATUSCODE: 5005,
                    message: "Internal Server Error!",
                    response: {}
                });
            } else {
                if (user) {
                    let token = createToken(user);
                    user.authtoken = token;
                    user.socialLogin = JSON.parse(data.socialLogin);
                    data.profileImage = data.socialLogin.image

                    user.save();
                    console.log('data.socialLogin--->',user)

                    callback({
                        success: false,
                        STATUSCODE: 4200,
                        message: "Email address already exist",
                        response: {
                            authtoken: user.authtoken,
                            _id: user._id,
                            name: data.fullname,
                            email: String(data.email).toLowerCase(),
                            socialData: user.socialLogin,
                            profileImage: data.profileImage,
                            isEmailVerified:true
                        }
                        
                    })
                } else {
                    data._id = new ObjectID;
                    let token = createToken(data);
                    if (token) {
                        //data.authtoken = token;
                        //data.user_type = 'Normal User';
                        data.socialLogin = JSON.parse(data.socialLogin);
                        data.profileImage = data.socialLogin.image
                        data.isEmailVerified = true

                        new UserSchema(data).save(function (err, result) {
                            if (err) {
                                console.log("Error2", err);
                                callback({
                                    success: false,
                                    STATUSCODE: 4200,
                                    message: "Internal Server Error!",
                                    response: err
                                });
                            } else {
                              
                                var all_result = {
                                    authtoken: token,
                                    _id: result._id,
                                    name: result.fullname,
                                    email: result.email,
                                    phone: result.phone,
                                    socialLogin: result.socialLogin
                                }
                                    callback({
                                        success: true,
                                        STATUSCODE: 2000,
                                        message: "User Successfully Logged in.",
                                        response: all_result
                                    
                                });
                            }
                        });
                    }
                }
            }
        })
    },

    chatProcess: (data, callback) => {

                                    callback({
                                        success: true,
                                        STATUSCODE: 2000,
                                        message: "Socket working.",
                                        response: {}
                                    })
                                    

    },


    getTermsAndConditionsModel: async function (data, callback) {

        TermSchema.findOne({"_id": "5db7dea3c10c6e2604712024"})
            .then(res =>{
                callback({
                    success: true,
                    STATUSCODE: 2000,
                    message: "Success",
                    response: res
                });
            })
            .catch(err => {
                callback({
                    success: false,
                    STATUSCODE: 4200,
                    message: "something went wrong!",
                    response: err
                });
            })
           
    },
    editTermsAndConditionsModel: async function (data, callback) {
        
        if(data){
            TermSchema.update(
                {"_id": data._id},
                {
                    $set:{
                        text: data.text,
                        
                    }
                }
            ).then(r =>{
                callback({
                    success: true,
                    STATUSCODE: 2000,
                    message: "Success"
                });
            })
        }
    },


}

//#region sent push Notification
async function fcmSentPush (data = '', userDeviceId = '') {
    var title = '';

    if(data.title != ''){
        title = data.title;
    }else {
        title = "KuikTok"
    }

    const message = {
        to: userDeviceId,
        notification: {
            title: title, 
            body: data.msgBody,
            sound: "default",
            icon: "ic_launcher",
            tag : Date.now(),
            content_available : true,
        },
        
        data: {  //you can send only notification or only data(or include both)
            'title' : title,
            'body' : data.msgBody,
            'tag' : Date.now()
        }
    };
    
    fcm.send(message, function(err, response){
        if (err) {
            console.log("Something has gone wrong!", err);
            return data = {
                isSuccess: false,
                message: 'User deviceId is wrong or missing.'
            };
        } else {
            console.log(response)
            if(response.success == 1){
                return data = {
                    isSuccess: true,
                    message: 'Push notification sent successfully to the user.'
                };
            }
        }
    });
}

//#endregion

//counter sequence
const getNextSequence = async (name) => {
    // var a = {
    //     _id: new ObjectID,
    //     orderId: "orderId",
    //     seq: 0
    // }
    // new OrderCounterSchema(a).save()
    var returnElement = 0
    await CounterSchema.findOneAndUpdate(

        {
            orderId: "orderId"
        }, {
            $inc: {
                seq: 1
            }
        }, {
            new: true
        }

    ).then(counter => {
        //console.log(counter);
        returnElement = counter.seq;

    })
    //console.log(returnElement);


    return returnElement;
}

module.exports = commonModel;
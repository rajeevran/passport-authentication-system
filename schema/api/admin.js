var mongoose = require("mongoose");
var bcrypt = require('bcrypt-nodejs');

//Create UserSchema
var AdminSchema = new mongoose.Schema({
	email: {type: String, required: true, index: {unique : true}},
    password: {type: String, required: true, select: false},
    profileImage: {type: String},
    permission: {
        view: { type: String, enum: ['1', '0'], default: '1'},
        add: { type: String, enum: ['1', '0'], default: '0'},        
        edit: { type: String, enum: ['1', '0'], default: '0'},
        delete: { type: String, enum: ['1', '0'], default: '0'}
    },
    authtoken: {type: String,default: ''},
    blockStatus: {  type: String, enum: ['yes', 'no'], default: 'no' },
    userType: {  type: String, enum: ['1', '2'], default: '2'},
},{
    timestamps: true
});

AdminSchema.pre('save', function(next){
    var admin = this;
    if(!admin.isModified('password')) return next();

    bcrypt.hash(admin.password, null, null, function(err, hash){
        if(err){return next(err);}

        admin.password = hash;
        next();
    });
});

// AdminSchema.methods.comparePassword = function(password){
//     var admin = this;

//     return bcrypt.compareSync(password, admin.password);
// };


	


// Export your module
module.exports = mongoose.model("Admin", AdminSchema);

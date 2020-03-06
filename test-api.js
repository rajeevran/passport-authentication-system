var express = require('express');
var fileUpload = require('express-fileupload');
var mongoose = require('mongoose');
var bodyparser = require('body-parser');
var cookieParser = require('cookie-parser');
var path = require('path');
var methodOverride = require('method-override');
var _ = require('lodash');
var fs = require('fs');
const socketIo = require("socket.io");
var UserSchema = require('./schema/api/user');
var chatUserSchema = require('./schema/api/chat');

var config = require("./config");
//var apiService = require('./services/apiService');
//========================Create the application======================
var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
// This line is from the Node.js HTTPS documentation.

var credentials = {
    key: fs.readFileSync('/etc/letsencrypt/live/nodeserver.brainiuminfotech.com/privkey.pem', 'utf8'),
    cert: fs.readFileSync('/etc/letsencrypt/live/nodeserver.brainiuminfotech.com/fullchain.pem', 'utf8')
  };
var server = require('https').createServer(credentials, app);
//var server = require('http').createServer(app);


// Return the ID of the current execution context.
// start Inheritence

function user(firstName,lastName)
{
    this.firstName = firstName || 'Unknown'
    this.lastName  = lastName || 'Unknown'
}            

user.prototype.getFullName =function ()
                            {
                              return this.firstName + ' ' + this.lastName
                            }

function userProfile(fname, lname, schoolName , grade)                            
{
    user.call(this,fname,lname)
    this.schoolName = schoolName || 'Umknown'
    this.grade      = grade || 0
}

userProfile.prototype =  user.prototype

let out = new userProfile('Rajeev','Ranjan','Railway school',10)

console.log('output---',out.getFullName())

// end Inheritence



var myVar = 100;

var obj = { 
            myVar : 300, 
            whoIsThis: ()=>{
                console.log("this.myVar arrow = " + this.myVar); // 100

            },
            whoIsThat: function(){
              
                console.log("myVar = " + myVar); // 100
                console.log("this.myVar local= " + this.myVar);  //300
            }
            }


var counter = (function(){

                let initialCounter = 0
                let initialName = 'Rajeev'
                function changeValue(val){
                    initialCounter = initialCounter + val
                }

                function showIncrementName(sname)
                {
                    name =sname + '-' + initialCounter
                }
 
                return {
                    
                    increment : function(){
                        changeValue(1)
                    },
                    decrement : function(){
                        changeValue(-1)
                    },
                    value : function(){
                        return initialCounter
                    },
                    showName : function(sname){
                        showIncrementName(sname)
                    },
                    incrementedName: function(){
                        return name
                    }

                }

              })()

    console.log('counter increment 1-',counter.increment())
    console.log('counter increment 2-',counter.increment())

    console.log('counter-',counter.value())
    console.log('counter showName-',counter.showName('Rohit'))
    console.log('incrementedName-',counter.incrementedName())





var io = socketIo(server);

//==============Add middleware necessary for REST API's===============
// app.use(bodyparser.json({limit: '50mb'}));
// app.use(bodyparser.urlencoded(
//     {
//         limit: '50mb',
//         parameterLimit: 100000, 
//         extended: true 
//     }));
app.use(bodyparser.urlencoded({
    extended: true
}));

app.use(bodyparser.json());
app.use(fileUpload());
app.use(cookieParser());
app.use(methodOverride('X-HTTP-Method-Override'));


app.locals.title = 'My App'
var geek = {  
    course : "DSA",  
    price : "5000"  
}; 
  
console.dir(geek); 
console.log(geek); 
//console.dir(app.locals.title)

//==========Add module to recieve file from angular to node===========
//app.use('/public', express.static(path.join(__dirname, 'public')));

app.use(express.static(__dirname + '/public'));
//===========================CORS support==============================
app.use(function (req, res, next) {
    console.log('req.body----->',req.body)
    req.setEncoding('utf8');
    // Website you wish to allow to connect
    res.setHeader("Access-Control-Allow-Origin", "*");

    // Request methods you wish to allow
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");

    // Request headers you wish to allow
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token, user_id, authtoken");
    //res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token");

    if ('OPTIONS' == req.method) {
        res.sendStatus(200)
       // res.send(200);
    } else {
        next();
    }
});

//=========================Load the routes===============================
// var apiRoutesUser = require('./routes/apiRoutesUser.js')(app, express);
// var apiRoutesInstaller = require('./routes/apiRoutesInstaller.js')(app, express);

var apiRoutesAdmin = require('./routes/apiRoutesAdmin.js');
// app.use('/apiUser', apiRoutesUser);
// app.use('/apiInstaller', apiRoutesInstaller);

app.use('/api', apiRoutesAdmin);
// Configuring Passport
var passport = require('passport');
var expressSession = require('express-session');

app.use(expressSession({secret: 'mySecret'}));
app.use(passport.initialize());
app.use(passport.session());

 // Using the flash middleware provided by connect-flash to store messages in session
 // and displaying in templates
var flash = require('connect-flash');
app.use(flash());

// Initialize Passport
var initPassport = require('./passport/init');
initPassport(passport);

var routes = require('./routes/apiRoutesPassport')(passport);
app.use('/passport', routes);



// var adminRoutes = require('./routes/adminRoutes.js')(app, express);
// app.use('/admin', adminRoutes);

// var adminRoutes = require('./routes/adminRoutes.js')(app, express);
// app.use('/admin', adminRoutes);
//=========================Load the views================================

app.get("/verify/:id", async function (req, res) {
    console.log('id==',req.params.id) 
    let userId = req.params.id
    if(userId){
    //  isEmailVerified
    await UserSchema.update(
        {_id:userId},
        {$set:{isEmailVerified:true}}
        )
    }
    res.sendFile(__dirname + '/public/views/verify.html');
});

app.get("*", function (req, res) {
    res.sendFile(__dirname + '/public/views/404.html');
});
//===========================Connect to MongoDB==========================
// producation config or local config
var producationString = "mongodb://" + config.production.username + ":" + config.production.password + "@" + config.production.host + ":" + config.production.port + "/" + config.production.dbName + "?authSource=" + config.production.authDb;
//var producationString = "mongodb://" + config.local.username + ":" + config.local.password + "@" + config.local.host + ":" + config.local.port + "/" + config.local.dbName + "?authSource=" + config.local.authDb;

console.log(producationString);

//var producationString = config.local.database;
var localString = 'mongodb://localhost:27017/Rito'
var options = {};
var db = mongoose.connect(producationString, options, function (err) {
    if (err) {
        console.log(err + "connection failed");
    } else {
        console.log('Connected to database ');
    }
});
//mongo on connection emit
mongoose.connection.on('connected', function (err) {
    console.log("mongo Db conection successfull");
});
//mongo on error emit
mongoose.connection.on('error', function (err) {
    console.log("MongoDB Error: ", err);
});
//mongo on dissconnection emit
mongoose.connection.on('disconnected', function () {
    console.log("mongodb disconnected and trying for reconnect");
});
mongoose.set('debug', true);

//===========================Connect to MongoDB==========================
//#region ===========================Socket====================================
async function funUser(userId,status){
    let userExist =  await UserSchema.findOne({_id:userId})
    let response = {}
    if(userExist)
    {

        let updateUserStatusResponse =  await UserSchema.updateOne(
            {_id:userId},
            {$set: {
                isOnline: status
            }
            }
            )

            response =  await UserSchema.findOne({_id:userId})

            console.log('fetched response',response);
            //  return response
    }
  return response

}

async function chatUser(data){

    // to_user:
    // from_user:
    // message: 
    // channelId: 

    let info = {
        to_user:data.userId,
        from_user:data.userId,
        message:'',
        channelId:data.channelId
    }

    let userChatResponse =  await chatUserSchema.create(info)

  return userChatResponse

}

io.on('connection', (socket) => {
   // socket.removeAllListeners()

    console.log('New WebSocket connection')
    let userId = ''
    socket.on('startCall', async (message) => {
    console.log('WebSocket connected')

        io.emit('message',  message)
        console.log('message------->',message)
        if(message.userId)
        {
            userId = message.userId
            let user = await funUser(message.userId,true)
            console.log('user under function-->',user)
            io.emit('userStatusDetail',  user)
        }

    })

    socket.on('signOutUser', async (signOutMessage) => {
    console.log('WebSocket disconnected')

       // io.emit('signOutMessage',  signOutMessage)
        console.log('signOutMessage------->',signOutMessage.userId)
        if(signOutMessage.userId)
        {
            userId = signOutMessage.userId
            let user = await funUser(signOutMessage.userId,false)
            console.log('user under function-->',user)
           // io.emit('userStatusDetail',  user)
        }

    })


    socket.on('startVideoCall', async function (data) {

        console.log("send startVideoCall data--->", data);

            io.emit('videoCallResponse', data);
        
    });

    socket.on('stopVideoCall', async function (data) {

        console.log("send startVideoCall data--->", data);

        io.to(data.channelId).emit('videoCallResponse', data)
        
    }); 

    socket.on('join', (data) => {

        console.log('Before Join socket ------------->',socket)

        socket.join(data.channelId)
        //console.log('join  message.channelId --',data.channelId)
        console.log('After Join socket ------------->',socket)

        socket.emit('JoinedUser', 'Welcome!')
      //  socket.broadcast.to(data.channelId).emit('JoinedUser', `${data.fullname} has joined!`)
    })
 
    // socket.on('sendMessage', data => {
    //     socket.removeAllListeners()
    //     socket.join(data.channelId);

    //     socket.to(data.channelId).emit('chatMessage', data)
    //   })

   // setInterval(function(){
        
        socket.once('sendMessage', async function (message) {

        console.log('sendMessage Chat-->',message)

        let chatUserDetail = await chatUser(message)
        console.log('sendMessage under function-->',chatUserDetail)

        //socket.removeAllListeners()
        //socket.join(message.channelId);
        console.log('sendMessage  message.channelId --',message.channelId)
        //io.in(message.channelId).emit('chatMessage', message);
        io.to(message.channelId).emit('chatMessage', message)

    })

    //}, 1000)

    socket.on('removeRoom', room => {
        
        console.log('-----------Remove Room io.sockets.adapter.rooms ------------->',room)
        socket.leave(room.channelId, function() {
            let cId= socket.id
            var rId= {}
            console.log('client:'+socket.id+" leave ok:"+room.channelId);
            console.log(socket.adapter.rooms);
            //socket.disconnect();
            //socket.connect();
            let df1=  {Room : { sockets: { cId: true }, length: 1 }}
            rId[room.channelId] = df1

            let df2=  rId 
            socket.adapter.rooms = df2 //connected
            socket.adapter.sids = df2 //connected
            console.log('after socket.sockets 1-->');
            console.log(socket.adapter.rooms);

          //  console.log('before socket.sockets 1-->',socket.nsp.sockets);
            //socket.nsp.sockets ={}

           // socket.nsp.connected ={}
           // delete room.channelId;
           // console.log('after socket.sockets-->',socket.nsp);
          
        });
        //io.sockets = {}
        //socket.disconnect();
        //io.on('connection', (socket) => {})
        //console.log('Before Remove Leave socket ------------->',socket)
        //io.sockets.delete()
       // socket.leave(room.channelId)
        //socket.removeAllListeners('connection');
        //socket.removeAllListeners('sendMessage');
         //socket.removeAllListeners('join');
        // console.log('After Remove Leave socket ------------->',socket)

      })

    socket.on('disconnect', () => {
    //    io.emit('message', 'A user has left!')
    })


   })


//#endregion ===========================Socket====================================
app.set('port', config.port);
console.log('config.port',config.port);


const january = new Date(9e8);
const english = new Intl.DateTimeFormat('en', { month: 'long' });
const spanish = new Intl.DateTimeFormat('es', { month: 'long' });

console.log('Language in English-',english.format(january));
// Prints "January"
console.log('Language in Spanish-',spanish.format(january));

//if (cluster.isMaster) {
    // console.log(`Master ${process.pid} is running`);
  
    // // Fork workers.
    // for (let i = 0; i < numCPUs; i++) {
    //   cluster.fork();
    // }
    // cluster.on('online', (worker) => {
    //     console.log('Yay, the worker responded after it was forked');
    //   });
    // cluster.on('exit', (worker, code, signal) => {
    //   console.log(`worker ${worker.process.pid} died`);
    // });
  //} else {
    // Workers can share any TCP connection
    // In this case it is an HTTP server


    server.listen(app.get('port'), function (err) {
        if (err) {
            throw err;
        }
        else {
            console.log("Server is AS running at http://localhost:" + app.get('port'));
        }
    });
    server.timeout = 500000000; 
  
   // console.log(`Worker ${process.pid} started`);
  //}


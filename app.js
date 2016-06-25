var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');


//var routes = require('./routes/index');
//var users = require('./routes/users');

var app = express();

// view engine setup
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));

//app.use('/', routes);
//app.use('/users', users);

//mongoose-------------------------------------->>>>>
mongoose.connect("mongodb://localhost/bikes");

var userSchema=mongoose.Schema(
{
    userName:String,
    firstName:String,
    lastName:String,
    userID:String,
    password:String,
    status:String
},
{
    strict: false
});

var standSchema=mongoose.Schema(
    {
        //_id:Number,
        standName: String,
        latitude: String,
        longitude: String,
        description: String,
        imageURL: String,
        available: String

    }
);

var randomSchema=mongoose.Schema(
    {
        user_id:String,
        number:String,
        stand_id:String
    }
);

var userModel=mongoose.model('users',userSchema);
var standModel=mongoose.model('stands',standSchema);
var randomModel=mongoose.model('randoms',randomSchema);

app.post('/signup',function(req,res)
{
    //res.send("Server under construction, signup after some time :D");
    var userSignup=new userModel();
    var uname=req.body.userName;
    console.log(uname);
    userSignup.userName=req.body.userName;
    userSignup.firstName=req.body.firstName;
    userSignup.lastName=req.body.lastName;
    //userSignup.userID=req.body.userID;
    userSignup.userID=1;                //dummy variable
    userSignup.password=req.body.password;
    userSignup.status="FREE";
    //console.log(userSignup.firstName+" "+userSignup.password+" "+userSignup.lastName+" "+userSignup.userID+" "+userSignup.userName);
    userModel.findOne({userName : uname},function(err,foundObject)
    {
        if(foundObject==null)
        {
            console.log("Client logged in");
            userSignup.save(function (err) {
                if (err) {
                    handleError(res, err);
                }
                else {
                    res.send("1");
                }
            });
            //res.send("1");
        }
        else
        {
            console.log("Username already exists");
            res.send("0");
        }
    });
});

app.post('/login',function(req,res)
{
    var userLogin=new userModel();

    var uname=req.body.userName;
    var pword=req.body.password;
    console.log(uname);
    console.log(pword);

    userModel.findOne({userName : uname},function(err,userObj)
    {
        if(err)
        {
            console.log("Error while login");
        }
        else
        {
            //console.log(userObj);
            if(userObj==null)
            {
                console.log("0");
                res.send("0");
            }
            else if(pword==userObj.password)
            {
                console.log(userObj);
                res.send(userObj);
            }
            else
            {
                console.log("0");
                res.send("0");
            }
        }
    });
});

app.get('/getStands',function(req,res)
{
    standModel.find(function(err,jsonArray)
    {
        var jsonArrayWithName={"stands":jsonArray};
        console.log(jsonArrayWithName);
        res.send(jsonArrayWithName);
    });
});

app.get('/getUsers',function(req,res)
{
    userModel.find(function(err,jsonArray)
    {
        var jsonArrayWithName={"users":jsonArray};
        console.log(jsonArrayWithName);
        res.send(jsonArrayWithName);
    });
});


app.get("/checkUserName/:userName",function(req,res)
{
    var uname=req.params.userName;
    userModel.find({userName: uname},function(err,userObj)
    {
        if(userObj==null)
        {
            console.log("0");
            res.send("0");
        }
        else
        {
            console.log("1");
            res.send("1");
        }
    });
});
function createRandomNumber(obj)
{
    var num = Math.floor(Math.random() * 9000) + 1000;
    console.log("FIRST NUMBER: "+num);
    var tempRandomModel=new randomModel();
    tempRandomModel.number=num;
    tempRandomModel.user_id=obj.user_id;
    randomModel.findOne({number : num},function(err,foundObject)
    {
        if(foundObject==null)
        {
            console.log("This number exists");
            tempRandomModel.save(function (err) {
                if (err) {
                    handleError(res, err);
                }
                else {
                    console.log("OTP is logged");
                }
            });
            //res.send("1");
        }
        else
        {

            console.log("Number already exists, OTP didn't get logged>>> Calling function again");
            num=createRandomNumber(obj);
        }
        console.log("returning: "+num);

        return num;
    });
}
app.post("/bookBike",function(req,res)
{
    var num = Math.floor(Math.random() * 9000) + 1000;
    console.log("FIRST NUMBER: "+num);
    var tempRandomModel=new randomModel();
    tempRandomModel.number=num;
    tempRandomModel.user_id=req.body.user_id;
    tempRandomModel.stand_id=req.body.stand_id;
    console.log(tempRandomModel.user_id);
    randomModel.findOne({$or:[{number : num },{user_id : req.body.user_id}]},function(err,foundObject)       //,
    {
        if(foundObject==null)
        {
            console.log("This number exists");
            tempRandomModel.save(function (err) {
                if (err) {
                    handleError(res, err);
                }
                else {
                    console.log("OTP is logged");
                }
            });
            //res.send("1");
        }
        else
        {

            console.log("Number already exists, OTP didn't get logged>>> Calling function again");
            res.send("-1");         //user has already booked or same number exists
            return;
        }
        console.log("returning: "+num);
//FROM CALLBACK
        //var number=createRandomNumber(req.body);
        console.log("THE NUMBER: " + num);
        console.log(req.body);
        var uId = req.body.user_id;
        var sId = req.body.stand_id;
        console.log("yo: " + sId);
        standModel.findOne({_id: sId}, function (err, standObject) {
            console.log(standObject.standName);
            console.log(standObject._id);
            if (err) {
                console.log(err);
                res.send("0");
            }
            else {
                console.log(standObject.standName);
                console.log(standObject._id);
                var number = Number(standObject.available);
                if (number == 0)
                    res.send("0");
                else {
                    number--;
                    standObject.available = number;
                    console.log("NO CLUE");
                    res.send(String(num));
                    standObject.save(function (err) {
                    });
                }
            }
        });

        userModel.findOne({_id: uId}, function (err, userObject) {
            console.log(userObject);
            if (err) {
                console.log(err);
                //   res.send("0");
            }
            else {
                userObject.status = "BOOKED";
                console.log("After booking");
                // res.send("1");
                userObject.save(function (err) {
                });
            }
        });
//TILL CALLBACK
    });
});

app.get("/checkOTP/:userName",function(req,res)
{
    console.log("ONE");
    var uname=req.params.userName;
    userModel.findOne({userName: uname}, function (err, foundObject)
    {
        if(foundObject!=null)
        {
            var user_id = foundObject._id;
            randomModel.findOne({user_id: user_id}, function (err, foundObject2) {
                if (foundObject2 != null)
                    res.send(foundObject2.number);
                else
                    res.send("0");
            });
        }
        else
            res.send("-1");
    });
});
app.get("/cancelBooking/:userName",function(req,res)
{
    var uname=req.params.userName;
    var tempUser =new userModel();
    var tempStand=new standModel();
    var tempRandom=new randomModel();
    var user_id;
    var stand_id;
    console.log("ONE");
    userModel.findOne({userName:uname},function(err,foundObject)
    {
        foundObject.status="FREE";
        //tempUser.password=foundObject.password;
        //tempUser.userID=foundObject.userID;
        //tempUser.userName=foundObject.userName;
        //tempUser.lastName=foundObject.lastName;
        //tempUser.firstName=foundObject.firstName;
        foundObject.save(function (err) {});
        console.log("TWO")
        user_id=foundObject._id;
        randomModel.findOne({user_id:user_id}, function (err, foundObject2)
        {
            if(foundObject2!=null) {
                stand_id=foundObject2.stand_id;
                foundObject2.remove();

            }

            console.log("THREE");
            standModel.findOne({_id:stand_id},function(err,foundObject3)
            {
                var num=foundObject3.available;
                var number=Number(num);
                number++;
                foundObject3.available=number;
                //tempStand.standName=foundObject3.standName;
                //tempStand.latitude=foundObject3.latitude;
                //tempStand.longitude=foundObject3.longitude;
                //tempStand.description=foundObject3.description;
                //tempStand.imageURL=foundObject3.imageURL;
                foundObject3.save(function (err) {});
                res.send("1");
            });
        });
    });
});

app.get("/returnBike/:user_id/:stand_name",function(req,res)
{
    console.log(req.params.user_id);
    console.log(req.params.stand_name);
    var uId=req.params.user_id;
    var standName=req.params.stand_name;
    standModel.findOne({standName:standName},function(err,foundObject3)
    {
        var num=foundObject3.available;
        var number=Number(num);
        number++;
        foundObject3.available=number;
        //tempStand.standName=foundObject3.standName;
        //tempStand.latitude=foundObject3.latitude;
        //tempStand.longitude=foundObject3.longitude;
        //tempStand.description=foundObject3.description;
        //tempStand.imageURL=foundObject3.imageURL;
        foundObject3.save(function (err) {});
        userModel.findOne({_id:uId},function(err,foundObject)
        {
            foundObject.status="FREE";
            //tempUser.password=foundObject.password;
            //tempUser.userID=foundObject.userID;
            //tempUser.userName=foundObject.userName;
            //tempUser.lastName=foundObject.lastName;
            //tempUser.firstName=foundObject.firstName;
            foundObject.save(function (err) {});
            res.send("1");
        });
    });
});
app.get("/returnBikeFromStand/:user_id/",function(req,res){
    var u=req.params.user_id;
    userModel.findOne({_id:u},function(err,foundObject)
    {
        foundObject.status="RIDING";
        foundObject.save(function (err) {});
        randomModel.findOne({user_id:u},function(err,foundObject2){
            if(foundObject2!=null){
            foundObject2.remove();
            res.send("1");}
            else
                res.send("0");
        });
    });
});
//---------------------------------------------->>>>>


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;

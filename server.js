var express=require('express');
var app=express();
var db=require('./models/index.js');
var bodyParser = require('body-parser');
var OAuth2Strategy = require('passport-oauth2'),
LocalStrategy = require('passport-local').Strategy,
cookieParser = require('cookie-parser'),
TMAPI = require('tm-api')
var passport = require('passport');
var session = require('express-session');
var flash = require('connect-flash');
var axios = require('axios');
// var User = require('models/User');
TMAPI.setAPIKey("l9XiABE2P5GIQGAhtFcErCCFoA2Ap9R4");
TMAPI.setSecret("bzE5ahSftAgfRSMe");

var promise = TMAPI.events.search("NHL");

var ssn, cookies;
var User = db.User;
var Tickets = db.Tickets;
var Price = db.Price;

// var hockey_games = [object Object]
app.use(express.static('__tickets-on-ice-app' + '/public'));

// cookie bodyParser
app.use(cookieParser());

// passport config
app.use(session({secret: 'ticketsonice',
saveUninitialized: true,
resave: true}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
passport.use(new LocalStrategy(db.User.authenticate()));
passport.serializeUser(db.User.serializeUser());
passport.deserializeUser(db.User.deserializeUser());

// Configure app
app.set('views', __dirname + '/views');      // Views directory
app.use(express.static('public'));          // Static directory
app.use(bodyParser.urlencoded({ extended: true })); // req.body

app.set("view engine", "ejs");

// Set CORS Headers
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

//basic root route
app.get('/',function(req,res){
  // if conencted
  if(req.user){
console.log('the user in / is ', req.user);
    res.redirect('/home')
  }else{

res.render('signup_login.ejs');
}
});

// app.get('/',function(req,res){
//     res.render('splash.ejs');
//
// });

app.get('/signup_login', function(req,res){
  res.render('signup_login');
});

app.get('/login', function(req,res){
console.log('I AM HERE');
  res.render('login');
});

// show the login form
app.post('/login', passport.authenticate('local'),function (req,res) {
  if(!req.user){
    res.status(400).redirect('/login');
  }else{
console.log('this is user',reg.user);
  }
});

app.get('/signup', function(req, res){
  res.render('signup');
});
// process the login forms
// app.post('/login', do all our passport stuff here);

// show the signup form
// app.get('/signup', function(req,res){
//
//   res.render('signup');
// });

app.post('/signup',function(req,res){
  // ragex for email verification
  var emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
  // email verified
  if( !emailRegex.test(req.body.username)){;
    res.status(400).json({message:'Email address is not valid.'});
  }
  User.register(new User({username:req.body.username,first_name:req.body.first_name,last_name:req.body.last_name})
  ,req.body.password,function(err,newUser){
    if(err){
      res.status(400).json({'message':err});
      throw err;
    }else{
      passport.authenticate('local')(req, res, function(err1,ok) {
        if(err1){
          res.status(400).json({'message':err1.message});
        }
        else{
          res.render('home');
        }
      });

    }
  });


});

// process the login forms
// app.post('/login', do all our passport stuff here);

// app.get('/', function(req,res){
//   res.render('/home');
// });

app.get('/home', function(req, res) {
  res.render('home');
});
app.get("/home1", function (req, res) {
  Tickets.find({}, function(err, allTickets){
    if (err) {
      res.status(500).json({ error: err.message, });
    } else {
      res.render("home1", { tickets: allTickets });
    }
  });
});

app.get('/home1', function(req,res){

  axios({
    method: 'GET',
    url: '',
  }).then((res)=>{
    res.render('home1',{ message: "success!", apiData: apiData});
  }).catch((err)=>{
    res.status(200).send(error);
  })

  res.render('home1', {tickets: apiData});
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
  return next();
  res.redirect('/');
}

app.get('/account', function(req,res){
  res.render('account');
});

app.get('/order-received-print', function(req,res) {
  res.render('order-received-print');
});

app.get('/order-received-mobile', function(req,res) {
  res.render('order-received-mobile');
});

app.get('/contact-us', function(req,res) {
  res.render('contact-us');
});

app.get('/about', function(req,res) {
  res.render('about');
});

app.get('/checkout', function(req,res) {
  res.render('checkout');
});

app.get('/user', function(req, res) {
  var tickets=[];
  if(!req.user) {
    res.redirect('/');
  } else {
    Tickets.find({user_id:req.user._id,date_end:{ $ne: null }},function(err,all){
      res.render('profile',{user:req.user,trips:all});
    });

  }
});

// app.post('/signup',function(req,res){
//   // ragex for email verification
//   var emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
//   // email verified
//   if( !emailRegex.test(req.body.username)){;
//     res.status(400).json({message:'Not a valid email address!'});
// }
//   User.register(new User({username:req.body.username,first_name:req.body.first_name,last_name:req.body.last_name})
//   ,req.body.password,function(err,newUser){
//     if(err){
//       res.status(400).json({'message':err});
//       throw err;
//     }else{
//     passport.authenticate('local')(req, res, function(err1,ok) {
//     if(err1){
//   res.status(400).json({'message':err1.message});
// }
//   else{
//     res.redirect('/home1');
//   }
// });
// }})});

app.post("/signup", function (req, res) {
  User.register(new User({ username: req.body.username, }), req.body.password,
  function () {
    passport.authenticate("local")(req, res, function() {
      res.redirect("/home1");
    });
  }
);
});

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findOne({
    _id: id
  }, '-password -salt', function(err, user) {
    done(err, user);
  });
});

// passport.use('local-signup', new LocalStrategy({
//   usernameField: 'email',
//   passwordField: 'password',
//   passReqToCallback: true // pass back entire request to the callback
// },

// function (req, email, password, done) {
//   process.nextTick(function() {
//     User.findOne({ 'local.email': email }, function(err, user) {
//       if (err)
//       return done(err);
//
//       if (user) {
//         return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
//       } else {
//         var newUser = new User();
//         newUser.local.email = email;
//         newUser.local.password = newUser.generateHash(password);
//
//         newUser.save(function(err) {
//           if (err)
//           throw err;
//           return done(null, newUser);
//         });
//       }
//     });
//   });
// }));
//
// app.post('/signup', passport.authenticate('local-signup', {
//   successRedirect: '/profile', // redirect to the secure profile selection
//   failureRedirect: '/signup', // redirect back to the signup page if there is an error
//   failureFlash: true // allow flash messages
// }));

app.listen(process.env.PORT || 3000,function(){
  console.log('server running');
});

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
// const md5 = require("md5"); //level 3 security
// const bcrypt = require("bcrypt"); //level 4 security
// const saltRounds = 5; //level 4 security step2

// level5 security
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");


const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static("public"));
app.set("view engine", "ejs");

// security 5 step1
app.use(session({
    secret: "I am a secret",
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/UserDB", {
  useNewURLParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

// security level 5 step2
userSchema.plugin(passportLocalMongoose);

// level 2 security
// userSchema.plugin(encrypt , {secret:process.env.secret , encryptedFields: ["password"]})

const User = new mongoose.model("User", userSchema);

// use static authenticate method of model in LocalStrategy
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.get("/secrets", function (req, res) {
    if(req.isAuthenticated()){
        res.render("secrets");

    }else{
        res.redirect("/login");
    }
});

app.get("/submit",function(req,res){
  res.render("submit")
})

app.get('/logout', function(req,res){
  req.logout();
  res.redirect("/");
})


// app.post("/register", function (req, res) {
//   //level 4 security step 3
//   bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
//     // Store hash in your password DB.

//     const newUser = new User({
//       email: req.bo||dy.username,
//       //level 3 sercurity using md5, md5 function was just added to the password
//     //   password: md5(req.body.password),

//      password: hash //level 4 sec step4
//     });

//     newUser
//       .save()
//       .then((result) => {
//         res.render("secrets");
//         console.log("User added successfully");
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   });
// });

// app.post("/login", function (req, res) {
//   const username = req.body.username;
//   //step 2 of level 3 security, comapring the login password and the password in the database after md5(hashing)
// //   const password = md5(req.body.password);

//     //level 4 security step 5
//     const password = req.body.password;

//   User.findOne({ email: username })
//     .then((result) => {
//         //step 5 of level 4 security, comparing the login password and the password in the database after bcrypt(Salting)
//         bcrypt.compare(password, result.password, function (err, result) {
//             if (result === true) {
//               res.render("secrets");
//               console.log("User found");
//             } else {
//               console.log("Password incorrect");
//             }
//           })
//     })
//     .catch((err) => {
//       console.log("User not found ");
//     });
// });


//security level 5
app.post("/register", function (req, res) {

    User.register({username: req.body.username}, req.body.password , function(err, user) {
        if (err) {
            console.log(err);
            res.redirect("/register");
        }
        else{
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets");
            })
        }
      
     
        });
    })


app.post("/login", function (req, res) {
    const user = new User({
      username: req.body.username,
      password:req.body.password
    });

    req.login(user, function(err){
        if(err){
            console.log(err);
        }else{
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets");
            })
        }
    })
  })

app.post('/submit',function(req,res){
  const submittedSecret = req.body.secret;
  console.log(submittedSecret);
  res.redirect("/secrets");
  })

app.post('logout',function(req,res){
  req.logout();
  res.redirect("/");
})



app.listen(3000, function () {
  console.log("Server is listening on port 3000");
});

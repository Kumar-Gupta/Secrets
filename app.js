require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const encrypt = require('mongoose-encryption')

const app = express()
app.use(bodyParser.urlencoded({ extended: false }))

app.use(express.static('public'))
app.set('view engine', 'ejs')

mongoose.connect("mongodb://localhost:27017/UserDB", {useNewURLParser:true, useUnifiedTopology:true})

const userSchema =new mongoose.Schema( {
    email: String,
    password: String
})


userSchema.plugin(encrypt , {secret:process.env.secret , encryptedFields: ["password"]})

const User = new mongoose.model("User",userSchema)

app.get('/',function(req,res){
    res.render('home')
})

app.get('/login',function(req,res){
    res.render('login')
})

app.get('/register',function(req,res){
    res.render('register')
})

app.post('/register',function(req,res){
    const newUser= new User({
        email: req.body.username,
        password: req.body.password
    })

    newUser.save()
    .then(result => {
        res.render('secrets')
        console.log("User added successfully")
    })
    .catch(err => {
        console.log(err)
    })
});

app.post('/login',function(req,res){
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({email:username})
    .then(result => {
        if(result.password === password){
            res.render('secrets')
        }
        else{
            res.send("Wrong Password")
        }
        })
    .catch(err => {
        console.log("User not found ")
    })
})

app.listen(3000, function(){
    console.log("Server is listening on port 3000")
})

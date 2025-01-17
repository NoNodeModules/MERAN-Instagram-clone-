const express = require('express');
const mongoose = require('mongoose')
const User = mongoose.model("User")
const bcrypt = require('bcryptjs')
const router = express.Router();
const {JWT_SECRET}=require('../keys')
const jwt = require('jsonwebtoken')
const requireLogin = require('../middleware/reqireLogin')

const nodemailer = require('nodemailer')
const sendgridTransport = require('nodemailer-sendgrid-transport')
const {SENDGRID_API,EMAIL} = require('../config/keys')




// router.get('/protected',requireLogin, (req, res) => {
//     res.send("protected");
// });

//signup route

const transporter = nodemailer.createTransport(sendgridTransport({
    auth:{
        api_key:SENDGRID_API
    }
}))

router.post('/signup', (req, res) => {
    const {name,email,password} = req.body 
  if(!email || !password || !name){
     return res.status(422).json({error:"please add all the fields"})
  }
  User.findOne({email:email})
  .then((savedUser)=>{
    if(savedUser){
        return res.status(422).json({error:"user already exists with that email"})
      }
      bcrypt.hash(password,12)
      .then(hashedpassword=>{
            const user = new User({
                email,
                password:hashedpassword,
                name,
                
            })
    
            user.save().then(user=>{
              // transporter.sendMail({
              //     to:user.email,
              //     from:"no-reply@insta.com",
              //     subject:"signup success",
              //     html:"<h1>welcome to instagram</h1>"
              // })
              res.json({message:"saved successfully"})
          })
          .catch(err=>{
              console.log(err)
          })

          })

  })
});

//sigin route
router.post('/signin',(req,res)=>{
  const {email,password} = req.body
  if(!email || !password){
     return res.status(422).json({error:"please add email or password"})
  }
  User.findOne({email:email})
  .then(savedUser=>{
      if(!savedUser){
         return res.status(422).json({error:"Invalid Email or password"})
      }
      bcrypt.compare(password,savedUser.password)
      .then(doMatch=>{
          if(doMatch){
              // res.json({message:"successfully signed in"})
              const {_id,name,email,followers,following,pic} = savedUser
              const token = jwt.sign({_id:savedUser._id},JWT_SECRET)
              res.json({token,user:{_id,name,email,followers,following,pic}})
          }
          else{
              return res.status(422).json({error:"Invalid Email or password"})
          }
      })
      .catch(err=>{
          console.log(err)
      })
  })
})


module.exports=router;
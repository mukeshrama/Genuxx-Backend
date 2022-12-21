const express=require('express')
var cors = require('cors')

const Jwt=require('jsonwebtoken')
const jwtKey='Genux'

var app = express()
app.use(cors())
require('./db/config')
const User=require('./db/User');
app.use(express.json())

app.get("/password_requirements",async(req,res)=>{
   requiremnts={"require_lowercase": true,
   "last_x_passwords": 5,
   "require_number": true,
   "require_special": true,
   "max_chars": 1024,
   "require_uppercase": true,
   "min_chars": 8 } 
   res.send(requiremnts);
})
app.post("/register",async(req,resp)=>{
   let person=req.body;
   let authentication_token="hello";
   let user=new User({authentication_token,person});
   let result= await user.save();
   result=result.toObject(); 
   Jwt.sign({result},jwtKey,{expiresIn:"2h"},async (err,token)=>{
      if(err){
         resp.send({result:'Something Went Wrong Please Try After Sometime...'});
      }
      user.authentication_token=token;
      result=await user.save();
      delete result.password;
      resp.send({result});
   })
})
app.post("/login", async(req,resp)=>{
   if(req.body.password && req.body.email){
      console.log(req.body);
      let user =await User.findOne(req.body);
      console.log(user);
      if(user.person.password===req.body.password){
         Jwt.sign({user},jwtKey,{expiresIn:"2h"},(err,token)=>{
            if(err){
               resp.send({result:'Something Went Wrong Please Try After Sometime...'});
            }
            console.log(user);
            resp.send({user,auth:token});
         })
      }
      else{
         resp.send({result:'No user found'});
      }
   }
   else{
       resp.send({result:'No user found'});
   }
  
})

app.post("/reset", async(req,resp)=>{
   if(req.body.email){
      console.log(req.body);
      let user =await User.findOne(req.body);
      console.log(user);
      if(user.person.email===req.body.email){
         Jwt.sign({user},jwtKey,{expiresIn:"2h"},(err,token)=>{
            if(err){
               resp.send({result:'Something Went Wrong Please Try After Sometime...'});
            }
            resp.send({"msg":"We have sent you a password reset link to your email!"});
         })
      }
      else{
         resp.send({"msg":'No user found'});
      }
   }
   else{
       resp.send({"msg":'No user found'});
   }
  
})

 app.listen(5000);
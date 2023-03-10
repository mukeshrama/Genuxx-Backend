const express=require('express')
var cors = require('cors')

const Jwt=require('jsonwebtoken')
const jwtKey='Genux'

var app = express()
app.use(cors())
const dbconnection=require('./db/config')
const User=require('./db/User');
const DeletedUser=require('./db/DeletedUser');
app.use(express.json())

app.get("/passwordrequirements",async(req,res)=>{
   requiremnts={"require_lowercase": true,
   "last_x_passwords": 5,
   "require_number": true,
   "require_special": true,
   "max_chars": 1024,
   "require_uppercase": true,
   "min_chars": 8 } 
   res.send(requiremnts);
})

app.get("/",async(req,resp)=>{ 
   resp.send("connected");
})
app.post("/register",async(req,resp)=>{
   let person=req.body;
   let authentication_token="";
   let user=new User({authentication_token,person});
   let result= await user.save();
   result=result.toObject(); 
   Jwt.sign({result},jwtKey,{expiresIn:"2h"},async (err,token)=>{
      if(err){
         resp.send({result:'Something Went Wrong Please Try After Sometime...'});
      }
      user.authentication_token=token;
      result=await user.save();
      result=result.toObject(); 
      delete result.person.password;
      resp.send({result});
   })
})
app.post("/login", async(req,resp)=>{
   if(req.body.password && req.body.email){
      let user =await User.findOne({"person.email":{$regex:req.body.email}});
      if(user){
         if(user.person.password===req.body.password){
            Jwt.sign({user},jwtKey,{expiresIn:"2h"},async (err,token)=>{
               if(err){
                  resp.send({result:'Something Went Wrong Please Try After Sometime...'});
               } 
               const filter = { "person.email": req.body.email };
               const date={"person.updated_at":new Date()};
               const updated=await User.updateOne(filter,date);
               resp.send({user,auth:token});
            })
         }
         else{
            resp.send({result:"Email id and Password doesn't match"});
         }
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
      let user =await User.findOne(req.body);
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

app.get("/userlist",async (req, resp)=>{
   try{
      const limitValue = req.query.limit || 10;
      const skipValue = req.query.skip || 0;
      const userdata=await User.find().limit(limitValue).skip(skipValue);
      resp.send(userdata)
   }
   catch (e) {
         resp.send({"msg":'No user found'});
      }
})

app.get("/userlist/:key",async (req, resp)=>{
   try{
      const limitValue = req.query.limit || 10;
      const skipValue = req.query.skip || 0;
      const userdata=await User.find({
         "$or":[
                  {"person.display_name":{$regex:req.params.key}},
                  {"person.email":{$regex:req.params.key}}
               ]
      }).limit(limitValue).skip(skipValue);
      resp.send(userdata)
   }
   catch (e) {
         resp.send({"msg":'No user found'});
      }
})


app.get("/sortlist/:value",async (req, resp)=>{
   try{
      const limitValue = req.query.limit || 10;
      const skipValue = req.query.skip || 0;
      const value=req.params.value;
      const userdata=await User.find().sort({"person.display_name":value}).limit(limitValue).skip(skipValue)
      resp.send(userdata)
   }
   catch (e) {
         resp.send({"msg":'No user found'});
      }
})

app.delete('/deleteuser/:email',async (req, resp)=>{
   try{
      const userdata=await User.find({"person.email":req.params.email})
      if(Object.keys(userdata[0]).length!==0){
        const data=userdata[0];
        const deletedUser = await DeletedUser.insertMany(data);
        const user=await User.deleteOne({"person.email":req.params.email})
        if(user.acknowledged===true)
               resp.send({"msg":"Successfully Deleted"});
        else
            resp.send({"msg":'No user found'});
      }
   }
   catch (e) {
         resp.send({"msg":'No user found'});
      }
})

app.get('/deleteuserlist',async (req, resp)=>{
   try{
      const limitValue = req.query.limit || 10;
      const skipValue = req.query.skip || 0;
      const deletedUser=await DeletedUser.find().limit(limitValue).skip(skipValue);
      if(Object.keys(deletedUser[0]).length!==0){
        resp.send(deletedUser);
      }
      else
      resp.send({"msg":'No user found'});
   }
   catch (e) {
         resp.send({"msg":`Something went wrong ${e}`});
      }
})

var port=5000 || process.env.PORT;
 app.listen(port);
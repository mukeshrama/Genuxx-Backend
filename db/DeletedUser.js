const mongoose=require('mongoose');

const deleteduserSchema=new mongoose.Schema({
    authentication_token:String,
    person:{
    created_at:String,
    display_name:String,
    email:String,
    key:String,
    password:String,
    role:{
        key:String,
        rank:Number
    },
    updated_at:String
    }
});
module.exports=mongoose.model("deletedusers",deleteduserSchema);
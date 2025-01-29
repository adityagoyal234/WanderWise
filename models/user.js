const mongoose=require("mongoose");
const { use } = require("passport");
const Schema=mongoose.Schema;
const passportLocalMongoose=require("passport-local-mongoose")
userSchema=Schema({
    email:{
        type:String,
        required:true,
        unique:true,

    },  
});
userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', userSchema);
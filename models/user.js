const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email:{
        type:String,
        required:true,
        match: [/\S+@\S+\.\S+/, 'Please enter a valid email address'],
    },
});
//adds useful methods to mongoose model
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User",userSchema);
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email:{
        type: String,
        required: true,
        unique: true
    }
});
UserSchema.plugin(passportLocalMongoose);//加入用户名（确保其唯一性）和密码，和一些方法（详见doc）

module.exports = mongoose.model('User',UserSchema);
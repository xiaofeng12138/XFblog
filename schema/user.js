let { Schema } = require('./config');

let UserSchema = new Schema({
    username:String,
    password:String,
    role:{         //设置权限
        type:String,
        default:1
    },
    avatar:{
        type:String,
        default:'/avatar/default.jpg'
    },
    commentNum:Number,
    articleNum:Number
},{
    versionKey:false
})
//console.log(UserSchema);

module.exports = UserSchema;
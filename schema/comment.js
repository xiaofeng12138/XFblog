let { Schema } = require('./config');
let ObjectId = Schema.Types.ObjectId;

let CommentSchema = new Schema({
    //用户名 头像
    //文章
    //内容

    content:String,

    //关联用户表
    from:{
        type:ObjectId,
        ref:"users"
    }, 

    //关联article表
    article:{
        type:ObjectId,
        ref:"articles"
    }
},{
    versionKey:false,
    timestamps:{  //系统默认的创建时间
        createdAt:'created'
    }
})
//console.log(UserSchema);
//设置comment的 remove 钩子 

CommentSchema.post('remove',(doc)=>{
    //当前这个回调函数 一定会在remove 执行前触发
    let {db} = require('../schema/config');
    let ArticleSchema = require('../schema/article');
    let userSchema = require('../schema/user');
    let Article  = db.model('articles',ArticleSchema);
    let User  = db.model('users',userSchema);

    
    let { from ,article} = doc;
    Article.updateOne({_id:article},{$inc:{commentNum:-1}}).exec();
    User.updateOne({_id:from},{$inc:{commentNum:-1}}).exec();
    // console.log('1');
    // console.log(doc);
})


module.exports = CommentSchema;
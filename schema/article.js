let { Schema } = require('./config');
let ObjectId = Schema.Types.ObjectId;

let ArticleSchema = new Schema({
    title:String,
    content:String,
    author:{
        type:ObjectId,
        ref:"users"
    }, //关联users 表
    tips:String,
    commentNum:Number
},{
    versionKey:false,
    timestamps:{  //系统默认的创建时间
        createdAt:'created'
    }
})
//console.log(UserSchema);

//设置comment的 remove 钩子 

ArticleSchema.post('remove',doc =>{
    //当前这个回调函数 一定会在remove 执行前触发
    let {db} = require('../schema/config');
    let userSchema = require('../schema/user');
    let commentSchema = require('../schema/comment');
    let User  = db.model('users',userSchema);
    let Comment = db.model('comments',commentSchema);

    
    let { _id:artId , author:authorId} = doc;
    //只需要用户的artiNum -1
    User.findByIdAndUpdate(authorId, {$inc: {articleNum: -1}}).exec()
  // 把当前需要删除的文章所关联的所有评论  一次调用 评论 remove
    Comment.find({article: artId})
    .then(data => {
      data.forEach(v => v.remove())
    })
})

module.exports = ArticleSchema;
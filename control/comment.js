let {db} = require('../schema/config')
let ArticleSchema = require('../schema/article')

let userSchema = require('../schema/user')
let commentSchema = require('../schema/comment')

//通过db对象创建一个 操作user的模型对象
let Article  = db.model('articles',ArticleSchema);
let User  = db.model('users',userSchema);
let Comment  = db.model('comments',commentSchema);
// const User = require('../Modelsss/user');
// const Article = require('../Modelsss/articls');
// const Comment = require('../Modelsss/comment');
// 保存评论
exports.save = async ctx=>{
    
 let message = {
     status:0,
     msg:'先登录，才能评论'
 }
    // 表示用户未登录
   if(ctx.session.isNew) return ctx.body = message;
  
   //用户已登录
   let data = ctx.request.body;
   //添加一个自定义属性from属性
   data.from = ctx.session.uid;
   //console.log(ctx.session.uid)

   let _comment = new Comment(data)

   await _comment
   .save()
   .then(data=>{
       message = {
        status:1,
        msg:'评论成功'
       }

       //更新评论功能
       Article
       .update({_id:data.article},{$inc:{commentNum:1}},err=>{
           if(err){return console.log(err)}
          console.log('计数器更新成功')
       })
   })

    //文章计数加1
    User.update({_id:data.from},{$inc:{commentNum:1}},err=>{
        if(err) return console.log(err);
    })

   
   .catch(err=>{
    message = {
        status:0,
        msg:err
       }
   })
   ctx.body = message;
}

//查询用户所有评论
exports.comlist = async ctx=>{
   let uid = ctx.session.uid;
   let data =  await Comment.find({from:uid}).populate('article','title') ;
   ctx.body={
    code:0,
    count:data.length,
    data:data
  }
}

//删除对应ID的评论
exports.del = async ctx=>{
let commentId = ctx.params.id;
   let res ={
       state:1,
       message:'删除成功'
   }

   await Comment.findById(commentId)
   .then(data =>data.remove())
   .catch(err=>{
       res ={
       state:0,
       message:'删除失败'
     }
   })
   ctx.body = res;
} 


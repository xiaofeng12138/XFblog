let {db} = require('../schema/config')
let ArticleSchema = require('../schema/article')
let userSchema = require('../schema/user')
let commentSchema = require('../schema/comment')

//通过db对象创建一个 操作user的模型对象
let Article  = db.model('articles',ArticleSchema);
let User  = db.model('users',userSchema);
let Comment  = db.model('comments',commentSchema);

let fs = require('fs');
let {join} = require('path');


//返回后台页面
exports.index = async ctx=>{
    if(ctx.session.isNew){
        //表示用户未登录
        ctx.status ='404';
        return ctx.render('404',{
            title:'404'
        })
    }

    let id = ctx.params.id;
    let arr = fs.readdirSync(join(__dirname,'../views/admin'));
   // console.log(arr);
   let flag = false;
   arr.forEach( v=>{
       let name = v.replace(/^(admin\-)|(\.pug)$/g,'')
       if(name === id){
           flag = true;
       }
   })
  if(flag){
   await ctx.render('./admin/admin-'+ id,{
       role:ctx.session.role
   })
  }else{ //表示页面不存在
    ctx.status ='404';
    return ctx.render('404',{
        title:'404'
    })
  }
}
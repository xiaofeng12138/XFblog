let {db} = require('../schema/config')
let ArticleSchema = require('../schema/article')

let userSchema = require('../schema/user')

//通过db对象创建一个 操作user的模型对象
let Article  = db.model('articles',ArticleSchema);
let User  = db.model('users',userSchema);

let commentSchema = require('../schema/comment')
let Comment  = db.model('comments',commentSchema);

//返回文章的发表页
exports.addPage = async ctx =>{
    await ctx.render('add-article',{
        title:'文章发表页面',
        session:ctx.session
    });
}

//文章发表  保存到数据库

exports.add = async ctx=>{
    if(ctx.session.isNew){
        //true 表示用户未登录 无法发布
        return ctx.body ={
            msg:'用户未登录',
            status:0
        }
    }
    //用户登录情况下 post发过来的数据
    let data = ctx.request.body;
    data.author = ctx.session.uid;
    data.commentNum = 0;


    await new Promise((resolve,reject)=>{
        new Article(data).save((err,data)=>{
            if(err) return reject(err);

            //文章计数加1
            User.update({_id:data.author},{$inc:{articleNum:1}},err=>{
                if(err) return console.log(err);
            })

            resolve(data)
        })
    })

    .then( data=>{
        ctx.body={
            msg:'发表成功(´･ω･`)',
            status:1
        }
    })
    .catch(err=>{
        ctx.body={
            msg:'发表失败',
            status:0
        }
    })
}

//获取文章列表模块
exports.getList = async ctx=>{
  //查询每篇文章的作者，拿到相应的头像
  let page = ctx.params.id || 1;
  page--;
  const maxNum = await Article.estimatedDocumentCount((err,num)=>err? console.log(err):num)
  let data = await Article
  .find()
  .sort('-created')  //文章的排序方式
  .skip(5 * page)     //跳过多少页
  .limit(5)         //每页显示几条
  .populate({
      path:'author',  //制定对应表的属性
      select:'username _id avatar'  //属性里的哪些值
  })   //mongoose 用于连表查询

  .then( data =>data)
  .catch(err=>{
      console.log(err)
  })


 await ctx.render('index',{
     session:ctx.session,
     title:'XiaoFeng Blog',
     artList:data,
     maxNum,
 })
}

//获取文章详情模块
exports.details = async ctx=>{
let _id = ctx.params.id;

//查找文章本身数据  
let article =  await Article
 .findById(_id)
 .populate('author','username')
 .then(data => data)



 //查找跟当前文章所有的相关评论
 let comment = await Comment
 .find({article:_id}) //通过文章id 查询到哪篇文章
 .sort('-created')  // 评论排序
 .populate('from','username avatar')
 .then(data => data)
 .catch(err=>{
     console.log(err);
 })

 //console.log(article);
 //渲染文章详情页面
 await ctx.render('article',{
     title :article.title,
     session:ctx.session,
     article:article,
     comment:comment
 })
}

//返回用户所有文章

exports.artlist = async cxt=>{
  let uid = cxt.session.uid;
  let data = await Article.find({author:uid});
  cxt.body={
      code:0,
      count:data.length,
      data:data
  }
}


//删除对应ID所对应的文章

exports.del = async ctx => {
    const _id = ctx.params.id
    
    let res = {
      state: 1,
      message: "删除成功"
    }
  
    await Article.findById(_id)
      .then(data => data.remove())
      .catch(err => {
        res = {
          state: 0,
          message: err
        }
      })
    ctx.body = res
  }
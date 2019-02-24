let Router = require('koa-router')
let router = new Router();
let user = require('../control/user')
let article = require('../control/article')
let comment = require('../control/comment')
let admin = require('../control/admin')
let upload = require('../util/upload')

router.get('/', user.keepLog, article.getList)

//注册部分

//router.get('/user/:id',async(ctx)=>{
// 动态路由
//ctx.body = ctx.params.id;
//  let show = ctx.path;
//  console.log(show);
//  if(ctx.params.id ==='login'){
//      await ctx.render('register');
// }
//})

//处理用户登录 注册的 页面
router.get(/^\/user\/(?=reg|login)/, async (ctx) => {  //使用正则判断路由
    //show 位true 则显示注册页面  false 显示登录页面
    let show = /reg$/.test(ctx.path);
    await ctx.render('register', { show: show })  //属性名和内容相同时可简写
})

//处理用户登录功能  post请求
router.post('/user/login', user.login)

//处理用户注册功能  post请求
router.post('/user/reg', user.reg)

//用户退出模块
router.get('/user/logout', user.logout)

//文章发表模块
router.get('/article', user.keepLog, article.addPage)

//文章发布的监听
router.post('/article', user.keepLog, article.add)

//文章发布模块
router.get('/page/:id', article.getList)

//文章详情页面 路由
router.get('/article/:id', user.keepLog, article.details);

//发表评论页面 路由
router.post('/comment', user.keepLog, comment.save)


//后台用户中心管理
router.get('/admin/:id', user.keepLog, admin.index)

//头像上传功能

router.post('/upload', user.keepLog, upload.single("file"), user.upload);

//获取用户所有的评论
router.get('/user/comments', user.keepLog, comment.comlist);

//后台：删除用户评论
router.del('/comment/:id', user.keepLog, comment.del)

//获取用户所有的文章
router.get('/user/articles', user.keepLog, article.artlist);

//后台：删除用户文章
router.del('/article/:id', user.keepLog, article.del);

//获取所有用户的路由
router.get('/user/users', user.keepLog, user.uesrList);









//404页面
router.get('*', async ctx => {
    await ctx.render('404', {
        title: 404
    })
})


module.exports = router;
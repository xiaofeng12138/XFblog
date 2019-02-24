let Koa = require('koa');
let router = require('./routers/router');
let static = require('koa-static');
let views = require('koa-views');
let logger = require('koa-logger'); //日志文件
let { join } = require('path');
let session = require('koa-session');
let body = require('koa-body');

//实例化koa
let app = new Koa();

app.keys = ['晓风哥哥'] //session 的签名配置

//session 的配置对象
const CONFIG = {
    key: 'Sid',
    maxAge: 36e5,
    overwrite: true,
    httpOnly: true,
    signed: true,
    rolling: true   //过期时间
}
//设置日志监听
//app.use(logger());

//注册session
app.use(session(CONFIG, app))

//配置post请求
app.use(body());

//设置静态资源目录
app.use(static(join(__dirname, 'public')));

//配置视图模板
app.use(views(join(__dirname, 'views'), {
    extension: "pug"
}))
app.use(router.routes()).use(router.allowedMethods());
app.listen('3000', () => {
    console.log('项目启动成功，监听在3000端口');
})

//创建管理员用户 ，如果管理员已存在 则返回
{
    let { db } = require('./schema/config')
    let userSchema = require('./schema/user')
    let encrpt = require('./util/encrypt')
    let User = db.model('users', userSchema);

    User.find({ username: 'xiaofeng' })
        .then(data => {
            if (data.length === 0) {
                //表示管理员不存在，需要创建
                new User({
                    username: 'xiaofeng',
                    password: encrpt("xiaofeng"),
                    role: 666,
                    commentNum: 0,
                    articleNum: 0
                })
                    .save()
                    .then(data => {
                        console.log('管理员用户创建成功！！');
                    })
                    .catch(err => {
                        console.log('管理员账号检查失败，请重试！！');
                    })
            } else {
                console.log('管理员用户已存在！！');
            }
        })
}





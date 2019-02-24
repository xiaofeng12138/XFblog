let { db } = require('../schema/config')
let userSchema = require('../schema/user')
let encrpt = require('../util/encrypt')

//通过db对象创建一个 操作user的模型对象
let User = db.model('users', userSchema);

//用户注册功能
exports.reg = async ctx => {
    let user = ctx.request.body;
    let username = user.username;
    let password = user.password;
    //console.log(username)
    await new Promise((resolve, rejcect) => {
        //去users表里查询数据 是否存在
        User.find({ username }, (err, data) => {

            if (err) return rejcect(err);
            if (data.length !== 0) {
                // 查询到数据 说明用户名已存在  return
                return resolve('');
            }

            //用户名不存在需存到数据库里面  存入之前需要加密
            //encrpt 是自定义的加密模块
            let _user = new User({
                username,
                password: encrpt(password),
                commentNum: 0,
                articleNum: 0

            })
            _user.save((err, data) => {
                if (err) {
                    rejcect(err);
                }
                else {
                    resolve(data);
                }
            })
        })
    })

        .then(async data => {
            console.log(data)
            if (data) {
                //注册成功
                await ctx.render('isOk', {
                    status: '注册成功'
                })
            } else {
                //用户名已存在
                await ctx.render('isOk', {
                    status: '用户名已存在，请重新输入'
                })
            }
        })

        .catch(async err => {
            await ctx.render('isOk', {
                status: '注册失败，请重试'
            })
        })
}

//用户登录操作
exports.login = async ctx => {
    let user = ctx.request.body;
    let username = user.username;
    let password = user.password;
    await new Promise((resolve, rejcect) => {
        User.find({ username }, (err, data) => {
            if (err) return rejcect(err);
            if (data.length === 0) {
                return rejcect('用户名不存在')
            }

            //把用户加密后的密码 和数据库进行对比
            if (data[0].password === encrpt(password)) {
                return resolve(data);
            }
            resolve('');
        })
    })

        .then(async data => {
            if (!data) {
                return ctx.render('isOk', {
                    status: "密码不正确，登录失败"
                })
            }

            //让用户在他的cookie 里设置 username password 加密后的密码  权限
            ctx.cookies.set('username', username, {
                domain: 'localhost',
                path: '/',
                maxAge: 36e5,
                httpOnly: false, //客户端能否访问cookies值
                overwrite: false,
                //singed:true  singed 默认值是true
            })

            //用户在数据库中的_id值
            ctx.cookies.set('uid', data[0]._id, {
                domain: 'localhost',
                path: '/',
                maxAge: 36e5,
                httpOnly: false, //客户端能否访问cookies值
                overwrite: false,
                //singed:true
            })

            ctx.session = {
                username,
                uid: data[0]._id,
                avatar: data[0].avatar,
                role: data[0].role
            }


            //登录成功
            await ctx.render('isOk', {
                status: "登陆成功"
            })
        })


        .catch(async err => {
            await ctx.render("isOk", {
                status: "登录失败"
            })
        })
}

//确定用户状态
exports.keepLog = async (ctx, next) => {
    if (ctx.session.isNew) {
        if (ctx.cookies.get('username')) {

            //更新用户头像
            let uid = ctx.session.get('uid')
            let avatar = await User.findById(uid)
                .then(data => data.avatar)

            ctx.session = {
                username: ctx.cookies.get('username'),
                uid: ctx.cookies.get('uid'),
                avatar
            }
        }
    } // true 表示用户没有登录
    await next();
}

//用户退出中间件
exports.logout = async ctx => {
    ctx.session = null;
    ctx.cookies.set('username', null, {
        maxAge: 0
    })
    ctx.cookies.set('uid', null, {
        maxAge: 0
    })
    //后台重定向到 根路径
    ctx.redirect('/');
}

//用户头像上传

exports.upload = async ctx => {
    let filename = ctx.req.file.filename;
    let data = {};
    await User.update({ _id: ctx.session.uid }, { $set: { avatar: '/avatar/' + filename } }, (err, res) => {
        if (err) {
            data = {
                status: 0,
                message: err
            }
        } else {
            data = {
                status: 1,
                message: '上传成功'
            }
        }
    })
    //console.log(data);
    ctx.body = data
}

//后台：查询所有用户 并返回数据
exports.uesrList = async ctx => {
    let uid = User.users.find();


    console.log(uid)
    let data = await User.find({ username: uid });
    ctx.body = {
        code: 0,
        count: data.length,
        data
    }
}

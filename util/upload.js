let multer = require('koa-multer')
let {join} = require('path')


let storage = multer.diskStorage({
    //配置图片存储位置
 destination:join(__dirname,'../public/avatar'),
 
 //图片的命名
 filename(req,file,cb){
   let filename  =file.originalname.split('.');
   cb(null, `${Date.now()}.${filename[filename.length - 1]}`)
  }
})

module.exports = multer({storage});
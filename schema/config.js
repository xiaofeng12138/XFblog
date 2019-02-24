//连接数据库，导出Scheam 
let mongoose = require('mongoose')
let db = mongoose.createConnection(
    "mongodb://localhost:27017/xiaofeng",{useNewUrlParser:true}
)
//用原生promise去覆盖mon自实现的promise
mongoose.Promise = global.Promise;
db.on("error",()=>{
    console.log("XiaoFeng数据库链接失败");
});
db.on('open',()=>{
    console.log("XiaoFeng数据库链接成功");
})

//把mongoose的Schema取出来
let Schema = mongoose.Schema;

module.exports = {
    db,
    Schema
}

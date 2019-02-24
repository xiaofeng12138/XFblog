//加密模块
let crypto = require('crypto')

module.exports = function(password,key='xiao feng ge ge'){ //key值自定义 随意
   let hmac = crypto.createHmac('sha256',key);
   hmac.update(password);
   let passwordHmac = hmac.digest('hex'); // hex导出一个16进制的密码
   return passwordHmac;
}
'use strict'
var path = require('path')
var util = require('./libs/util')
var wechat_file = path.join(__dirname,'./config/wechat.txt')
var config = {
    wechat:{
        appID:'wx2f69f6f6f56ff868',
        appSecret:'02d097d20cc1e306512907d15c445833',
        Token:'odoakspdokdpoawkesdkwlkes',
        getAccessToken: function(){ 
            return util.readFileAsync(wechat_file)
        },
        saveAccessToken: function(data){
            var data = JSON.stringify(data)
            return util.writeFileAsync(wechat_file,data)
        }
    }
    
}
module.exports = config
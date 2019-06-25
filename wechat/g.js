'use strict'
// 与微信交互的中间件
var sha1 = require('sha1')
var getRowBody = require('raw-body')
var Wechat = require('./wechat')
var util = require('./util')
//  1. 与微信确认连接  2. 与微信通话

// 票据存储 构造函数 
module.exports = function(config,handler){
    var wechat = new Wechat(config)
    
    return function *(next){
        // console.log(this.query)
        var token = config.Token
        var that = this;
        var signature= this.query.signature
        var nonce= this.query.nonce
        var timestamp = this.query.timestamp
        var echostr  = this.query.echostr
        var str = [token,timestamp,nonce].sort().join('')
        var sha = sha1(str)
        if(this.method ==='GET'){
            console.log('get')
            if(sha == signature){
                this.body = echostr+''
            } else {
                this.body = 'wrong'
            }
        } 
        else if(this.method ==='POST'){
            if(sha !== signature){
                this.body = 'wrong'
                return false
            } 
            var data = yield getRowBody(this.req,{
                length: this.length,
                limit:'lmb',
                encoding: this.charset
            })
            // console.log(data.toString())
            var content = yield util.parseXMLAsync(data)
            // console.log(content)
            var message = util.formatMessage(content.xml)
            console.log(message)

            this.weixin = message //挂载消息
            yield handler.call(this,next) // 转到业务层逻辑

            wechat.reply.call(this) // 真正回复
            // if(message.MsgType ===  'event'){
            //     if(message.Event === 'subscribe'){
            //         var now = new Date().getTime()
            //         that.status = 200;
            //         that.type = 'application/xml'
            //         that.body =xml;
            //       return;
            //     }
            // }


        }
        
    }
}


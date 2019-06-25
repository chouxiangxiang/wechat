'use strict'
var config = require('./config')
var Wechat = require('./wechat/wechat')
var wechatApi = new Wechat(config.wechat)

exports.reply = function *(next){
    var message = this.weixin
    if(message.MsgType==='event'){
        if(message.Event === 'subscribe'){
            console.log('扫二维码进来' + message.EventKey+' '+ message.ticket)
            if(message.EventKey ){
                console.log('扫二维码进来' + message.EventKey+' '+ message.ticket)
            }
            this.body = '哈哈，你订阅了这个号'
        } 
        else if(message.Event === 'unsubscribe'){
            console.log('无情取关')
            this.body = ''
        }
        else if(message.Event === 'LOCATION'){
            this.body = '您上报的位置是'+ message.Latitude+'/' +message.Longitude +"-" +message.Precision
        }
        else if (message.Event === 'CLICK'){
            this.body = "您点击了菜单： " + message.EventKey
        }
        else if(message.Event === 'SCAN'){
            console.log('关注后扫二维码' + message.EventKey+' '+message.Ticket)
            this.body = '看到你扫了一下哦'
        }
        else if (message.Event === 'VIEW'){
            this.body = '您点击了菜单中的链接： ' + message.EventKey
        }
    }
    else if (message.MsgType === 'text'){
         var content = message.Content
         var reply = '你说的 ' +message.Content + '太复杂了'
         if(content === '1'){
             reply = '天下第一吃大米'
         }
         else if (content === '2'){
            reply = '天下第二吃大米'
         } else if (content === '3'){
             reply = [{
                 title: '技术改变世界',
                description: '描述描述描述',
                url: 'www.baidu.com',
                picurl: 'http://ww2.sinaimg.cn/large/bd698b0fjw1eev97qkg05j20dw092dg3.jpg'
             },{
                title: 'node开发',
               description: '描述描述描述',
               url: 'https://nodejs.org',
               picurl: 'http://upload.qqbody.com/allimg/1611/1203245I7-8.jpg'
            }]
         } else if(content === '5'){
             var data = yield wechatApi.uploadMaterial('image',__dirname+'/2.jpg')
             
             reply = {
                 type: 'image',
                  mediaId: data.media_id
             }
         } else if(content === '4'){
            var data = yield wechatApi.uploadMaterial('video',__dirname+'/4.mp4')
            console.log(data)
            reply = {
                type: 'video',
                title:'视频',
                description:'ok',
                 mediaId: data.media_id
            }
        }else if(content === '6'){
            var data = yield wechatApi.uploadMaterial('image',__dirname+'/2.jpg')
            console.log(data)
            reply = {
                type: 'music',
                title:'音乐',
                description:'ok',
                musicUrl:'http://dl.stream.qqmusic.qq.com/M500001eZEDg0PG4dy.mp3?vkey=5CD4FCF2325E690900A8CB9A1ADB455889777C4A2786A40BFBE8731433E84A192AF3A98459B458FDED070389A98398EFCD9D32BA655F13B4&guid=5150825362&fromtag=1',
                ThumbMediaId: data.media_id,
            }
        }
         this.body = reply
    }
    yield next
}
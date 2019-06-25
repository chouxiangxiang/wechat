'use strict'
var fs = require('fs')
var prefix = "https://api.weixin.qq.com/cgi-bin/"
var api = {
    accessToken:prefix+ "token?grant_type=client_credential",
    temporary:{//临时素材上传
        upload: prefix+ "media/upload?",
        fetch: prefix + 'media/get?',
    },
    
    permanent:{
        uploadNews: prefix+'material/add_news?',
        uploadNewsPic: prefix+"media/uploadimg?",
        upload:prefix+'material/add_material?',
        fetch: prefix + 'material/get_material?',
        del: prefix + 'material/del_material?',

    },//永久素材上传
}
var Promise = require('bluebird')
var util = require('./util')
var _ = require('lodash')
var request = Promise.promisify(require('request'))
// 票据存储 构造函数 读取文件
function Wechat(opts){
    
    this.appID = opts.appID
    this.appSecret = opts.appSecret
    this.getAccessToken = opts.getAccessToken
    this.saveAccessToken = opts.saveAccessToken
    this.fetchAccessToken()
}
Wechat.prototype.fetchAccessToken = function(data){
    var that = this
    if(this.access_token && this.expires_in){
        if(this.isValidAccessToken(this)){
            return Promise.resolve(this)
        }
    }
    this.getAccessToken().then(function(data){
        
        try{
            data = JSON.parse(data)
        }
        catch(e){
            // 获取出了问题 重新获取
            return that.updateAccessToken(data)
        }
        if(that.isValidAccessToken(data)){
            // 获取有效
            that.access_token = data.access_token
        that.expires_in = data.expires_in
        that.saveAccessToken(data)
            return Promise.resolve(data)
        } else{
            return that.updateAccessToken
        }
    })
    .then(function(data){
        console.log(data)
        that.access_token = data.access_token
        that.expires_in = data.expires_in
        that.saveAccessToken(data)
        return Promise.resolve(data)
    })
}
Wechat.prototype.isValidAccessToken = function(data){
    if(!data||!data.access_token||!data.expires_in){
        return false
    }
    var access_token = data.access_token
    var expires_in = data.expires_in
    var now = (new Date().getTime())
    if (now <expires_in) {
        return true
    } else {
        return false
    }
}

Wechat.prototype.updateAccessToken = function(data){
    var appID = this.appID
    var appSecret=this.appSecret 
    var url = api.accessToken+ '&appid='+appID+'&secret='+appSecret
    return new Promise(function(resolve,reject){
        // request({url:url,json:true}).then(function( response){
        //     var data = response[1];
        //     var now = (new Date().getTime())
        //     var expires_in = now+ (data.expires_in - 20)*1000
        //     data.expires_in = expires_in
        //     resolve(data)
        // })
        request({url: url, json: true}, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                var data = body;
                var now = (new Date().getTime());
                var expires_in = now + (data.expires_in - 20) * 1000;
                data.expires_in = expires_in;
                resolve(data);
                // console.log(data);
                console.log("更新了。。")
            } else {
                reject()
            }
        });
    })
    
    
}
Wechat.prototype.reply = function(){
    var content = this.body
    var message = this.weixin
    var xml = util.tpl(content,message)
    this.status = 200
    this.type='application/xml'
    this.body = xml
}
Wechat.prototype.uploadMaterial = function(type,filepath,permanent){
    var form = {
        media: fs.createReadStream(filepath)
    }
    var uploadUrl = api.temporary.upload
    if(permanent){
        uploadUrl = api.permanent[permanent]
        _.extend(form, permanent)
        console.log(uploadUrl)
        if (type === 'pic'){
            uploadUrl  = api.permanent.uploadNewsPic
        }
        if (type === 'news'){
            uploadUrl  = api.permanent.uploadNews
            form = filepath
        } else {
            form.media = fs.createReadStream(filepath)
        }
    }
    
    
    var that = this
    return new Promise(function(resolve,reject){
        that.fetchAccessToken()
        .then(function(data){
            var url = uploadUrl + 'access_token=' + data.access_token
            if(!permanent){
                url+= '&type=' + type
            } else {
                form.access_token = data.access_token
            }
            var options = {
                method:"POST",
                url:url,
                json:true
            }
            if(type === "news"){
                options.body = form
            }
            else{
                options.formData = form
            }
            request({method:'POST',url: url, formData: form, json: true}, function (error, response, body) {
                if (!error && response.statusCode === 200) {
                    var _data = body;
                   if(_data){
                       resolve(_data);
                   } else {
                       throw new Error('Upload material fails')
                   }
                    
                    // console.log(data);
                    console.log("上传了。。")
                } else {
                    throw new Error('Upload material fails2')
                    reject()
                }
            }).catch(function(err){
                reject(err)
            });
        })
        
    })
}
Wechat.prototype.fetchMaterial = function(mediaId,type,permanent){
    var form = {
    }
    var fetchUrl = api.temporary.fetch
    if(permanent){
        fetchUrl = api.permanent.fetch
    } 
    var that = this
    return new Promise(function(resolve,reject){
        that.fetchAccessToken()
        .then(function(data){
            var url = fetchUrl + 'access_token=' + data.access_token + "&media_id=" +mediaId
            if(!permanent){
                // https
                var options = {
                    method:"POST",
                    url:url,
                    json:true
                }
                if(type === 'video'){
                    url = url.replace('https://', 'http://')
                }
            } else {
                var options = {
                    method:"GET",
                    url:url,
                    json:true
                }
            }
            request(options, function (error, response, body) {
                if (!error && response.statusCode === 200) {
                    var _data = body;
                   if(_data){
                       resolve(_data);
                   } else {
                       throw new Error('Upload material fails')
                   }
                    
                    // console.log(data);
                    console.log("获取信息。。")
                } else {
                    throw new Error('Upload material fails2')
                    reject()
                }
            }).catch(function(err){
                reject(err)
            });
        })
        
    })
}
module.exports = Wechat